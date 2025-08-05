import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    await connectToDatabase();

    const job = await JobApplication.findOne({
      _id: id,
      userId
    }).lean();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = { ...body };

    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    await connectToDatabase();

    const job = await JobApplication.findOneAndUpdate(
      { _id: id, userId },
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    await connectToDatabase();

    const job = await JobApplication.findOneAndDelete({
      _id: id,
      userId
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Job application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    );
  }
}
