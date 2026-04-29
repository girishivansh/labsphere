const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true, lowercase: true, trim: true },
  otp:        { type: String, required: true }, // bcrypt hashed
  type:       { type: String, enum: ['signup', 'reset', 'verify'], required: true },
  expiresAt:  { type: Date, required: true },
  attempts:   { type: Number, default: 0 },
}, { timestamps: true });

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ identifier: 1, type: 1 });

module.exports = mongoose.model('Otp', otpSchema);
