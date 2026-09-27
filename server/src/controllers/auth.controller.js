const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const generateToken = require('../utils/generateToken');

// Email regex pattern for basic RFC-compliant structure validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account and return JWT
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation: name presence
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // Validation: email presence and format
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    // Validation: password presence and minimum length
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Hash password with bcrypt (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Persist new user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and return JWT
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation: required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by normalized email
    const user = await User.findOne({ email: normalizedEmail });

    // Validate existence & password hash comparison
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user details
 * @access  Private (Bearer token required)
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toSafeObject ? req.user.toSafeObject() : {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar || null,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile details (e.g. name)
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const trimmed = name.trim();
    if (trimmed.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = trimmed;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message,
    });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change authenticated user password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user has a passwordHash, verify the current password first
    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required',
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to change password: ' + error.message,
    });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset code
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent.',
      });
    }

    // Generate 6-digit numeric reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production';

    const responsePayload = {
      success: true,
      message: 'If an account exists with this email, a verification code has been dispatched. It will expire in 15 minutes.',
    };

    // In production, resetCode MUST NOT be returned in the HTTP response to prevent account takeover.
    // In local development / test suites, it is provided to allow automated testing without an active SMTP server.
    if (!isProduction) {
      responsePayload.resetCode = resetCode;
      responsePayload.devNotice = 'Development mode: resetCode included because external SMTP is not configured.';
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request: ' + error.message,
    });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using verification code
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code, and new password are required',
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const hashedCode = crypto.createHash('sha256').update(String(resetCode).trim()).digest('hex');

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedCode,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code. Please request a new code.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password: ' + error.message,
    });
  }
};

/**
 * @route   GET /api/auth/goals
 * @desc    Get user practice goals, target companies, and today/weekly progress
 * @access  Private
 */
const getUserGoals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const goals = user.goals || {
      dailyTarget: 2,
      weeklyTarget: 10,
      targetCompanies: ['Google', 'Amazon'],
      targetInterviewDate: null,
    };

    // Calculate start of today (UTC midnight)
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count attempts/solves today and in past 7 days
    const [todayAttempts, weekAttempts] = await Promise.all([
      Attempt.find({
        userId: user._id,
        attemptedAt: { $gte: startOfToday },
      }),
      Attempt.find({
        userId: user._id,
        attemptedAt: { $gte: sevenDaysAgo },
      }),
    ]);

    // Unique problems solved today and this week
    const todaySolvedSet = new Set();
    todayAttempts.forEach((a) => {
      if (a.status === 'solved' && a.problemId) {
        todaySolvedSet.add(a.problemId.toString());
      }
    });

    const weekSolvedSet = new Set();
    weekAttempts.forEach((a) => {
      if (a.status === 'solved' && a.problemId) {
        weekSolvedSet.add(a.problemId.toString());
      }
    });

    const todaySolved = todaySolvedSet.size || todayAttempts.length;
    const weekSolved = weekSolvedSet.size || weekAttempts.length;

    const dailyTarget = goals.dailyTarget || 2;
    const weeklyTarget = goals.weeklyTarget || 10;

    // Days until interview countdown
    let daysUntilInterview = null;
    let interviewUrgency = null;
    if (goals.targetInterviewDate) {
      const interviewDate = new Date(goals.targetInterviewDate);
      const diffTime = interviewDate.getTime() - now.getTime();
      daysUntilInterview = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysUntilInterview <= 0) {
        interviewUrgency = 'today_or_passed';
      } else if (daysUntilInterview <= 14) {
        interviewUrgency = 'crunch_time';
      } else if (daysUntilInterview <= 45) {
        interviewUrgency = 'accelerated';
      } else {
        interviewUrgency = 'on_track';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        goals,
        progress: {
          todaySolved,
          dailyTarget,
          todayTargetMet: todaySolved >= dailyTarget,
          todayProgressPct: Math.min(100, Math.round((todaySolved / dailyTarget) * 100)),
          weekSolved,
          weeklyTarget,
          weeklyTargetMet: weekSolved >= weeklyTarget,
          weeklyProgressPct: Math.min(100, Math.round((weekSolved / weeklyTarget) * 100)),
          daysUntilInterview,
          interviewUrgency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/goals
 * @desc    Update user target goals (daily target, weekly target, target companies, interview date)
 * @access  Private
 */
const updateUserGoals = async (req, res, next) => {
  try {
    const { dailyTarget, weeklyTarget, targetCompanies, targetInterviewDate } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.goals) {
      user.goals = {};
    }

    if (dailyTarget !== undefined) {
      const num = Number(dailyTarget);
      if (isNaN(num) || num < 1 || num > 50) {
        return res.status(400).json({ success: false, message: 'Daily target must be between 1 and 50' });
      }
      user.goals.dailyTarget = num;
    }

    if (weeklyTarget !== undefined) {
      const num = Number(weeklyTarget);
      if (isNaN(num) || num < 1 || num > 200) {
        return res.status(400).json({ success: false, message: 'Weekly target must be between 1 and 200' });
      }
      user.goals.weeklyTarget = num;
    }

    if (targetCompanies !== undefined) {
      if (Array.isArray(targetCompanies)) {
        user.goals.targetCompanies = targetCompanies
          .map((c) => String(c).trim())
          .filter((c) => c.length > 0)
          .slice(0, 10);
      }
    }

    if (targetInterviewDate !== undefined) {
      if (!targetInterviewDate) {
        user.goals.targetInterviewDate = null;
      } else {
        const parsedDate = new Date(targetInterviewDate);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid interview date format' });
        }
        user.goals.targetInterviewDate = parsedDate;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Goals updated successfully',
      data: user.goals,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getUserGoals,
  updateUserGoals,
};
