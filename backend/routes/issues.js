const express = require('express');
const { getAllIssues, createIssue, getTodayIssues } = require('../controllers/issuesController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.get('/',      getAllIssues);
router.get('/today', getTodayIssues);
router.post('/',     authorize('admin', 'teacher'), createIssue);
module.exports = router;
