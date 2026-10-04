const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Creates index on userId for owner-based problem queries
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      minlength: [1, 'Problem title cannot be empty'],
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
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'Problem link must be a valid URL starting with http:// or https://',
      },
    },
    topics: {
      type: [String],
      required: [true, 'Topics are required'],
      validate: {
        validator: function (arr) {
          return (
            Array.isArray(arr) &&
            arr.length > 0 &&
            arr.every((topic) => typeof topic === 'string' && topic.trim().length > 0)
          );
        },
        message: 'Topics must be a non-empty array of non-empty strings',
      },
      set: function (arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.map((t) => (typeof t === 'string' ? t.trim() : t));
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty level',
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

// Ensure JSON serialization maps _id to id and cleans up output
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
