import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    const targetUserId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToDatabase();

    let query: any = {};

    if (isPublic) {
      query.isPublic = true;
      if (targetUserId) {
        query.userId = targetUserId;
      }
    } else {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      query.userId = userId;
    }

    const logs = await DailyLog.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, challenges, isPublic = true, playlist } = body;

    await connectToDatabase();

    const existingLog = await DailyLog.findOne({
      userId,
      date: new Date(date)
    });

    if (existingLog) {
      return NextResponse.json(
        { error: 'Log already exists for this date' },
        { status: 400 }
      );
    }

    const dailyLog = new DailyLog({
      userId,
      date: new Date(date),
      challenges: challenges.map((text: string, index: number) => ({
        id: `challenge-${index}`,
        text,
        completed: false
      })),
      entries: [],
      isPublic,
      playlist: playlist || undefined
    });

    await dailyLog.save();

    return NextResponse.json({ log: dailyLog });
  } catch (error) {
    console.error('Error creating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to create daily log' },
      { status: 500 }
    );
  }
}
