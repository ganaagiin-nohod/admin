import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ILogEntry {
  id: string;
  type: 'note' | 'image' | 'video';
  content: string;
  mediaUrl?: string;
  timestamp: Date;
}

export interface ISpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  trackCount: number;
  isPublic: boolean;
  collaborative: boolean;
  externalUrl: string;
  embedUrl: string;
}

export interface IDailyLog extends Document {
  userId: string;
  date: Date;
  challenges: IChallenge[];
  entries: ILogEntry[];
  summary?: string;
  isPublic: boolean;
  playlist?: ISpotifyPlaylist;
  reactions: {
    userId: string;
    type: 'fire' | 'love' | 'clap' | 'mind_blown';
    timestamp: Date;
  }[];
  comments: {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const LogEntrySchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['note', 'image', 'video'], required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const ReactionSchema = new Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ['fire', 'love', 'clap', 'mind_blown'],
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

const CommentSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SpotifyPlaylistSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  trackCount: { type: Number, required: true },
  isPublic: { type: Boolean, required: true },
  collaborative: { type: Boolean, required: true },
  externalUrl: { type: String, required: true },
  embedUrl: { type: String, required: true }
});

const DailyLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    challenges: [ChallengeSchema],
    entries: [LogEntrySchema],
    summary: { type: String },
    isPublic: { type: Boolean, default: true },
    playlist: SpotifyPlaylistSchema,
    reactions: [ReactionSchema],
    comments: [CommentSchema]
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
DailyLogSchema.index({ userId: 1, date: -1 });
DailyLogSchema.index({ isPublic: 1, date: -1 });

export default mongoose.models.DailyLog ||
  mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
