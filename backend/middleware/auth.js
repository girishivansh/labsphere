const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROLES = {
  SUPER_ADMIN:    'SUPER_ADMIN',
  INSTITUTE_ADMIN:'INSTITUTE_ADMIN',
  LAB_INCHARGE:   'LAB_INCHARGE',
  STUDENT:        'STUDENT',
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -inviteToken -inviteTokenExpiry').populate('institute', 'name instituteId status');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    // Check institute status (skip for SUPER_ADMIN)
    if (user.role !== ROLES.SUPER_ADMIN && user.institute && user.institute.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your institute has been suspended. Contact support.' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError')  return res.status(401).json({ success: false, message: 'Invalid token' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied. Required: ${roles.join(', ')}` });
  }
  next();
};

module.exports = { authenticate, authorize, ROLES };
