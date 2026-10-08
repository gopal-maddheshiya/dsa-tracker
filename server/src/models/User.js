const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [1, 'Name cannot be empty'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Creates unique index on email
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false, // Prevents passwordHash from being returned by default
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    targetRole: {
      type: String,
      trim: true,
      default: 'Software Development Engineer',
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: 'C++',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    leetcodeHandle: {
      type: String,
      trim: true,
      default: '',
    },
    codeforcesHandle: {
      type: String,
      trim: true,
      default: '',
    },
    githubHandle: {
      type: String,
      trim: true,
      default: '',
    },
    dailyGoal: {
      type: Number,
      min: 1,
      max: 10,
      default: 2,
    },
    reviewPreset: {
      type: String,
      enum: ['balanced', 'aggressive', 'relaxed'],
      default: 'balanced',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Ensure JSON serialization never exposes passwordHash or internal fields
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.passwordHash;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
