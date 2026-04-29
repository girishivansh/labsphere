/**
 * Email service — Nodemailer.
 * Uses Gmail SMTP by default. Set EMAIL_USER and EMAIL_PASS in .env.
 * Falls back to console logging if credentials are missing.
 */
const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  // Use Gmail App Password (not your regular password)
    },
  });
  console.log(`📧 Email service ready (${process.env.EMAIL_USER})`);
} else {
  console.log('⚠️  EMAIL_USER / EMAIL_PASS not set — emails will only log to console');
}

const sendMail = async (to, subject, html) => {
  // Always log to console for debugging
  console.log(`\n📧 Sending email to: ${to} | Subject: ${subject}`);

  if (!transporter) {
    console.log('   [STUB] Email content logged below (no SMTP configured):');
    console.log(`   ${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"LabSphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`   ✅ Email delivered to ${to}\n`);
    return true;
  } catch (err) {
    console.error(`   ❌ Email failed: ${err.message}\n`);
    // Don't throw — the OTP is still stored in DB, user can check console fallback
    return false;
  }
};

const sendOtpEmail = async (to, otp, type = 'signup') => {
  const subjects = {
    signup: '🔬 LabSphere — Verify Your Email',
    reset:  '🔑 LabSphere — Password Reset Code',
    verify: '✅ LabSphere — Email Verification',
  };

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 12px 16px; border-radius: 12px;">
          <span style="color: white; font-size: 20px; font-weight: 800;">🔬 LabSphere</span>
        </div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">Your Verification Code</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">Enter this code to ${type === 'reset' ? 'reset your password' : 'verify your email'}:</p>
        <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; margin: 0 auto 24px; max-width: 200px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #7c3aed;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendMail(to, subjects[type] || 'LabSphere OTP', html);
};

const sendInviteEmail = async (to, { instituteName, role, inviteUrl, inviterName }) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 12px 16px; border-radius: 12px;">
          <span style="color: white; font-size: 20px; font-weight: 800;">🔬 LabSphere</span>
        </div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">You've Been Invited!</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">
          <strong>${inviterName}</strong> has invited you to join <strong>${instituteName}</strong> as a <strong>${role.replace('_', ' ')}</strong>.
        </p>
        <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px;">
          Accept Invitation
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Or copy this link: <br/><span style="color: #7c3aed; word-break: break-all;">${inviteUrl}</span></p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">This invitation expires in 7 days.</p>
    </div>
  `;

  return sendMail(to, `You're invited to ${instituteName} on LabSphere`, html);
};

const sendPasswordResetEmail = async (to, otp) => {
  return sendOtpEmail(to, otp, 'reset');
};

module.exports = { sendOtpEmail, sendInviteEmail, sendPasswordResetEmail };
