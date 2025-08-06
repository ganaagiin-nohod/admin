import mongoose from 'mongoose';

const CollaborationSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    createdBy: {
      type: String,
      required: true
    },
    participants: [
      {
        id: String,
        name: String,
        email: String,
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    files: [
      {
        name: String,
        content: String,
        language: String
      }
    ],
    chatHistory: [
      {
        userId: String,
        userName: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        type: { type: String, enum: ['user', 'ai'], default: 'user' }
      }
    ],
    sessionHistory: [
      {
        userId: String,
        action: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.CollaborationSession ||
  mongoose.model('CollaborationSession', CollaborationSessionSchema);
