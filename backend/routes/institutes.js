const express = require('express');
const { getAllInstitutes, getInstitute, updateInstituteStatus, deleteInstitute, getPlatformStats } = require('../controllers/instituteController');
const { authenticate, authorize, ROLES } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.get('/',           getAllInstitutes);
router.get('/stats',      getPlatformStats);
router.get('/:id',        getInstitute);
router.put('/:id/status', updateInstituteStatus);
router.delete('/:id',     deleteInstitute);

module.exports = router;
