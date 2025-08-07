import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRecommendations, getUserTopTracks } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'daily';

    let recommendations;

    if (type === 'daily') {
      try {
        const topTracks = await getUserTopTracks('medium_term');
        const seedTracks = topTracks.slice(0, 3).map((track) => track.id);
        recommendations = await getRecommendations(seedTracks);
      } catch (error) {
        recommendations = await getRecommendations(undefined, undefined, [
          'pop',
          'indie',
          'chill'
        ]);
      }
    } else {
      const seedGenres = searchParams.get('genres')?.split(',');
      recommendations = await getRecommendations(
        undefined,
        undefined,
        seedGenres
      );
    }

    return NextResponse.json({
      recommendations: recommendations.tracks,
      type
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
