'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Music,
  Play,
  Heart,
  Share2,
  Plus,
  Headphones,
  TrendingUp,
  Clock,
  Users,
  ExternalLink
} from 'lucide-react';
import { SpotifyTrack } from '@/lib/spotify';

interface MusicSectionProps {
  isSpotifyConnected: boolean;
  onConnectSpotify: () => void;
}

interface RecommendationResponse {
  recommendations: SpotifyTrack[];
  type: string;
}

export function MusicSection({
  isSpotifyConnected,
  onConnectSpotify
}: MusicSectionProps) {
  const [dailyRecommendations, setDailyRecommendations] = useState<
    SpotifyTrack[]
  >([]);
  const [trendingTracks, setTrendingTracks] = useState<SpotifyTrack[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrack | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isSpotifyConnected) {
      fetchRecommendations();
      fetchCurrentlyPlaying();
    }
  }, [isSpotifyConnected]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [dailyRes, trendingRes] = await Promise.all([
        fetch('/api/spotify/recommendations?type=daily'),
        fetch(
          '/api/spotify/recommendations?type=trending&genres=pop,indie,electronic'
        )
      ]);

      if (dailyRes.ok) {
        const dailyData: RecommendationResponse = await dailyRes.json();
        setDailyRecommendations(dailyData.recommendations);
      }

      if (trendingRes.ok) {
        const trendingData: RecommendationResponse = await trendingRes.json();
        setTrendingTracks(trendingData.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentlyPlaying = async () => {
    try {
      const response = await fetch('/api/spotify/status');
      if (response.ok) {
        const data = await response.json();
        setCurrentlyPlaying(data.currentlyPlaying);
      }
    } catch (error) {
      console.error('Error fetching currently playing:', error);
    }
  };

  const handleLikeTrack = (trackId: string) => {
    setLikedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleShareTrack = async (track: SpotifyTrack) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${track.name} by ${track.artists.map((a) => a.name).join(', ')}`,
          text: 'Check out this track I found on GanaBeats!',
          url: track.external_urls.spotify
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(track.external_urls.spotify);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const TrackCard = ({
    track,
    showAddButton = false
  }: {
    track: SpotifyTrack;
    showAddButton?: boolean;
  }) => (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          {track.album.images[0] && (
            <img
              src={track.album.images[0].url}
              alt={track.album.name}
              className='h-12 w-12 rounded object-cover'
            />
          )}

          <div className='min-w-0 flex-1'>
            <h4 className='truncate font-medium'>{track.name}</h4>
            <p className='text-muted-foreground truncate text-sm'>
              {track.artists.map((a) => a.name).join(', ')}
            </p>
            <p className='text-muted-foreground truncate text-xs'>
              {track.album.name}
            </p>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleLikeTrack(track.id)}
              className={likedTracks.has(track.id) ? 'text-red-500' : ''}
            >
              <Heart
                className={`h-3 w-3 ${likedTracks.has(track.id) ? 'fill-current' : ''}`}
              />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleShareTrack(track)}
            >
              <Share2 className='h-3 w-3' />
            </Button>

            {showAddButton && (
              <Button variant='ghost' size='sm' title='Add to playlist'>
                <Plus className='h-3 w-3' />
              </Button>
            )}

            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.open(track.external_urls.spotify, '_blank')}
            >
              <ExternalLink className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isSpotifyConnected) {
    return (
      <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Music className='h-5 w-5 text-green-600' />
            Music Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            Connect your Spotify account to discover daily recommendations,
            share tracks, and see what's trending in the community!
          </p>
          <Button onClick={onConnectSpotify} className='w-full gap-2'>
            <Music className='h-4 w-4' />
            Connect Spotify
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {currentlyPlaying && (
        <Card className='border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Headphones className='h-4 w-4 text-purple-600' />
              Now Playing
              <Badge
                variant='secondary'
                className='bg-purple-100 text-purple-700'
              >
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <TrackCard track={currentlyPlaying} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Music className='h-5 w-5' />
            Music Discovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='daily' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='daily' className='gap-2'>
                <Clock className='h-4 w-4' />
                Daily Picks
              </TabsTrigger>
              <TabsTrigger value='trending' className='gap-2'>
                <TrendingUp className='h-4 w-4' />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value='daily' className='mt-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium'>Recommended for you</h3>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchRecommendations}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className='text-muted-foreground text-sm'>
                  Loading recommendations...
                </div>
              ) : (
                <div className='space-y-3'>
                  {dailyRecommendations.slice(0, 5).map((track) => (
                    <TrackCard key={track.id} track={track} showAddButton />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value='trending' className='mt-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium'>What's hot right now</h3>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchRecommendations}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className='text-muted-foreground text-sm'>
                  Loading trending tracks...
                </div>
              ) : (
                <div className='space-y-3'>
                  {trendingTracks.slice(0, 5).map((track) => (
                    <TrackCard key={track.id} track={track} showAddButton />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
