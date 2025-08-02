import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Website from '@/models/Website';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const websites = await Website.find({ userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, title, components } = await request.json();

    if (!slug || !title) {
      return NextResponse.json(
        { error: 'Slug and title are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if slug already exists
    const existingWebsite = await Website.findOne({ slug });
    if (existingWebsite && existingWebsite.userId !== userId) {
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 409 }
      );
    }

    const website = await Website.findOneAndUpdate(
      { userId, slug },
      { userId, slug, title, components: components || [] },
      { upsert: true, new: true }
    );

    return NextResponse.json({ website });
  } catch (error) {
    console.error('Error creating/updating website:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
