const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
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
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for querying user activity chronologically
attemptSchema.index({ userId: 1, attemptedAt: -1 });

// Ensure JSON serialization maps _id to id
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
