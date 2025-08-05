import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  generateJobInsights,
  suggestApplicationImprovements
} from '@/lib/gemini';
import JobApplication from '@/models/JobApplication';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const jobs = await JobApplication.find({ userId })
      .sort({ applicationDate: -1 })
      .limit(50)
      .lean();

    if (jobs.length === 0) {
      return NextResponse.json({
        insights:
          'No job applications found. Start by adding your first job application to get personalized insights!'
      });
    }

    const insights = await generateJobInsights(jobs);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
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
    const { company, position, notes } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' },
        { status: 400 }
      );
    }

    const suggestions = await suggestApplicationImprovements(
      company,
      position,
      notes
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
