const express = require('express');
const { getMembers, addMember, inviteMember, updateMember, toggleMemberStatus, resetMemberPassword, deleteMember } = require('../controllers/memberController');
const { authenticate, authorize, ROLES } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, authorize(ROLES.INSTITUTE_ADMIN));

router.get('/',                    getMembers);
router.post('/',                   addMember);
router.post('/invite',             inviteMember);
router.put('/:id',                 updateMember);
router.put('/:id/toggle-status',   toggleMemberStatus);
router.put('/:id/reset-password',  resetMemberPassword);
router.delete('/:id',              deleteMember);

module.exports = router;
