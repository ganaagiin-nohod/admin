import mongoose from 'mongoose';

export interface IWebsiteComponent {
  type: 'hero' | 'about' | 'gallery' | 'contact';
  title?: string;
  subtitle?: string;
  text?: string;
  image?: string;
  images?: string[];
  email?: string;
}

export interface IWebsite extends mongoose.Document {
  userId: string;
  slug: string;
  title: string;
  components: IWebsiteComponent[];
  deploymentUrl?: string;
  deploymentId?: string;
  deploymentStatus?: 'pending' | 'deployed' | 'failed';
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteComponentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hero', 'about', 'gallery', 'contact'],
      required: true
    },
    title: String,
    subtitle: String,
    text: String,
    image: String,
    images: [String],
    email: String
  },
  { _id: false }
);

const WebsiteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  components: [WebsiteComponentSchema],
  deploymentUrl: {
    type: String,
    sparse: true
  },
  deploymentId: {
    type: String,
    sparse: true
  },
  deploymentStatus: {
    type: String,
    enum: ['pending', 'deployed', 'failed'],
    default: 'pending'
  },
  customDomain: {
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

WebsiteSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

WebsiteSchema.index({ userId: 1 });
WebsiteSchema.index({ slug: 1 });

export default mongoose.models.Website ||
  mongoose.model<IWebsite>('Website', WebsiteSchema);
