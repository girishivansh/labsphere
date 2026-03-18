const mongoose = require('mongoose');
const QRCode = require('qrcode');

const itemSchema = new mongoose.Schema({
  itemCode:        { type: String, required: true, unique: true, trim: true },
  name:            { type: String, required: true, trim: true },
  type:            { type: String, enum: ['chemical', 'equipment'], required: true },
  quantity:        { type: Number, required: true, min: 0, default: 0 },
  unit:            { type: String, enum: ['g', 'mg', 'kg', 'ml', 'L', 'pieces', 'boxes', 'bottles'], required: true },
  minimumLimit:    { type: Number, default: 0, min: 0 },
  storageLocation: { type: String, trim: true },
  description:     { type: String, trim: true },
  supplier:        { type: String, trim: true },
  casNumber:       { type: String, trim: true },
  hazardLevel:     { type: String, enum: ['low', 'medium', 'high', 'extreme'], default: 'low' },
  qrCode:          { type: String },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate QR code on new item
itemSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const qrData = JSON.stringify({ id: this._id, code: this.itemCode, name: this.name });
      this.qrCode = await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('QR generation failed:', err.message);
    }
  }
  next();
});

itemSchema.index({ name: 'text', itemCode: 'text' });
itemSchema.index({ type: 1 });

module.exports = mongoose.model('Item', itemSchema);
