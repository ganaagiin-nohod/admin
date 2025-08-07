import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        '/dashboard/ganalog?spotify_error=access_denied'
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        '/dashboard/ganalog?spotify_error=invalid_callback'
      );
    }

    const { userId } = await auth();

    if (!userId || userId !== state) {
      return NextResponse.redirect(
        '/dashboard/ganalog?spotify_error=invalid_state'
      );
    }

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
        })
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    const spotifyUser = await userResponse.json();

    await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      privateMetadata: {
        spotify: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          userId: spotifyUser.id,
          displayName: spotifyUser.display_name,
          email: spotifyUser.email,
          connectedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.redirect('/dashboard/ganalog?spotify_connected=true');
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    return NextResponse.redirect(
      '/dashboard/ganalog?spotify_error=callback_failed'
    );
  }
}
