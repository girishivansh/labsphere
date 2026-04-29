const Institute = require('../models/Institute');
const User = require('../models/User');
const Item = require('../models/Item');
const IssueLog = require('../models/IssueLog');
const ReturnLog = require('../models/ReturnLog');
const DamageReport = require('../models/DamageReport');
const { ROLES } = require('../middleware/auth');

// ─── List all institutes (SUPER_ADMIN) ──────────────────────────────
exports.getAllInstitutes = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { instituteId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Institute.countDocuments(filter);
    const institutes = await Institute.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach member counts
    const enriched = await Promise.all(institutes.map(async (inst) => {
      const memberCount = await User.countDocuments({ institute: inst._id });
      const itemCount   = await Item.countDocuments({ institute: inst._id });
      return { ...inst.toObject(), memberCount, itemCount };
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// ─── Get institute by ID ─────────────────────────────────────────────
exports.getInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findById(req.params.id).populate('createdBy', 'name email');
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const memberCount = await User.countDocuments({ institute: institute._id });
    const itemCount   = await Item.countDocuments({ institute: institute._id });
    const roleCounts  = await User.aggregate([
      { $match: { institute: institute._id } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: { ...institute.toObject(), memberCount, itemCount, roleCounts },
    });
  } catch (err) { next(err); }
};

// ─── Update institute status (approve/suspend) ──────────────────────
exports.updateInstituteStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    res.json({ success: true, data: institute, message: `Institute ${status}` });
  } catch (err) { next(err); }
};

// ─── Delete institute + all its data ─────────────────────────────────
exports.deleteInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findById(req.params.id);
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const instId = institute._id;

    // Cascade delete all tenant data
    const [users, items, issues, returns, damages] = await Promise.all([
      User.deleteMany({ institute: instId }),
      Item.deleteMany({ institute: instId }),
      IssueLog.deleteMany({ institute: instId }),
      ReturnLog.deleteMany({ institute: instId }),
      DamageReport.deleteMany({ institute: instId }),
    ]);

    await institute.deleteOne();

    res.json({
      success: true,
      message: `Institute "${institute.name}" and all its data have been permanently deleted`,
      data: {
        deletedUsers: users.deletedCount,
        deletedItems: items.deletedCount,
        deletedIssues: issues.deletedCount,
        deletedReturns: returns.deletedCount,
        deletedDamageReports: damages.deletedCount,
      },
    });
  } catch (err) { next(err); }
};

// ─── Platform stats ──────────────────────────────────────────────────
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalInstitutes, activeInstitutes, suspendedInstitutes, totalUsers, totalItems] = await Promise.all([
      Institute.countDocuments(),
      Institute.countDocuments({ status: 'active' }),
      Institute.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: { $ne: ROLES.SUPER_ADMIN } }),
      Item.countDocuments(),
    ]);

    const roleDistribution = await User.aggregate([
      { $match: { role: { $ne: ROLES.SUPER_ADMIN } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const recentInstitutes = await Institute.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: {
        totalInstitutes, activeInstitutes, suspendedInstitutes,
        totalUsers, totalItems,
        roleDistribution,
        recentInstitutes,
      },
    });
  } catch (err) { next(err); }
};
