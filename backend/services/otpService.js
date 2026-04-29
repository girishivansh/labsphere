const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Otp = require('../models/Otp');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP, hash it, store in DB.
 * Returns the plain OTP (for sending via email/SMS).
 */
const generateOtp = async (identifier, type = 'signup') => {
  // Remove any existing OTPs for this identifier+type
  await Otp.deleteMany({ identifier: identifier.toLowerCase(), type });

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashed = await bcrypt.hash(otp, 10);

  await Otp.create({
    identifier: identifier.toLowerCase(),
    otp: hashed,
    type,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  return otp;
};

/**
 * Verify an OTP. Returns true if valid, throws error if not.
 */
const verifyOtp = async (identifier, plainOtp, type = 'signup') => {
  const record = await Otp.findOne({
    identifier: identifier.toLowerCase(),
    type,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new Error('OTP expired or not found. Please request a new one.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new Error('Too many attempts. Please request a new OTP.');
  }

  const isValid = await bcrypt.compare(plainOtp, record.otp);
  if (!isValid) {
    record.attempts += 1;
    await record.save();
    throw new Error(`Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`);
  }

  // Valid — delete the OTP record
  await record.deleteOne();
  return true;
};

module.exports = { generateOtp, verifyOtp };
