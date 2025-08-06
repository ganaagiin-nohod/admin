import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateAIAssistance } from '@/lib/gemini';
import { connectToDatabase } from '@/lib/mongodb';
import CollaborationSession from '@/models/CollaborationSession';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const { prompt, selectedCode, action } = await request.json();

    await connectToDatabase();

    const session = await CollaborationSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    let aiPrompt = '';

    switch (action) {
      case 'explain':
        aiPrompt = `Explain this code in simple terms:\n\n${selectedCode}`;
        break;
      case 'refactor':
        aiPrompt = `Refactor this code to make it cleaner and more efficient:\n\n${selectedCode}`;
        break;
      case 'debug':
        aiPrompt = `Help debug this code and suggest fixes:\n\n${selectedCode}`;
        break;
      case 'complete':
        aiPrompt = `Complete this code snippet:\n\n${selectedCode}`;
        break;
      default:
        aiPrompt = `${prompt}\n\nCode context:\n${selectedCode}`;
    }

    const response = await generateAIAssistance(aiPrompt);
    await CollaborationSession.findByIdAndUpdate(id, {
      $push: {
        chatHistory: {
          userId: 'ai',
          userName: 'Gemini Assistant',
          message: response,
          type: 'ai',
          timestamp: new Date()
        }
      }
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error with AI assist:', error);
    return NextResponse.json(
      { error: 'Failed to get AI assistance' },
      { status: 500 }
    );
  }
}
