import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    specialRequests: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    tableNumber: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: [
        'website',
        'opentable',
        'resy',
        'partner',
        'mobile_app',
        'phone',
        'walk_in'
      ],
      default: 'website'
    },
    externalId: {
      type: String,
      trim: true,
      sparse: true
    },
    metadata: {
      platform: String,
      referenceNumber: String,
      commission: Number,
      partnerFee: Number,
      originalUrl: String,
      userAgent: String,
      ipAddress: String
    }
  },
  {
    timestamps: true
  }
);

reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ customerEmail: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ source: 1 });
reservationSchema.index({ externalId: 1 }, { sparse: true });
reservationSchema.index({ 'metadata.referenceNumber': 1 }, { sparse: true });

export default mongoose.models.Reservation ||
  mongoose.model('Reservation', reservationSchema);
