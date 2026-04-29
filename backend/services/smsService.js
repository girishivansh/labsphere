/**
 * SMS service — development stub.
 * In dev: logs to console with visible formatting.
 * In production: replace with Twilio, AWS SNS, etc.
 */

const sendOtpSms = async (phone, otp, type = 'signup') => {
  const messages = {
    signup: `LabSphere: Your verification code is ${otp}. It expires in 5 minutes.`,
    reset:  `LabSphere: Your password reset code is ${otp}. It expires in 5 minutes.`,
    verify: `LabSphere: Your verification code is ${otp}. It expires in 5 minutes.`,
  };

  console.log('\n' + '📱'.repeat(30));
  console.log(`📱 SMS TO: ${phone}`);
  console.log('─'.repeat(60));
  console.log(`   Message: ${messages[type] || messages.verify}`);
  console.log('📱'.repeat(30) + '\n');

  return true;
};

module.exports = { sendOtpSms };
