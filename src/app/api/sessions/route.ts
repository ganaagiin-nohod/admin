import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import CollaborationSession from '@/models/CollaborationSession';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, language = 'javascript' } = await request.json();

    await connectToDatabase();

    const session = new CollaborationSession({
      name,
      createdBy: userId,
      language,
      participants: [
        {
          id: userId,
          name: 'Creator',
          email: '',
          joinedAt: new Date()
        }
      ]
    });

    await session.save();

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const sessions = await CollaborationSession.find({
      $or: [{ createdBy: userId }, { 'participants.id': userId }],
      isActive: true
    }).sort({ updatedAt: -1 });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
