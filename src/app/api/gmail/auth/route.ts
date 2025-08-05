import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGmailAuthUrl } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUrl = getGmailAuthUrl(userId);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication URL' },
      { status: 500 }
    );
  }
}
