const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  instituteId: { type: String, unique: true },
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  address:     { type: String, trim: true },
  logo:        { type: String },
  status:      { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate instituteId before save
instituteSchema.pre('save', async function (next) {
  if (this.isNew && !this.instituteId) {
    const count = await mongoose.model('Institute').countDocuments();
    this.instituteId = `INS-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

instituteSchema.index({ status: 1 });

module.exports = mongoose.model('Institute', instituteSchema);
