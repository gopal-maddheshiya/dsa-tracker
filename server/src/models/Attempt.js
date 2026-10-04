const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem ID is required'],
      index: true, // Creates index for fetching all attempts for a problem
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      // Note: compound index with attemptedAt created below
    },
    status: {
      type: String,
      required: [true, 'Attempt status is required'],
      enum: {
        values: ['solved', 'struggled', 'revisit_needed'],
        message: '{VALUE} is not a valid attempt status',
      },
      lowercase: true,
      trim: true,
    },
    timeTakenMinutes: {
      type: Number,
      min: [0, 'Time taken cannot be negative'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
      required: [true, 'Attempted date is required'],
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for user activity timeline and date-range analytics
attemptSchema.index({ userId: 1, attemptedAt: 1 });

// JSON serialization transform
attemptSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
