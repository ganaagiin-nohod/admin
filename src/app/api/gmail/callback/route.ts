import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Gmail OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/jobs?gmail_error=access_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/jobs?gmail_error=missing_params', request.url)
      );
    }

    await exchangeCodeForTokens(code, state);

    return NextResponse.redirect(
      new URL('/dashboard/jobs?gmail_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard/jobs?gmail_error=auth_failed', request.url)
    );
  }
}
