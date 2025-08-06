import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import JobApplication from '@/models/JobApplication';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const jobApplications = await JobApplication.find({
      userId,
      applicationDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).lean();

    const dailyLog = await DailyLog.findOne({
      userId,
      date: startOfDay
    }).lean();

    return NextResponse.json({
      jobApplications,
      dailyLog,
      suggestions: generateJobChallenges(jobApplications)
    });
  } catch (error) {
    console.error('Error fetching jobs integration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration data' },
      { status: 500 }
    );
  }
}

function generateJobChallenges(jobApplications: any[]): string[] {
  const challenges = [];

  if (jobApplications.length > 0) {
    challenges.push(
      `Follow up on ${jobApplications.length} job application${jobApplications.length > 1 ? 's' : ''}`
    );

    const interviewApps = jobApplications.filter(
      (app) => app.status === 'interview'
    );
    if (interviewApps.length > 0) {
      challenges.push(
        `Prepare for ${interviewApps.length} upcoming interview${interviewApps.length > 1 ? 's' : ''}`
      );
    }

    challenges.push('Research one new company to apply to');
    challenges.push('Update resume or LinkedIn profile');
  } else {
    challenges.push('Apply to 3 new job positions');
    challenges.push('Update LinkedIn profile and network');
    challenges.push('Practice coding/interview questions for 30 minutes');
  }

  return challenges;
}
