'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  ExternalLink,
  Users,
  Play,
  Heart,
  Copy,
  Share2
} from 'lucide-react';
import { ISpotifyPlaylist } from '@/models/DailyLog';

interface PlaylistEmbedProps {
  playlist: ISpotifyPlaylist;
  showEmbed?: boolean;
  compact?: boolean;
}

export function PlaylistEmbed({
  playlist,
  showEmbed = false,
  compact = false
}: PlaylistEmbedProps) {
  const [embedVisible, setEmbedVisible] = useState(showEmbed);
  const [liked, setLiked] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(playlist.externalUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist.name,
          text: `Check out this playlist: ${playlist.name}`,
          url: playlist.externalUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (compact) {
    return (
      <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
        <CardContent className='p-3'>
          <div className='flex items-center gap-3'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <Music className='h-4 w-4 text-green-600' />
              <span className='truncate font-medium'>{playlist.name}</span>
              <Badge variant='secondary' className='text-xs'>
                {playlist.trackCount} tracks
              </Badge>
              {playlist.collaborative && (
                <Users className='h-3 w-3 text-blue-500' />
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.open(playlist.externalUrl, '_blank')}
            >
              <ExternalLink className='h-3 w-3' />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
      <CardContent className='p-4'>
        <div className='flex items-start gap-4'>
          {playlist.imageUrl && (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className='h-16 w-16 rounded-lg object-cover'
            />
          )}

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <div className='flex items-center gap-2'>
                  <h3 className='truncate font-semibold'>{playlist.name}</h3>
                  {playlist.collaborative && (
                    <Users className='h-4 w-4 text-blue-500' />
                  )}
                </div>

                {playlist.description && (
                  <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                    {playlist.description}
                  </p>
                )}

                <div className='mt-2 flex items-center gap-3'>
                  <Badge variant='secondary'>
                    {playlist.trackCount} tracks
                  </Badge>
                  {playlist.isPublic && <Badge variant='outline'>Public</Badge>}
                </div>
              </div>
            </div>

            <div className='mt-3 flex items-center gap-2'>
              <Button
                variant='default'
                size='sm'
                onClick={() => setEmbedVisible(!embedVisible)}
                className='gap-2'
              >
                <Play className='h-3 w-3' />
                {embedVisible ? 'Hide Player' : 'Show Player'}
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => setLiked(!liked)}
                className={liked ? 'text-red-500' : ''}
              >
                <Heart className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
              </Button>

              <Button variant='ghost' size='sm' onClick={handleCopyLink}>
                <Copy className='h-3 w-3' />
              </Button>

              <Button variant='ghost' size='sm' onClick={handleShare}>
                <Share2 className='h-3 w-3' />
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => window.open(playlist.externalUrl, '_blank')}
              >
                <ExternalLink className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </div>

        {embedVisible && (
          <div className='mt-4'>
            <iframe
              src={playlist.embedUrl}
              width='100%'
              height='352'
              frameBorder='0'
              allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
              loading='lazy'
              className='rounded-lg'
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
