'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Music, ExternalLink, Users } from 'lucide-react';
import { ISpotifyPlaylist } from '@/models/DailyLog';

interface PlaylistPickerProps {
  selectedPlaylist: ISpotifyPlaylist | null;
  onPlaylistSelect: (playlist: ISpotifyPlaylist | null) => void;
}

interface SpotifyPlaylistData {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  trackCount: number;
  isPublic: boolean;
  collaborative: boolean;
  externalUrl: string;
  embedUrl: string;
}

export function PlaylistPicker({
  selectedPlaylist,
  onPlaylistSelect
}: PlaylistPickerProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylistData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/playlists');

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err) {
      setError(
        "Failed to load Spotify playlists. Make sure you've connected your Spotify account."
      );
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistChange = (playlistId: string) => {
    if (playlistId === 'none') {
      onPlaylistSelect(null);
      return;
    }

    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      onPlaylistSelect(playlist);
    }
  };

  if (loading) {
    return (
      <div className='space-y-2'>
        <Label className='flex items-center gap-2'>
          <Music className='h-4 w-4' />
          Today's Vibe (Spotify Playlist)
        </Label>
        <div className='text-muted-foreground text-sm'>
          Loading playlists...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-2'>
        <Label className='flex items-center gap-2'>
          <Music className='h-4 w-4' />
          Today's Vibe (Spotify Playlist)
        </Label>
        <div className='text-sm text-red-600'>{error}</div>
        <Button variant='outline' size='sm' onClick={fetchPlaylists}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <Label className='flex items-center gap-2'>
        <Music className='h-4 w-4' />
        Today's Vibe (Spotify Playlist)
      </Label>

      <Select
        value={selectedPlaylist?.id || 'none'}
        onValueChange={handlePlaylistChange}
      >
        <SelectTrigger>
          <SelectValue placeholder='Choose a playlist to match your vibe' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='none'>No playlist</SelectItem>
          {playlists.map((playlist) => (
            <SelectItem key={playlist.id} value={playlist.id}>
              <div className='flex items-center gap-2'>
                <Music className='h-3 w-3' />
                <span className='truncate'>{playlist.name}</span>
                <span className='text-muted-foreground text-xs'>
                  ({playlist.trackCount} tracks)
                </span>
                {playlist.collaborative && (
                  <Users className='h-3 w-3 text-blue-500' />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPlaylist && (
        <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
          <CardContent className='p-3'>
            <div className='flex items-start gap-3'>
              {selectedPlaylist.imageUrl && (
                <img
                  src={selectedPlaylist.imageUrl}
                  alt={selectedPlaylist.name}
                  className='h-12 w-12 rounded object-cover'
                />
              )}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h4 className='truncate font-medium'>
                    {selectedPlaylist.name}
                  </h4>
                  {selectedPlaylist.collaborative && (
                    <Users className='h-3 w-3 text-blue-500' />
                  )}
                </div>
                {selectedPlaylist.description && (
                  <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                    {selectedPlaylist.description}
                  </p>
                )}
                <div className='mt-2 flex items-center gap-4'>
                  <span className='text-muted-foreground text-xs'>
                    {selectedPlaylist.trackCount} tracks
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-auto p-0 text-xs'
                    onClick={() =>
                      window.open(selectedPlaylist.externalUrl, '_blank')
                    }
                  >
                    <ExternalLink className='mr-1 h-3 w-3' />
                    Open in Spotify
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
