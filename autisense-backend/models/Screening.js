import mongoose from 'mongoose';

const ScreeningSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Child',
    required: true
  },
  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  answers: [{
    questionId: {
      type: Number,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    answer: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  riskPercentage: {
    type: Number
  },
  categories: {
    social: Number,
    communication: Number,
    behavior: Number,
    sensory: Number,
    routine: Number
  },
  flaggedQuestions: [{
    type: Number
  }],
  mlPrediction: {
    prediction: Number,
    probability: Number
  },
  screeningDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'completed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  doctorRemarks: {
    type: String
  }
});

export default mongoose.model('Screening', ScreeningSchema);
