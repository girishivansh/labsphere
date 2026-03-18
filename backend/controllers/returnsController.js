const ReturnLog = require('../models/ReturnLog');
const IssueLog = require('../models/IssueLog');
const DamageReport = require('../models/DamageReport');
const Item = require('../models/Item');

const getAllReturns = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [returns, total] = await Promise.all([
      ReturnLog.find()
        .populate('item', 'name unit type')
        .populate('returnedBy', 'name')
        .populate('receivedBy', 'name')
        .sort({ returnDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ReturnLog.countDocuments()
    ]);

    res.json({
      success: true,
      data: returns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) { next(err); }
};

const createReturn = async (req, res, next) => {
  try {
    const { issue: issueId, quantityReturned, condition, notes } = req.body;

    if (!issueId || !quantityReturned || !condition)
      return res.status(400).json({ success: false, message: 'issue, quantityReturned, condition are required' });

    // Validate issue exists
    const issue = await IssueLog.findById(issueId);
    if (!issue)
      return res.status(404).json({ success: false, message: 'Issue record not found' });

    if (issue.status === 'returned')
      return res.status(400).json({ success: false, message: 'This issue is already fully returned' });

    // Create return log
    const returnLog = await ReturnLog.create({
      issue: issueId,
      item: issue.item,
      returnedBy: issue.issuedTo,
      receivedBy: req.user._id,
      quantityReturned: parseFloat(quantityReturned),
      condition,
      notes
    });

    // Update issue status to returned
    await IssueLog.findByIdAndUpdate(issueId, { status: 'returned' });

    // Restore stock based on condition
    let stockIncrease = 0;
    if (condition === 'good')    stockIncrease = parseFloat(quantityReturned);
    if (condition === 'damaged') stockIncrease = parseFloat(quantityReturned) * 0.5;
    // broken = 0 restore

    if (stockIncrease > 0) {
      await Item.findByIdAndUpdate(issue.item, { $inc: { quantity: stockIncrease } });
    }

    // Auto-create damage report for damaged/broken
    if (condition === 'damaged' || condition === 'broken') {
      await DamageReport.create({
        item: issue.item,
        reportedBy: req.user._id,
        returnLog: returnLog._id,
        issueLog: issueId,
        damageType: condition,
        description: notes || `Item returned in ${condition} condition`,
        quantityAffected: parseFloat(quantityReturned),
        actionTaken: 'pending'
      });
    }

    const populated = await ReturnLog.findById(returnLog._id)
      .populate('item', 'name unit')
      .populate('returnedBy', 'name')
      .populate('receivedBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

const getRecentReturns = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const returns = await ReturnLog.find({ returnDate: { $gte: start, $lte: end } })
      .populate('item', 'name unit')
      .populate('returnedBy', 'name')
      .sort({ returnDate: -1 });

    res.json({ success: true, data: returns });
  } catch (err) { next(err); }
};

module.exports = { getAllReturns, createReturn, getRecentReturns };
