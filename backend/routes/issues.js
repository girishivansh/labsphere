const express = require('express');
const { getAllIssues, createIssue, getTodayIssues } = require('../controllers/issuesController');
const { authenticate, authorize, ROLES } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');
const router = express.Router();

router.use(authenticate, tenantScope);

router.get('/',      getAllIssues);
router.get('/today', getTodayIssues);
router.post('/',     authorize(ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), createIssue);

module.exports = router;
