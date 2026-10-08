const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/token');

// Basic email regex format check
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Input Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and cannot be empty',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim() || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // 2. Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // 3. Hash password explicitly
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user record
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });

    // 5. Generate authentication token
    const token = generateToken(user._id);

    // 6. Return safe response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: formatUserResponse(user),
        token,
      },
    });
  } catch (error) {
    // Defensive check for concurrent duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user & return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Find user and explicitly select passwordHash (which is select: false)
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Generate token
    const token = generateToken(user._id);

    // 5. Return safe response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: formatUserResponse(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const formatUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  targetRole: user.targetRole || 'Software Development Engineer',
  preferredLanguage: user.preferredLanguage || 'C++',
  bio: user.bio || '',
  leetcodeHandle: user.leetcodeHandle || '',
  codeforcesHandle: user.codeforcesHandle || '',
  githubHandle: user.githubHandle || '',
  dailyGoal: user.dailyGoal || 2,
  reviewPreset: user.reviewPreset || 'balanced',
  avatar: user.avatar || '',
});

/**
 * @desc    Get currently authenticated user identity
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: formatUserResponse(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile or password
 * @route   PUT /api/auth/profile
 * @access  Private (Requires JWT)
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      });
    }

    const {
      name,
      currentPassword,
      newPassword,
      targetRole,
      preferredLanguage,
      bio,
      leetcodeHandle,
      codeforcesHandle,
      githubHandle,
      dailyGoal,
      reviewPreset,
    } = req.body;

    // 1. Update Name (if supplied)
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty',
        });
      }
      user.name = name.trim();
    }

    // 2. Update Developer Profile Fields
    if (targetRole !== undefined) user.targetRole = String(targetRole).trim();
    if (preferredLanguage !== undefined) user.preferredLanguage = String(preferredLanguage).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (leetcodeHandle !== undefined) user.leetcodeHandle = String(leetcodeHandle).trim();
    if (codeforcesHandle !== undefined) user.codeforcesHandle = String(codeforcesHandle).trim();
    if (githubHandle !== undefined) user.githubHandle = String(githubHandle).trim();
    if (dailyGoal !== undefined && Number(dailyGoal) >= 1 && Number(dailyGoal) <= 10) {
      user.dailyGoal = Number(dailyGoal);
    }
    if (reviewPreset !== undefined && ['balanced', 'aggressive', 'relaxed'].includes(reviewPreset)) {
      user.reviewPreset = reviewPreset;
    }

    // 3. Change Password (if supplied)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Account details updated successfully',
      data: {
        user: formatUserResponse(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate with Google OAuth ID token credential
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google credential or access token is required',
      });
    }

    let payload;
    if (accessToken && typeof accessToken === 'string') {
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken.trim()}` },
      });

      if (!googleRes.ok) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google access token',
        });
      }
      payload = await googleRes.json();
    } else {
      // Verify token with Google's tokeninfo API
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential.trim())}`
      );

      if (!googleRes.ok) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google credential',
        });
      }
      payload = await googleRes.json();
    }

    const { email, sub: googleId, name, picture, aud } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account does not provide an email address',
      });
    }

    // Verify audience matches configured Google Client ID if present
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && aud && aud !== expectedClientId) {
      return res.status(401).json({
        success: false,
        message: 'Google credential was issued for a different client ID',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name?.trim() || 'Google User',
        email: normalizedEmail,
        googleId,
        avatar: picture || '',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: formatUserResponse(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initiate password reset by generating a secure token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Generic safe message if user not found (prevents email enumeration)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, password reset instructions have been generated.',
      });
    }

    // Generate secure 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Set 1-hour expiration
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, password reset instructions have been generated.',
      data: {
        resetToken: rawToken,
        resetUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using valid reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.body;
    const newPassword = req.body.newPassword || req.body.password;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is required',
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password is required and must be at least 6 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You are now logged in.',
      data: {
        user: formatUserResponse(user),
        token: authToken,
      },
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
  googleLogin,
  forgotPassword,
  resetPassword,
};
