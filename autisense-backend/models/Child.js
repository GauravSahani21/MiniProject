import mongoose from 'mongoose';

const ChildSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Please add a date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Please add a gender']
  },
  guardian: {
    type: String,
    required: [true, 'Please add a guardian name']
  },
  avatar: {
    type: String,
    default: 'default-avatar'
  },
  medicalNotes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate age from dob
ChildSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

export default mongoose.model('Child', ChildSchema);
