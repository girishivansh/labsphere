const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES } = require('../middleware/auth');
const { generateInviteToken, buildInviteUrl } = require('../services/inviteService');
const { sendInviteEmail } = require('../services/emailService');

const ALLOWED_SUB_ROLES = [ROLES.LAB_INCHARGE, ROLES.STUDENT];

// ─── List members of own institute ──────────────────────────────────
exports.getMembers = async (req, res, next) => {
  try {
    const instituteId = req.user.institute._id || req.user.institute;
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = { institute: instituteId };

    if (role && ALLOWED_SUB_ROLES.includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const members = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: members,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// ─── Add member directly (with password) ─────────────────────────────
exports.addMember = async (req, res, next) => {
  try {
    const { name, email, phone, role, department, password } = req.body;
    const instituteId = req.user.institute._id || req.user.institute;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }
    if (!ALLOWED_SUB_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${ALLOWED_SUB_ROLES.join(', ')}` });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      phone,
      role,
      department,
      institute: instituteId,
      isActive: true,
      emailVerified: true,
    };

    if (password) {
      userData.passwordHash = await bcrypt.hash(password, 12);
    }

    const member = await User.create(userData);
    res.status(201).json({ success: true, data: member, message: 'Member added successfully' });
  } catch (err) { next(err); }
};

// ─── Send invite ─────────────────────────────────────────────────────
exports.inviteMember = async (req, res, next) => {
  try {
    const { name, email, role, department } = req.body;
    const instituteId = req.user.institute._id || req.user.institute;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }
    if (!ALLOWED_SUB_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${ALLOWED_SUB_ROLES.join(', ')}` });
    }

    // Check existing
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const { token, expiry } = generateInviteToken();
    const inviteUrl = buildInviteUrl(token);

    const member = await User.create({
      name,
      email: email.toLowerCase(),
      role,
      department,
      institute: instituteId,
      isActive: false, // Activated when invite is accepted
      inviteToken: token,
      inviteTokenExpiry: expiry,
    });

    const instituteName = req.user.institute?.name || 'LabSphere Institute';
    await sendInviteEmail(email, {
      instituteName,
      role,
      inviteUrl,
      inviterName: req.user.name,
    });

    res.status(201).json({
      success: true,
      data: { member, inviteUrl },
      message: 'Invite sent successfully',
    });
  } catch (err) { next(err); }
};

// ─── Update member ───────────────────────────────────────────────────
exports.updateMember = async (req, res, next) => {
  try {
    const instituteId = req.user.institute._id || req.user.institute;
    const { name, phone, department, role } = req.body;

    const member = await User.findOne({ _id: req.params.id, institute: instituteId });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    // Can't change own role or INSTITUTE_ADMIN role
    if (member.role === ROLES.INSTITUTE_ADMIN) {
      return res.status(403).json({ success: false, message: 'Cannot modify institute admin via this endpoint' });
    }

    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (department) member.department = department;
    if (role && ALLOWED_SUB_ROLES.includes(role)) member.role = role;

    await member.save();
    res.json({ success: true, data: member });
  } catch (err) { next(err); }
};

// ─── Toggle active status ────────────────────────────────────────────
exports.toggleMemberStatus = async (req, res, next) => {
  try {
    const instituteId = req.user.institute._id || req.user.institute;
    const member = await User.findOne({ _id: req.params.id, institute: instituteId });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.role === ROLES.INSTITUTE_ADMIN) {
      return res.status(403).json({ success: false, message: 'Cannot deactivate institute admin' });
    }

    member.isActive = !member.isActive;
    await member.save();
    res.json({ success: true, data: member, message: `Member ${member.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};

// ─── Admin reset password ────────────────────────────────────────────
exports.resetMemberPassword = async (req, res, next) => {
  try {
    const instituteId = req.user.institute._id || req.user.institute;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const member = await User.findOne({ _id: req.params.id, institute: instituteId });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    member.passwordHash = await bcrypt.hash(newPassword, 12);
    await member.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

// ─── Delete member ───────────────────────────────────────────────────
exports.deleteMember = async (req, res, next) => {
  try {
    const instituteId = req.user.institute._id || req.user.institute;
    const member = await User.findOne({ _id: req.params.id, institute: instituteId });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.role === ROLES.INSTITUTE_ADMIN) {
      return res.status(403).json({ success: false, message: 'Cannot delete institute admin' });
    }

    await member.deleteOne();
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};
