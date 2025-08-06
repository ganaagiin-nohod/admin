import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import { suggestChallenges } from '@/lib/gemini-ganalog';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const recentLogs = await DailyLog.find({ userId })
      .sort({ date: -1 })
      .limit(7)
      .select('challenges')
      .lean();

    const recentChallenges = recentLogs
      .flatMap((log) => log.challenges.map((c: { text: any }) => c.text))
      .slice(0, 20);

    const suggestions = await suggestChallenges(recentChallenges);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating challenge suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
