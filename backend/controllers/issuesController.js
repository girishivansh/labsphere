const IssueLog = require('../models/IssueLog');
const Item = require('../models/Item');
const User = require('../models/User');
const { ROLES } = require('../middleware/auth');

const getAllIssues = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, user_id, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { ...req.tenantFilter };
    if (req.user.role === ROLES.STUDENT) filter.issuedTo = req.user._id;
    else if (user_id) filter.issuedTo = user_id;
    if (status) filter.status = status;

    // Mark overdue issues on-the-fly (scoped to institute)
    const now = new Date();
    await IssueLog.updateMany(
      { ...req.tenantFilter, status: 'issued', expectedReturnDate: { $lt: now, $ne: null } },
      { $set: { status: 'overdue' } }
    );

    const [issues, total] = await Promise.all([
      IssueLog.find(filter)
        .populate('item', 'name itemCode unit type')
        .populate('issuedTo', 'name email')
        .populate('issuedBy', 'name')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      IssueLog.countDocuments(filter)
    ]);

    // Client-side filter for search across populated fields
    let filtered = issues;
    if (search) {
      const s = search.toLowerCase();
      filtered = issues.filter(i =>
        i.item?.name?.toLowerCase().includes(s) ||
        i.item?.itemCode?.toLowerCase().includes(s) ||
        i.issuedTo?.name?.toLowerCase().includes(s) ||
        i.purpose?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      data: filtered,
      pagination: {
        total: search ? filtered.length : total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((search ? filtered.length : total) / parseInt(limit))
      }
    });
  } catch (err) { next(err); }
};

const createIssue = async (req, res, next) => {
  try {
    const { item: itemId, issuedTo, quantity, purpose, expectedReturnDate } = req.body;
    const instituteId = req.user.institute._id || req.user.institute;

    if (!itemId || !issuedTo || !quantity)
      return res.status(400).json({ success: false, message: 'item, issuedTo, quantity are required' });

    // Check item exists and belongs to this institute
    const item = await Item.findOne({ _id: itemId, institute: instituteId });
    if (!item)
      return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.quantity < parseFloat(quantity))
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.quantity} ${item.unit}` });

    // Find user by name within same institute
    const issuedToUser = await User.findOne({
      name: { $regex: new RegExp(`^${issuedTo.trim()}$`, 'i') },
      institute: instituteId,
      isActive: true
    });
    if (!issuedToUser)
      return res.status(404).json({ success: false, message: `User "${issuedTo}" not found in your institute.` });

    // Deduct stock
    await Item.findByIdAndUpdate(itemId, { $inc: { quantity: -parseFloat(quantity) } });

    // Create issue record
    const issue = await IssueLog.create({
      institute: instituteId,
      item: itemId,
      issuedTo: issuedToUser._id,
      issuedBy: req.user._id,
      quantity: parseFloat(quantity),
      purpose,
      expectedReturnDate
    });

    const populated = await IssueLog.findById(issue._id)
      .populate('item', 'name itemCode unit type')
      .populate('issuedTo', 'name email')
      .populate('issuedBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

const getTodayIssues = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const issues = await IssueLog.find({ ...req.tenantFilter, issueDate: { $gte: start, $lte: end } })
      .populate('item', 'name unit type')
      .populate('issuedTo', 'name')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });

    res.json({ success: true, data: issues });
  } catch (err) { next(err); }
};

module.exports = { getAllIssues, createIssue, getTodayIssues };
