'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, ExternalLink, CheckCircle } from 'lucide-react';

export function SpotifySetup() {
  const handleConnectSpotify = () => {
    // Redirect to Spotify OAuth
    window.location.href = '/api/spotify/auth';
  };

  return (
    <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Music className='h-5 w-5 text-green-600' />
          Connect Spotify for GanaBeats
          <Badge variant='secondary'>New!</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-muted-foreground text-sm'>
          Connect your Spotify account to attach playlists to your daily logs
          and share your vibes with others!
        </p>

        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>What you'll get:</h4>
          <ul className='text-muted-foreground space-y-1 text-sm'>
            <li className='flex items-center gap-2'>
              <CheckCircle className='h-3 w-3 text-green-600' />
              Attach playlists to daily logs
            </li>
            <li className='flex items-center gap-2'>
              <CheckCircle className='h-3 w-3 text-green-600' />
              Share your music vibes
            </li>
            <li className='flex items-center gap-2'>
              <CheckCircle className='h-3 w-3 text-green-600' />
              Let others play your playlists
            </li>
            <li className='flex items-center gap-2'>
              <CheckCircle className='h-3 w-3 text-green-600' />
              Discover music from the community
            </li>
          </ul>
        </div>

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20'>
          <p className='text-xs text-yellow-800 dark:text-yellow-200'>
            <strong>Setup Required:</strong> You'll need to add your Spotify
            credentials to the .env file and implement OAuth flow. Check the
            setup guide for details.
          </p>
        </div>

        <Button onClick={handleConnectSpotify} className='w-full gap-2'>
          <Music className='h-4 w-4' />
          Connect Spotify Account
        </Button>
      </CardContent>
    </Card>
  );
}
