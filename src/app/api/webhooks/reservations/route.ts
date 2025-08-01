import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Reservation from '@/models/Reservation';
import crypto from 'crypto';

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

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';
    const source = request.headers.get('x-source') || 'unknown';

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (
      webhookSecret &&
      !verifyWebhookSignature(body, signature, webhookSecret)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const webhookData = JSON.parse(body);
    const { event, data } = webhookData;

    console.log(`Webhook received: ${event} from ${source}`, data);

    switch (event) {
      case 'reservation.created':
        return await handleReservationCreated(data, source);

      case 'reservation.updated':
        return await handleReservationUpdated(data, source);

      case 'reservation.cancelled':
        return await handleReservationCancelled(data, source);

      default:
        return NextResponse.json(
          { success: false, error: `Unknown event type: ${event}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleReservationCreated(data: any, source: string) {
  try {
    if (data.externalId) {
      const existing = await Reservation.findOne({
        externalId: data.externalId,
        source: source
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Reservation already exists',
          data: { id: existing._id.toString() }
        });
      }
    }

    const reservationData = mapExternalData(data, source);

    const reservation = new Reservation(reservationData);
    await reservation.save();

    return NextResponse.json({
      success: true,
      message: 'Reservation created from webhook',
      data: {
        id: reservation._id.toString(),
        source: source,
        externalId: data.externalId
      }
    });
  } catch (error) {
    console.error('Error creating reservation from webhook:', error);
    throw error;
  }
}

async function handleReservationUpdated(data: any, source: string) {
  try {
    const query = data.externalId
      ? { externalId: data.externalId, source: source }
      : { _id: data.id };

    const reservation = await Reservation.findOneAndUpdate(
      query,
      mapExternalData(data, source),
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation updated from webhook',
      data: { id: reservation._id.toString() }
    });
  } catch (error) {
    console.error('Error updating reservation from webhook:', error);
    throw error;
  }
}

async function handleReservationCancelled(data: any, source: string) {
  try {
    const query = data.externalId
      ? { externalId: data.externalId, source: source }
      : { _id: data.id };

    const reservation = await Reservation.findOneAndUpdate(
      query,
      { status: 'cancelled' },
      { new: true }
    );

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled from webhook',
      data: { id: reservation._id.toString() }
    });
  } catch (error) {
    console.error('Error cancelling reservation from webhook:', error);
    throw error;
  }
}

function mapExternalData(data: any, source: string) {
  const baseData = {
    customerName: data.customerName || data.customer?.name || data.name,
    customerEmail: data.customerEmail || data.customer?.email || data.email,
    customerPhone: data.customerPhone || data.customer?.phone || data.phone,
    date: data.date || data.reservation_date,
    time: data.time || data.reservation_time,
    partySize: data.partySize || data.party_size || data.guests,
    specialRequests:
      data.specialRequests || data.special_requests || data.notes,
    source: source,
    externalId: data.externalId || data.id || data.reservation_id,
    status: mapExternalStatus(data.status, source)
  };

  const metadata: any = {
    platform: getPlatformName(source),
    referenceNumber:
      data.referenceNumber || data.confirmation_number || data.reference,
    originalUrl: data.originalUrl || data.booking_url
  };

  switch (source) {
    case 'opentable':
      metadata.commission = data.commission || 2.5;
      metadata.tablePreference = data.table_preference;
      break;

    case 'resy':
      metadata.commission = data.commission || 3.0;
      metadata.resyId = data.resy_id;
      break;

    case 'partner':
      metadata.partnerFee = data.partner_fee;
      metadata.partnerId = data.partner_id;
      break;
  }

  return { ...baseData, metadata };
}

function mapExternalStatus(externalStatus: string, source: string): string {
  const statusMap: { [key: string]: { [key: string]: string } } = {
    opentable: {
      pending: 'pending',
      confirmed: 'confirmed',
      seated: 'confirmed',
      cancelled: 'cancelled',
      no_show: 'cancelled',
      completed: 'completed'
    },
    resy: {
      booked: 'confirmed',
      cancelled: 'cancelled',
      seated: 'confirmed',
      finished: 'completed'
    },
    default: {
      pending: 'pending',
      confirmed: 'confirmed',
      cancelled: 'cancelled',
      completed: 'completed'
    }
  };

  const sourceMap = statusMap[source] || statusMap.default;
  return sourceMap[externalStatus?.toLowerCase()] || 'pending';
}

function getPlatformName(source: string): string {
  const platformNames: { [key: string]: string } = {
    opentable: 'OpenTable',
    resy: 'Resy',
    partner: 'Partner Site',
    mobile_app: 'Mobile App',
    website: 'Website',
    phone: 'Phone',
    walk_in: 'Walk-in'
  };

  return platformNames[source] || source;
}
