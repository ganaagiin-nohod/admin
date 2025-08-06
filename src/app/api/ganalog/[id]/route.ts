import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import DailyLog, { IDailyLog } from '@/models/DailyLog';
import { generateDaySummary } from '@/lib/gemini-ganalog';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const log = (await DailyLog.findById(id).lean()) as IDailyLog | null;

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    if (!log.isPublic) {
      const { userId } = await auth();
      if (!userId || log.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error fetching daily log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily log' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, data } = body;

    await connectToDatabase();

    const log = await DailyLog.findById(id);
    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    if (log.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'toggle_challenge':
        const challenge = log.challenges.id(data.challengeId);
        if (challenge) {
          challenge.completed = !challenge.completed;
          challenge.completedAt = challenge.completed ? new Date() : undefined;
        }
        break;

      case 'add_entry':
        log.entries.push({
          id: uuidv4(),
          type: data.type,
          content: data.content,
          mediaUrl: data.mediaUrl,
          timestamp: new Date()
        });
        break;

      case 'generate_summary':
        const summary = await generateDaySummary({
          challenges: log.challenges,
          entries: log.entries,
          date: log.date
        });
        log.summary = summary;
        break;

      case 'add_reaction':
        log.reactions = log.reactions.filter(
          (r: { userId: string }) => r.userId !== userId
        );
        log.reactions.push({
          userId,
          type: data.type,
          timestamp: new Date()
        });
        break;

      case 'add_comment':
        log.comments.push({
          id: uuidv4(),
          userId,
          username: data.username,
          content: data.content,
          timestamp: new Date()
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await log.save();
    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to update daily log' },
      { status: 500 }
    );
  }
}
