'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Users, TrendingUp, Settings } from 'lucide-react';
import { MusicSection } from './MusicSection';
import { CommunityPlaylists } from './CommunityPlaylists';
import { SpotifySetup } from './SpotifySetup';

interface SpotifyStatus {
  connected: boolean;
  currentlyPlaying: any;
}

export function MusicDashboard() {
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus>({
    connected: false,
    currentlyPlaying: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const response = await fetch('/api/spotify/status');
      if (response.ok) {
        const data = await response.json();
        setSpotifyStatus(data);
      }
    } catch (error) {
      console.error('Error checking Spotify status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSpotify = () => {
    window.location.href = '/api/spotify/auth';
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading music dashboard...</div>
      </div>
    );
  }

  if (!spotifyStatus.connected) {
    return <SpotifySetup />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>GanaBeats</h2>
          <p className='text-muted-foreground'>
            Discover, share, and vibe with music in your daily logs
          </p>
        </div>
      </div>

      <Tabs defaultValue='discover' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='discover' className='gap-2'>
            <Music className='h-4 w-4' />
            Discover
          </TabsTrigger>
          <TabsTrigger value='community' className='gap-2'>
            <Users className='h-4 w-4' />
            Community
          </TabsTrigger>
          <TabsTrigger value='trending' className='gap-2'>
            <TrendingUp className='h-4 w-4' />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value='discover' className='mt-6 space-y-6'>
          <MusicSection
            isSpotifyConnected={spotifyStatus.connected}
            onConnectSpotify={handleConnectSpotify}
          />
        </TabsContent>

        <TabsContent value='community' className='mt-6 space-y-6'>
          <CommunityPlaylists isSpotifyConnected={spotifyStatus.connected} />
        </TabsContent>

        <TabsContent value='trending' className='mt-6 space-y-6'>
          <CommunityPlaylists isSpotifyConnected={spotifyStatus.connected} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
