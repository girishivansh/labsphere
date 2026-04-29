const Item = require('../models/Item');
const IssueLog = require('../models/IssueLog');
const ReturnLog = require('../models/ReturnLog');
const DamageReport = require('../models/DamageReport');

const getDashboardStats = async (req, res, next) => {
  try {
    const tf = req.tenantFilter;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [totalItems, lowStock, activeIssues, issuedToday, returnedToday, pendingDamage, overdueCount, recentIssues, recentReturns, typeDistribution] = await Promise.all([
      Item.countDocuments(tf),
      Item.countDocuments({ ...tf, $expr: { $lte: ['$quantity', '$minimumLimit'] } }),
      IssueLog.countDocuments({ ...tf, status: { $in: ['issued', 'overdue'] } }),
      IssueLog.countDocuments({ ...tf, issueDate: { $gte: todayStart, $lte: todayEnd } }),
      ReturnLog.countDocuments({ ...tf, returnDate: { $gte: todayStart, $lte: todayEnd } }),
      DamageReport.countDocuments({ ...tf, actionTaken: 'pending' }),
      IssueLog.countDocuments({ ...tf, status: 'overdue' }),
      IssueLog.find(tf)
        .populate('item', 'name unit')
        .populate('issuedTo', 'name')
        .sort({ issueDate: -1 })
        .limit(5)
        .lean(),
      ReturnLog.find(tf)
        .populate('item', 'name unit')
        .populate('returnedBy', 'name')
        .sort({ returnDate: -1 })
        .limit(5)
        .lean(),
      Item.aggregate([
        { $match: tf.institute ? { institute: tf.institute } : {} },
        { $group: { _id: '$type', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } }
      ]),
    ]);

    // Weekly trends (scoped)
    const weekAgo = new Date(todayStart - 7 * 86400000);
    const matchBase = tf.institute ? { institute: tf.institute } : {};
    const [weeklyIssues, weeklyReturns] = await Promise.all([
      IssueLog.aggregate([
        { $match: { ...matchBase, issueDate: { $gte: weekAgo, $lte: todayEnd } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$issueDate' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      ReturnLog.aggregate([
        { $match: { ...matchBase, returnDate: { $gte: weekAgo, $lte: todayEnd } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$returnDate' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
    ]);

    const recentActivity = [
      ...recentIssues.map(i => ({
        type: 'issue', itemName: i.item?.name, userName: i.issuedTo?.name,
        quantity: i.quantity, unit: i.item?.unit, date: i.issueDate
      })),
      ...recentReturns.map(r => ({
        type: 'return', itemName: r.item?.name, userName: r.returnedBy?.name,
        quantity: r.quantityReturned, unit: r.item?.unit, date: r.returnDate
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      success: true,
      data: {
        totalItems, lowStockItems: lowStock, activeIssues, issuedToday, returnedToday,
        pendingDamageReports: pendingDamage, overdueCount, recentActivity,
        typeDistribution, weeklyTrends: { issues: weeklyIssues, returns: weeklyReturns },
      }
    });
  } catch (err) { next(err); }
};

const getDailyReport = async (req, res, next) => {
  try {
    const tf = req.tenantFilter;
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);

    const [issues, returns, damage] = await Promise.all([
      IssueLog.find({ ...tf, issueDate: { $gte: start, $lte: end } })
        .populate('item', 'name unit type').populate('issuedTo', 'name').populate('issuedBy', 'name').sort({ issueDate: -1 }),
      ReturnLog.find({ ...tf, returnDate: { $gte: start, $lte: end } })
        .populate('item', 'name unit').populate('returnedBy', 'name').sort({ returnDate: -1 }),
      DamageReport.find({ ...tf, reportDate: { $gte: start, $lte: end } })
        .populate('item', 'name').populate('reportedBy', 'name')
    ]);

    res.json({ success: true, data: { date, issues, returns, damage } });
  } catch (err) { next(err); }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const tf = req.tenantFilter;
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);

    const matchBase = tf.institute ? { institute: tf.institute } : {};
    const result = await IssueLog.aggregate([
      { $match: { ...matchBase, issueDate: { $gte: start, $lte: end } } },
      { $group: {
        _id: '$item',
        totalIssues: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        returnedCount: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } }
      }},
      { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $project: { name: '$item.name', type: '$item.type', unit: '$item.unit', totalIssues: 1, totalQuantity: 1, returnedCount: 1 } },
      { $sort: { totalIssues: -1 } }
    ]);

    res.json({ success: true, data: { month, year, items: result } });
  } catch (err) { next(err); }
};

const getDamageReports = async (req, res, next) => {
  try {
    const tf = req.tenantFilter;
    const { page = 1, limit = 20, actionTaken } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { ...tf };
    if (actionTaken) filter.actionTaken = actionTaken;

    const [reports, total] = await Promise.all([
      DamageReport.find(filter)
        .populate('item', 'name type').populate('reportedBy', 'name')
        .sort({ reportDate: -1 }).skip(skip).limit(parseInt(limit)),
      DamageReport.countDocuments(filter)
    ]);

    res.json({
      success: true, data: reports,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) { next(err); }
};

const getLowStockReport = async (req, res, next) => {
  try {
    const tf = req.tenantFilter;
    const matchBase = tf.institute ? { institute: tf.institute } : {};
    const items = await Item.aggregate([
      { $match: { ...matchBase, $expr: { $lte: ['$quantity', '$minimumLimit'] } } },
      { $addFields: { deficit: { $subtract: ['$minimumLimit', '$quantity'] } } },
      { $sort: { deficit: -1 } }
    ]);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getDailyReport, getMonthlyReport, getDamageReports, getLowStockReport };
