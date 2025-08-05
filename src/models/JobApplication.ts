import mongoose, { Document, Schema } from 'mongoose';

export enum JobStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export enum JobPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface IJobApplication extends Document {
  userId: string;
  company: string;
  position: string;
  status: JobStatus;
  priority: JobPriority;
  applicationDate: Date;
  lastUpdated: Date;
  jobUrl?: string;
  description?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  contactEmail?: string;
  notes?: string;
  emailThreadId?: string;
  lastEmailCheck?: Date;
  interviews?: {
    date: Date;
    type: string;
    notes?: string;
  }[];
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.APPLIED,
      required: true
    },
    priority: {
      type: String,
      enum: Object.values(JobPriority),
      default: JobPriority.MEDIUM,
      required: true
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: true
    },
    jobUrl: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    location: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    notes: {
      type: String,
      trim: true
    },
    emailThreadId: {
      type: String,
      trim: true
    },
    lastEmailCheck: {
      type: Date
    },
    interviews: [
      {
        date: {
          type: Date,
          required: true
        },
        type: {
          type: String,
          required: true,
          enum: ['phone', 'video', 'onsite', 'technical']
        },
        notes: String
      }
    ],
    documents: [
      {
        name: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        },
        type: {
          type: String,
          required: true,
          enum: ['resume', 'cover_letter', 'portfolio', 'other']
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

JobApplicationSchema.index({ userId: 1, status: 1 });
JobApplicationSchema.index({ userId: 1, applicationDate: -1 });
JobApplicationSchema.index({ userId: 1, company: 1 });

JobApplicationSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

const JobApplication =
  mongoose.models?.JobApplication ||
  mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
export default JobApplication;
