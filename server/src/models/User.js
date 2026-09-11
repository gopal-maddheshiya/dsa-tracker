const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    goals: {
      dailyTarget: {
        type: Number,
        default: 2,
        min: [1, 'Daily target must be at least 1'],
        max: [50, 'Daily target cannot exceed 50'],
      },
      weeklyTarget: {
        type: Number,
        default: 10,
        min: [1, 'Weekly target must be at least 1'],
        max: [200, 'Weekly target cannot exceed 200'],
      },
      targetCompanies: {
        type: [String],
        default: ['Google', 'Amazon'],
      },
      targetInterviewDate: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Method to verify candidate password against hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to return safe public user object (never exposes passwordHash)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    goals: this.goals || {
      dailyTarget: 2,
      weeklyTarget: 10,
      targetCompanies: ['Google', 'Amazon'],
      targetInterviewDate: null,
    },
    hasPassword: !!this.passwordHash,
    createdAt: this.createdAt,
  };
};

// Ensure JSON serialization omits passwordHash and reset tokens
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.passwordHash;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
