import mongoose from 'mongoose';

const ChatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant']
    },
    content: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionDate: {
    type: Date,
    default: Date.now
  },
  totalMessages: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('ChatLog', ChatLogSchema);
