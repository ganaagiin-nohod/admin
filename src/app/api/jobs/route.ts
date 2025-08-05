import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import JobApplication, {
  JobStatus,
  JobPriority
} from '@/models/JobApplication';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const company = searchParams.get('company');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query: any = { userId };
    if (status && Object.values(JobStatus).includes(status as JobStatus)) {
      query.status = status;
    }
    if (
      priority &&
      Object.values(JobPriority).includes(priority as JobPriority)
    ) {
      query.priority = priority;
    }
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    const jobs = await JobApplication.find(query)
      .sort({ applicationDate: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await JobApplication.countDocuments(query);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
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

    const body = await request.json();
    const {
      company,
      position,
      status = JobStatus.APPLIED,
      priority = JobPriority.MEDIUM,
      jobUrl,
      description,
      salary,
      location,
      contactEmail,
      notes
    } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const jobApplication = new JobApplication({
      userId,
      company: company.trim(),
      position: position.trim(),
      status,
      priority,
      jobUrl: jobUrl?.trim(),
      description: description?.trim(),
      salary,
      location: location?.trim(),
      contactEmail: contactEmail?.trim(),
      notes: notes?.trim(),
      applicationDate: new Date()
    });

    await jobApplication.save();

    return NextResponse.json(jobApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500 }
    );
  }
}
