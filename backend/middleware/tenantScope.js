const { ROLES } = require('./auth');

/**
 * Tenant scoping middleware — automatically injects institute filter.
 * Must be used AFTER authenticate middleware.
 * Sets req.tenantFilter which controllers must spread into all queries.
 * SUPER_ADMIN gets no filter (sees everything).
 */
const tenantScope = (req, res, next) => {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    req.tenantFilter = {};
  } else if (req.user.institute) {
    req.tenantFilter = { institute: req.user.institute._id || req.user.institute };
  } else {
    return res.status(403).json({ success: false, message: 'No institute associated with this account' });
  }
  next();
};

module.exports = { tenantScope };
