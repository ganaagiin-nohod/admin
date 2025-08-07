import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: { url: string; height: number; width: number }[];
  tracks: { total: number };
  public: boolean;
  collaborative: boolean;
  external_urls: { spotify: string };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: { spotify: string };
  preview_url: string | null;
  duration_ms: number;
}

export interface SpotifyRecommendations {
  tracks: SpotifyTrack[];
}

// Get Spotify access token from Clerk user metadata
export async function getSpotifyAccessToken(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await (await clerkClient()).users.getUser(userId);
    const spotifyData = user.privateMetadata?.spotify as any;

    if (!spotifyData?.accessToken) {
      return null;
    }

    // Check if token is expired
    if (Date.now() >= spotifyData.expiresAt) {
      // Try to refresh the token
      return await refreshSpotifyToken(userId, spotifyData.refreshToken);
    }

    return spotifyData.accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
}

// Refresh Spotify access token
async function refreshSpotifyToken(
  userId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    // Update stored tokens
    await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      privateMetadata: {
        spotify: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || refreshToken,
          expiresAt: Date.now() + tokens.expires_in * 1000
        }
      }
    });

    return tokens.access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
}

// Check if user has connected Spotify
export async function isSpotifyConnected(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await (await clerkClient()).users.getUser(userId);
    const spotifyData = user.privateMetadata?.spotify as any;

    return !!spotifyData?.accessToken;
  } catch (error) {
    console.error('Error checking Spotify connection:', error);
    return false;
  }
}

// Fetch user's playlists from Spotify
export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token available');
  }

  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    throw error;
  }
}

// Get current user info
export async function getSpotifyUser(): Promise<SpotifyUser | null> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify user:', error);
    return null;
  }
}

// Transform Spotify playlist to our format
export function transformPlaylistData(playlist: SpotifyPlaylist) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || undefined,
    imageUrl: playlist.images[0]?.url,
    trackCount: playlist.tracks.total,
    isPublic: playlist.public,
    collaborative: playlist.collaborative,
    externalUrl: playlist.external_urls.spotify,
    embedUrl: `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`
  };
}
// Get user's top tracks for recommendations
export async function getUserTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'
): Promise<SpotifyTrack[]> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token available');
  }

  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/top/tracks?limit=20&time_range=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    throw error;
  }
}

// Get recommendations based on user's taste
export async function getRecommendations(
  seedTracks?: string[],
  seedArtists?: string[],
  seedGenres?: string[]
): Promise<SpotifyRecommendations> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token available');
  }

  try {
    const params = new URLSearchParams({
      limit: '20'
    });

    if (seedTracks?.length) {
      params.append('seed_tracks', seedTracks.slice(0, 5).join(','));
    }
    if (seedArtists?.length) {
      params.append('seed_artists', seedArtists.slice(0, 5).join(','));
    }
    if (seedGenres?.length) {
      params.append('seed_genres', seedGenres.slice(0, 5).join(','));
    }

    // If no seeds provided, use popular genres
    if (!seedTracks?.length && !seedArtists?.length && !seedGenres?.length) {
      params.append('seed_genres', 'pop,indie,electronic');
    }

    const response = await fetch(
      `${SPOTIFY_API_BASE}/recommendations?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

// Get currently playing track
export async function getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/player/currently-playing`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 204 || !response.ok) {
      return null; // Nothing playing or error
    }

    const data = await response.json();
    return data.item || null;
  } catch (error) {
    console.error('Error fetching currently playing:', error);
    return null;
  }
}

// Add tracks to a playlist
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[]
): Promise<boolean> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token available');
  }

  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: trackUris
        })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    return false;
  }
}

// Create a new playlist
export async function createPlaylist(
  name: string,
  description?: string,
  isPublic: boolean = true
): Promise<SpotifyPlaylist | null> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token available');
  }

  try {
    // First get user ID
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const user = await userResponse.json();

    // Create playlist
    const response = await fetch(
      `${SPOTIFY_API_BASE}/users/${user.id}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description:
            description ||
            `Created from GanaVlog on ${new Date().toLocaleDateString()}`,
          public: isPublic
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
}
