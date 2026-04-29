const Item = require('../models/Item');
const IssueLog = require('../models/IssueLog');

const getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, search, low_stock } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { ...req.tenantFilter };
    if (type) filter.type = type;
    if (low_stock === 'true') filter.$expr = { $lte: ['$quantity', '$minimumLimit'] };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { itemCode: { $regex: search, $options: 'i' } },
      { storageLocation: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Item.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) { next(err); }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, ...req.tenantFilter }).populate('createdBy', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

const createItem = async (req, res, next) => {
  try {
    const { name, type, quantity, unit, minimumLimit, storageLocation, description, supplier, casNumber, hazardLevel } = req.body;
    const instituteId = req.user.institute._id || req.user.institute;

    if (!name || !type || quantity === undefined || !unit)
      return res.status(400).json({ success: false, message: 'name, type, quantity, unit are required' });

    // Item code unique per institute
    const prefix = type === 'chemical' ? 'CHEM' : 'EQUIP';
    const existing = await Item.find({ institute: instituteId, type }).select('itemCode').lean();
    let maxNum = 0;
    existing.forEach(item => {
      const match = item.itemCode.match(/\d+$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[0]));
    });
    const itemCode = `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;

    const item = await Item.create({
      institute: instituteId,
      itemCode, name, type,
      quantity: parseFloat(quantity),
      unit,
      minimumLimit: parseFloat(minimumLimit) || 0,
      storageLocation, description, supplier, casNumber,
      hazardLevel: hazardLevel || 'low',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    const { name, quantity, unit, minimumLimit, storageLocation, description, supplier, hazardLevel } = req.body;

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, ...req.tenantFilter },
      { name, quantity: parseFloat(quantity), unit, minimumLimit: parseFloat(minimumLimit), storageLocation, description, supplier, hazardLevel },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    const activeIssues = await IssueLog.countDocuments({ item: req.params.id, ...req.tenantFilter, status: 'issued' });
    if (activeIssues > 0)
      return res.status(400).json({ success: false, message: 'Cannot delete item with active issues' });

    const item = await Item.findOneAndDelete({ _id: req.params.id, ...req.tenantFilter });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) { next(err); }
};

const getLowStockItems = async (req, res, next) => {
  try {
    const items = await Item.find({ ...req.tenantFilter, $expr: { $lte: ['$quantity', '$minimumLimit'] } }).sort({ quantity: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem, getLowStockItems };
