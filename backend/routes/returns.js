const express = require('express');
const { getAllReturns, createReturn, getRecentReturns } = require('../controllers/returnsController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.get('/',       getAllReturns);
router.get('/recent', getRecentReturns);
router.post('/',      authorize('admin', 'teacher'), createReturn);
module.exports = router;
