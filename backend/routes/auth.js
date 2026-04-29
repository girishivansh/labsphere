const express = require('express');
const { signup, verifyOtp, resendOtp, login, forgotPassword, resetPassword, acceptInvite, getInviteInfo, getMe, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/signup',         signup);
router.post('/verify-otp',     verifyOtp);
router.post('/resend-otp',     resendOtp);
router.post('/login',          login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Invite routes (public)
router.get('/invite/:token',   getInviteInfo);
router.post('/accept-invite/:token', acceptInvite);

// Protected
router.get('/me',              authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
