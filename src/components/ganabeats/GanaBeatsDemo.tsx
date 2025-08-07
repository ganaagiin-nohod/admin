'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Sparkles } from 'lucide-react';
import { PlaylistEmbed } from './PlaylistEmbed';
import { ISpotifyPlaylist } from '@/models/DailyLog';

const mockPlaylist: ISpotifyPlaylist = {
  id: 'demo-playlist',
  name: 'Coding Flow Vibes',
  description: 'Perfect beats for deep work sessions and creative coding',
  imageUrl:
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  trackCount: 42,
  isPublic: true,
  collaborative: false,
  externalUrl: 'https://open.spotify.com/playlist/demo',
  embedUrl: 'https://open.spotify.com/embed/playlist/demo'
};

export function GanaBeatsDemo() {
  return (
    <Card className='border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Music className='h-5 w-5 text-purple-600' />
          GanaBeats Preview
          <Badge variant='secondary' className='bg-purple-100 text-purple-700'>
            <Sparkles className='mr-1 h-3 w-3' />
            New Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-muted-foreground text-sm'>
          This is how playlists will appear in your daily logs once you connect
          Spotify!
        </p>

        <PlaylistEmbed
          playlist={mockPlaylist}
          showEmbed={false}
          compact={false}
        />

        <div className='text-muted-foreground rounded-lg bg-white/50 p-3 text-xs dark:bg-black/20'>
          <strong>Demo Mode:</strong> This is a preview with mock data. Connect
          your Spotify account to see your real playlists!
        </div>
      </CardContent>
    </Card>
  );
}
