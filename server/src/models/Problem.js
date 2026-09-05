const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'],
        message: '{VALUE} is not a supported platform',
      },
      lowercase: true,
      trim: true,
    },
    link: {
      type: String,
      required: [true, 'Problem link is required'],
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: 'Topics must be an array of strings',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty',
      },
      lowercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Ensure JSON serialization maps _id to id
problemSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
