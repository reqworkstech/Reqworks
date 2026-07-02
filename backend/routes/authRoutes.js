const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { verifyToken } = require('../middleware/authMiddleware');
const { registerRules, loginRules, validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../middleware/asyncHandler');

// Token generation helper
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Customer ID generation helper
const generateCustomerId = async () => {
  let isUnique = false;
  let customerId = '';
  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    customerId = `CID-${randomNum}`;
    const existing = await User.findOne({ customerId });
    if (!existing) {
      isUnique = true;
    }
  }
  return customerId;
};

// Cookie configurations
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // support localhost proxying / cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, registerRules, validate, asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone, occupation } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      if (!existing.isEmailVerified) {
        // Delete unverified user to allow fresh registration
        await User.deleteOne({ _id: existing._id });
      } else {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
    }

    // Check duplicate phone
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        if (existingPhone.isEmailVerified || existingPhone.email !== email.toLowerCase()) {
          return res.status(409).json({ success: false, message: 'Phone number already registered' });
        }
      }
    }

    // Create verification token & 6-digit numeric OTP
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const customerId = await generateCustomerId();

    // Create user
    const user = await User.create({
      customerId,
      name,
      email,
      password, // hashed automatically by pre-save hook
      phone,
      occupation,
      emailVerificationToken: verifyToken,
      emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      emailVerificationOTP: verifyOTP,
      emailVerificationOTPExpiry: Date.now() + 30 * 60 * 1000 // 30 minutes
    });

    // Send verification email with token & OTP
    await sendVerificationEmail(user.email, user.name, verifyToken, verifyOTP);

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role });

    res
      .status(201)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        message: 'Account created. Please verify your email using the OTP code.',
        user: {
          id: user._id,
          customerId: user.customerId,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
}));

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email address using 6-digit OTP code
 * @access  Public
 */
router.post('/verify-otp', asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
}));

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token (cookie)
 * @access  Public
 */
router.post('/login', authLimiter, loginRules, validate, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user WITH password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    res
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        user: {
          id: user._id,
          customerId: user.customerId,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
}));

/**
 * @route   POST /api/auth/admin/login
 * @desc    Authenticate admin user & get token (cookie)
 * @access  Public (Admin only)
 */
router.post('/admin/login', authLimiter, loginRules, validate, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Admin credentials invalid' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Admin credentials invalid' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: 'admin' });

    // 8 hour session for administrators
    res
      .cookie('token', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 })
      .json({
        success: true,
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'admin'
        }
      });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
}));

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address using token
 * @access  Public
 */
router.get('/verify-email/:token', asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token invalid or expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private
 */
router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -emailVerificationToken -emailVerificationExpiry -emailVerificationOTP -emailVerificationOTPExpiry -passwordResetToken -passwordResetExpiry');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Fetch user detail error:', err);
    res.status(500).json({ success: false, message: 'Server error while loading user details' });
  }
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Log user out by clearing cookie
 * @access  Private
 */
router.post('/logout', verifyToken, (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    })
    .json({ success: true, message: 'Logged out successfully' });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token and print to console log
 * @access  Public
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found with this email' });
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ success: true, message: 'Password reset link has been sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error during forgot password' });
  }
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password; // hashes automatically on save
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully! You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
}));

/**
 * @route   POST /api/auth/check-email
 * @desc    Check if email already exists
 * @access  Public
 */
router.post('/check-email', asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.isEmailVerified) {
      return res.json({ success: true, exists: true, message: 'Email is already registered' });
    }
    return res.json({ success: true, exists: false });
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({ success: false, message: 'Server error checking email' });
  }
}));

/**
 * @route   POST /api/auth/check-phone
 * @desc    Check if phone already exists
 * @access  Public
 */
router.post('/check-phone', asyncHandler(async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      if (existingPhone.isEmailVerified || (email && existingPhone.email !== email.toLowerCase())) {
        return res.json({ success: true, exists: true, message: 'Phone number already registered' });
      }
    }
    return res.json({ success: true, exists: false });
  } catch (err) {
    console.error('Check phone error:', err);
    res.status(500).json({ success: false, message: 'Server error checking phone number' });
  }
}));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile details securely (isolated by req.user.id session)
 * @access  Private
 */
router.put('/profile', verifyToken, asyncHandler(async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Validate phone number (exactly 10 digits if provided)
    if (phone) {
      const phoneClean = phone.replace(/\D/g, '');
      if (phoneClean.length !== 10) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
      }
    }

    // Load existing user record using req.user.id (isolated to current session)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newEmail = email.toLowerCase().trim();

    // Check email collisions (verified accounts only, excluding current user)
    const emailExists = await User.findOne({ email: newEmail, _id: { $ne: req.user.id } });
    if (emailExists && emailExists.isEmailVerified) {
      return res.status(409).json({ success: false, message: 'Email address already registered' });
    }

    // Check phone collisions (excluding current user)
    if (phone) {
      const phoneClean = phone.replace(/\D/g, '');
      const phoneExists = await User.findOne({ phone: phoneClean, _id: { $ne: req.user.id } });
      if (phoneExists) {
        if (phoneExists.isEmailVerified || phoneExists.email !== newEmail) {
          return res.status(409).json({ success: false, message: 'Phone number already registered' });
        }
      }
    }

    const emailChanged = newEmail !== user.email;

    user.name = name.trim();
    user.phone = phone ? phone.replace(/\D/g, '') : '';

    if (emailChanged) {
      // Generate secure verification tokens
      const verifyTokenBytes = crypto.randomBytes(32).toString('hex');
      const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();

      user.email = newEmail;
      user.isEmailVerified = false;
      user.emailVerificationToken = verifyTokenBytes;
      user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      user.emailVerificationOTP = verifyOTP;
      user.emailVerificationOTPExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

      // Asynchronously send new verification code to user
      sendVerificationEmail(newEmail, user.name, verifyTokenBytes, verifyOTP);
    }

    await user.save();

    res.json({
      success: true,
      message: emailChanged 
        ? 'Profile details updated. Please verify your new email using the code sent to your inbox.' 
        : 'Profile details updated successfully!',
      user: {
        id: user._id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
}));

module.exports = router;
