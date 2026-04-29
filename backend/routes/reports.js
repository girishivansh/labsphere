const express = require('express');
const { getDashboardStats, getDailyReport, getMonthlyReport, getDamageReports, getLowStockReport } = require('../controllers/reportsController');
const { authenticate, authorize, ROLES } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');
const router = express.Router();

router.use(authenticate, tenantScope);

router.get('/dashboard', getDashboardStats);
router.get('/daily',     authorize(ROLES.SUPER_ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), getDailyReport);
router.get('/monthly',   authorize(ROLES.SUPER_ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), getMonthlyReport);
router.get('/damage',    authorize(ROLES.SUPER_ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), getDamageReports);
router.get('/low-stock', authorize(ROLES.SUPER_ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), getLowStockReport);

module.exports = router;
