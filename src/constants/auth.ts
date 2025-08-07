export const AUTH_CONFIG = {
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/dashboard/overview',
  afterSignUpUrl: '/dashboard/overview',
  SPOTIFY_CLIENT_ID: '383e5cc5ae2a4fa79b33f8b1069b9966',
  SPOTIFY_CLIENT_SECRET: 'f834b1f0520248e1a8d17910f907ef71',
  SPOTIFY_REDIRECT_URI: 'https://saasbygana.vercel.app/api/spotify/callback',
  NEXTAUTH_URL: 'https://saasbygana.vercel.app'
} as const;
