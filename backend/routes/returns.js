const express = require('express');
const { getAllReturns, createReturn, getRecentReturns } = require('../controllers/returnsController');
const { authenticate, authorize, ROLES } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');
const router = express.Router();

router.use(authenticate, tenantScope);

router.get('/',       getAllReturns);
router.get('/recent', getRecentReturns);
router.post('/',      authorize(ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), createReturn);

module.exports = router;
