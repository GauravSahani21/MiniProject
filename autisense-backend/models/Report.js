import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  screeningId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Screening',
    required: true,
    unique: true
  },
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
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  score: {
    type: Number
  },
  aiAnalysis: {
    type: String
  },
  categoryBreakdown: {
    social: Number,
    communication: Number,
    behavior: Number,
    sensory: Number,
    routine: Number
  },
  flaggedConcerns: [{
    type: String
  }],
  strengthsObserved: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  sharedWithDoctor: {
    type: Boolean,
    default: false
  },
  sharedDoctorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  pdfUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Report', ReportSchema);
