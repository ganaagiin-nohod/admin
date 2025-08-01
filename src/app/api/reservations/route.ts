import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Reservation from '@/models/Reservation';

async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query: any = {};
    if (status) query.status = status;
    if (date) query.date = date;

    const reservations = await Reservation.find(query)
      .sort({ date: 1, time: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: reservations.map((reservation) => ({
        ...reservation,
        id: (reservation._id as mongoose.Types.ObjectId).toString(),
        _id: undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      partySize,
      specialRequests,
      source = 'website',
      externalId,
      metadata
    } = body;

    const requestSource = request.headers.get('x-source') || source;

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !date ||
      !time ||
      !partySize
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (externalId) {
      const existingExternal = await Reservation.findOne({
        externalId,
        source: requestSource
      });

      if (existingExternal) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reservation with this external ID already exists'
          },
          { status: 409 }
        );
      }
    }

    const existingReservation = await Reservation.findOne({
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingReservation) {
      return NextResponse.json(
        { success: false, error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    const reservationMetadata = {
      ...metadata,
      userAgent: request.headers.get('user-agent'),
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      originalUrl: request.headers.get('referer')
    };

    const reservation = new Reservation({
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      partySize,
      specialRequests,
      source: requestSource,
      externalId,
      metadata: reservationMetadata,
      status: 'pending'
    });

    await reservation.save();

    const reservationObject = reservation.toObject();
    return NextResponse.json(
      {
        success: true,
        data: {
          ...reservationObject,
          id: reservation._id.toString(),
          _id: undefined
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
