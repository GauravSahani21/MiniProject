import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 240
    },
    focusArea: {
      type: String,
      enum: ['communication', 'sensory', 'behavior'],
      required: true
    },
    done: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const InterventionPlanSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Child',
      required: true,
      index: true
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1
    },
    activities: {
      type: [ActivitySchema],
      default: []
    },
    focusAreas: {
      type: [String],
      enum: ['communication', 'sensory', 'behavior'],
      default: []
    },
    adherenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    outcomeNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

InterventionPlanSchema.index({ childId: 1, weekNumber: -1 }, { unique: true });

export default mongoose.model('InterventionPlan', InterventionPlanSchema);

