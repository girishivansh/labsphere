const crypto = require('crypto');

/**
 * Generate a secure invite token with expiry.
 * Token is URL-safe base64.
 */
const generateInviteToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return { token, expiry };
};

/**
 * Build the invite URL for the frontend.
 */
const buildInviteUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/accept-invite/${token}`;
};

module.exports = { generateInviteToken, buildInviteUrl };
