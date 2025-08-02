import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  clerkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  clerkId: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ clerkId: 1 }, { unique: true, sparse: true });

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
