'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Music,
  Heart,
  MessageCircle,
  Share2,
  Play,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { ISpotifyPlaylist } from '@/models/DailyLog';

interface CommunityPlaylist extends ISpotifyPlaylist {
  username: string;
  userAvatar?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  tags?: string[];
}

interface CommunityPlaylistsProps {
  isSpotifyConnected: boolean;
}

export function CommunityPlaylists({
  isSpotifyConnected
}: CommunityPlaylistsProps) {
  const [playlists, setPlaylists] = useState<CommunityPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'trending' | 'recent' | 'liked'>(
    'trending'
  );

  const mockPlaylists: CommunityPlaylist[] = [
    {
      id: 'community-1',
      name: 'Deep Work Vibes',
      description: 'Perfect for coding sessions and focused work',
      imageUrl:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      trackCount: 28,
      isPublic: true,
      collaborative: false,
      externalUrl: 'https://open.spotify.com/playlist/demo1',
      embedUrl: 'https://open.spotify.com/embed/playlist/demo1',
      username: 'CodeMaster',
      likes: 42,
      comments: 8,
      isLiked: false,
      createdAt: '2024-01-15',
      tags: ['coding', 'focus', 'electronic']
    },
    {
      id: 'community-2',
      name: 'Morning Energy Boost',
      description: 'Start your day with these uplifting tracks',
      imageUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      trackCount: 35,
      isPublic: true,
      collaborative: true,
      externalUrl: 'https://open.spotify.com/playlist/demo2',
      embedUrl: 'https://open.spotify.com/embed/playlist/demo2',
      username: 'MorningPerson',
      likes: 67,
      comments: 12,
      isLiked: true,
      createdAt: '2024-01-14',
      tags: ['morning', 'energy', 'pop']
    },
    {
      id: 'community-3',
      name: 'Chill Study Session',
      description: 'Lo-fi and ambient tracks for studying',
      imageUrl:
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
      trackCount: 52,
      isPublic: true,
      collaborative: false,
      externalUrl: 'https://open.spotify.com/playlist/demo3',
      embedUrl: 'https://open.spotify.com/embed/playlist/demo3',
      username: 'StudyBuddy',
      likes: 89,
      comments: 15,
      isLiked: false,
      createdAt: '2024-01-13',
      tags: ['study', 'lofi', 'chill']
    }
  ];

  useEffect(() => {
    // In real app, fetch community playlists from API
    setPlaylists(mockPlaylists);
  }, [filter]);

  const handleLike = (playlistId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              isLiked: !playlist.isLiked,
              likes: playlist.isLiked ? playlist.likes - 1 : playlist.likes + 1
            }
          : playlist
      )
    );
  };

  const handleShare = async (playlist: CommunityPlaylist) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${playlist.name} by ${playlist.username}`,
          text:
            playlist.description || 'Check out this playlist from GanaBeats!',
          url: playlist.externalUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(playlist.externalUrl);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const PlaylistCard = ({ playlist }: { playlist: CommunityPlaylist }) => (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          {playlist.imageUrl && (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className='h-16 w-16 rounded-lg object-cover'
            />
          )}

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='truncate font-semibold'>{playlist.name}</h3>
                  {playlist.collaborative && (
                    <Users className='h-3 w-3 text-blue-500' />
                  )}
                </div>

                <div className='mt-1 flex items-center gap-2'>
                  <Avatar className='h-5 w-5'>
                    <AvatarFallback className='text-xs'>
                      {playlist.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-muted-foreground text-sm'>
                    {playlist.username}
                  </span>
                </div>

                {playlist.description && (
                  <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                    {playlist.description}
                  </p>
                )}

                <div className='mt-2 flex items-center gap-3'>
                  <Badge variant='secondary' className='text-xs'>
                    {playlist.trackCount} tracks
                  </Badge>

                  {playlist.tags?.map((tag) => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className='mt-3 flex items-center justify-between'>
              <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                <span className='flex items-center gap-1'>
                  <Heart className='h-3 w-3' />
                  {playlist.likes}
                </span>
                <span className='flex items-center gap-1'>
                  <MessageCircle className='h-3 w-3' />
                  {playlist.comments}
                </span>
              </div>

              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleLike(playlist.id)}
                  className={playlist.isLiked ? 'text-red-500' : ''}
                >
                  <Heart
                    className={`h-3 w-3 ${playlist.isLiked ? 'fill-current' : ''}`}
                  />
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleShare(playlist)}
                >
                  <Share2 className='h-3 w-3' />
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => window.open(playlist.externalUrl, '_blank')}
                >
                  <Play className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isSpotifyConnected) {
    return (
      <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-blue-600' />
            Community Playlists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Connect Spotify to discover and share playlists with the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Community Playlists
        </CardTitle>

        <div className='flex gap-2'>
          <Button
            variant={filter === 'trending' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('trending')}
            className='gap-1'
          >
            <TrendingUp className='h-3 w-3' />
            Trending
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('recent')}
            className='gap-1'
          >
            <Clock className='h-3 w-3' />
            Recent
          </Button>
          <Button
            variant={filter === 'liked' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('liked')}
            className='gap-1'
          >
            <Heart className='h-3 w-3' />
            Liked
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}

        {playlists.length === 0 && (
          <div className='text-muted-foreground py-8 text-center'>
            <Music className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p>No playlists found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
