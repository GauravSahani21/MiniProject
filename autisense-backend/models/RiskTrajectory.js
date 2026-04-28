import mongoose from 'mongoose';

const RiskTrajectorySchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Child',
      required: true,
      unique: true,
      index: true,
    },
    screenings: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Screening',
      },
    ],
    riskScores: [
      {
        type: Number,
        min: 0,
        max: 20,
      },
    ],
    dates: [
      {
        type: Date,
      },
    ],
    predictedTrajectory: {
      type: Number,
      min: 0,
      max: 20,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RiskTrajectory', RiskTrajectorySchema);
