const IssueLog = require('../models/IssueLog');
const Item = require('../models/Item');

const getAllIssues = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, user_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (req.user.role === 'student') filter.issuedTo = req.user._id;
    else if (user_id) filter.issuedTo = user_id;
    if (status) filter.status = status;

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

    res.json({
      success: true,
      data: issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) { next(err); }
};

const createIssue = async (req, res, next) => {
  try {
    const { item: itemId, issuedTo, quantity, purpose, expectedReturnDate } = req.body;

    if (!itemId || !issuedTo || !quantity)
      return res.status(400).json({ success: false, message: 'item, issuedTo, quantity are required' });

    // Check item exists and has stock
    const item = await Item.findById(itemId);
    if (!item)
      return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.quantity < parseFloat(quantity))
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.quantity} ${item.unit}` });

    // Find user by name (case-insensitive)
    const User = require('../models/User');
    const issuedToUser = await User.findOne({ name: { $regex: new RegExp(`^${issuedTo.trim()}$`, 'i') }, isActive: true });
    if (!issuedToUser)
      return res.status(404).json({ success: false, message: `User "${issuedTo}" not found. Check the name and try again.` });

    // Deduct stock
    await Item.findByIdAndUpdate(itemId, { $inc: { quantity: -parseFloat(quantity) } });

    // Create issue record
    const issue = await IssueLog.create({
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

    const issues = await IssueLog.find({ issueDate: { $gte: start, $lte: end } })
      .populate('item', 'name unit type')
      .populate('issuedTo', 'name')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });

    res.json({ success: true, data: issues });
  } catch (err) { next(err); }
};

module.exports = { getAllIssues, createIssue, getTodayIssues };
