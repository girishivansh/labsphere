const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institute = require('../models/Institute');
const { generateOtp, verifyOtp } = require('../services/otpService');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');
const { sendOtpSms } = require('../services/smsService');
const { ROLES } = require('../middleware/auth');

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role, institute: user.institute },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// ─── Signup (Institute Admin) ────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { instituteName, name, email, password } = req.body;

    if (!instituteName || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create institute
    const institute = await Institute.create({
      name: instituteName,
      email: email.toLowerCase(),
      status: 'active',
    });

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ROLES.INSTITUTE_ADMIN,
      institute: institute._id,
      emailVerified: true, // Auto-verified since OTP is removed
    });

    // Update institute with creator ref
    institute.createdBy = user._id;
    await institute.save();

    const token = signToken(user);
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          institute: user.institute,
          department: user.department,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (err) { next(err); }
};

// ─── Verify OTP ──────────────────────────────────────────────────────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, type = 'signup' } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    await verifyOtp(email, otp, type);

    // Mark email as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: true },
      { new: true }
    ).populate('institute', 'name instituteId status');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = signToken(user);
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: { token, user },
    });
  } catch (err) {
    if (err.message.includes('OTP')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─── Resend OTP ──────────────────────────────────────────────────────
exports.resendOtp = async (req, res, next) => {
  try {
    const { email, type = 'signup' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = await generateOtp(email, type);
    await sendOtpEmail(email, otp, type);
    if (user.phone) await sendOtpSms(user.phone, otp, type);

    res.json({ success: true, message: 'OTP resent to your email and phone' });
  } catch (err) { next(err); }
};

// ─── Login (All Roles) ──────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('institute', 'name instituteId status');

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact your institute admin.' });
    }

    // Check institute status (skip for SUPER_ADMIN)
    if (user.role !== ROLES.SUPER_ADMIN && user.institute && user.institute.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your institute has been suspended. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // emailVerified check removed

    const token = signToken(user);
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          institute: user.institute,
          department: user.department,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (err) { next(err); }
};

// ─── Forgot Password ────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether user exists
      return res.json({ success: true, message: 'If the email exists, an OTP has been sent.' });
    }

    const otp = await generateOtp(email, 'reset');
    await sendPasswordResetEmail(email, otp);
    if (user.phone) await sendOtpSms(user.phone, otp, 'reset');

    res.json({ success: true, message: 'If the email exists, an OTP has been sent.' });
  } catch (err) { next(err); }
};

// ─── Reset Password ─────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    await verifyOtp(email, otp, 'reset');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate({ email: email.toLowerCase() }, { passwordHash });

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    if (err.message.includes('OTP')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─── Accept Invite ───────────────────────────────────────────────────
exports.acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpiry: { $gt: new Date() },
    }).populate('institute', 'name instituteId status');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invite link' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.inviteToken = undefined;
    user.inviteTokenExpiry = undefined;
    user.isActive = true;
    user.emailVerified = true;
    user.lastLogin = new Date();
    await user.save();

    const jwtToken = signToken(user);

    res.json({
      success: true,
      message: 'Account activated successfully!',
      data: { token: jwtToken, user },
    });
  } catch (err) { next(err); }
};

// ─── Get Invite Info (for the accept page) ───────────────────────────
exports.getInviteInfo = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpiry: { $gt: new Date() },
    }).populate('institute', 'name instituteId').select('name email role institute');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invite link' });
    }

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// ─── Get Me ──────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ─── Change Password ─────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};
