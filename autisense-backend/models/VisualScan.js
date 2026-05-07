import mongoose from 'mongoose';

const VisualScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  childName: {
    type: String,
    default: 'Unknown'
  },
  // Drawing analysis results
  drawingResult: {
    prediction: { type: String, enum: ['High', 'Medium', 'Low', 'Unknown'], default: 'Unknown' },
    reasoning: { type: String },
    score: { type: Number, min: 0, max: 100 }
  },
  // Face/Eye scan results
  faceResult: {
    riskLevel: { type: String, enum: ['High', 'Medium', 'Low', 'Unknown'], default: 'Unknown' },
    reasoning: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
    // Raw biometric metrics captured
    metrics: {
      eyeContactScore: Number,
      blinkRate: Number,
      headStability: Number,
      durationSeconds: Number
    }
  },
  // Combined AI report
  combinedReport: {
    overallRisk: { type: String, enum: ['High', 'Medium', 'Low', 'Unknown'], default: 'Unknown' },
    overallScore: { type: Number, min: 0, max: 100 },
    summary: { type: String },
    recommendations: [{ type: String }]
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('VisualScan', VisualScanSchema);
