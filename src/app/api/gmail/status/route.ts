import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isGmailConnected, disconnectGmail } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connected = await isGmailConnected(userId);

    return NextResponse.json({ connected });
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    return NextResponse.json(
      { error: 'Failed to check Gmail connection status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await disconnectGmail(userId);

    return NextResponse.json({ message: 'Gmail disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Gmail:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Gmail' },
      { status: 500 }
    );
  }
}
