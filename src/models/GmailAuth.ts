import mongoose, { Document, Schema } from 'mongoose';

export interface IGmailAuth extends Document {
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiryDate: Date;
  scope: string[];
  email: string;
  isActive: boolean;
  lastSync: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GmailAuthSchema = new Schema<IGmailAuth>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    tokenType: {
      type: String,
      default: 'Bearer'
    },
    expiryDate: {
      type: Date,
      required: true
    },
    scope: [
      {
        type: String
      }
    ],
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSync: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

GmailAuthSchema.index({ userId: 1 });
GmailAuthSchema.index({ email: 1 });
GmailAuthSchema.index({ isActive: 1 });

const GmailAuth =
  mongoose.models?.GmailAuth ||
  mongoose.model<IGmailAuth>('GmailAuth', GmailAuthSchema);
export default GmailAuth;
