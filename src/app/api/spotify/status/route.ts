import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSpotifyConnected, getCurrentlyPlaying } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connected = await isSpotifyConnected();
    let currentlyPlaying = null;

    if (connected) {
      try {
        currentlyPlaying = await getCurrentlyPlaying();
      } catch (error) {
        console.error('Error fetching currently playing:', error);
      }
    }

    return NextResponse.json({
      connected,
      currentlyPlaying
    });
  } catch (error) {
    console.error('Error checking Spotify status:', error);
    return NextResponse.json(
      { error: 'Failed to check Spotify status' },
      { status: 500 }
    );
  }
}
