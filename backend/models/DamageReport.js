const mongoose = require('mongoose');

const damageReportSchema = new mongoose.Schema({
  institute:        { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  item:             { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  reportedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  returnLog:        { type: mongoose.Schema.Types.ObjectId, ref: 'ReturnLog' },
  issueLog:         { type: mongoose.Schema.Types.ObjectId, ref: 'IssueLog' },
  damageType:       { type: String, enum: ['damaged', 'broken', 'lost', 'contaminated'], required: true },
  description:      { type: String, required: true },
  quantityAffected: { type: Number },
  estimatedCost:    { type: Number },
  actionTaken:      { type: String, enum: ['repaired', 'replaced', 'discarded', 'pending'], default: 'pending' },
  reportDate:       { type: Date, default: Date.now },
  resolvedAt:       { type: Date },
  resolvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

damageReportSchema.index({ institute: 1, item: 1 });
damageReportSchema.index({ institute: 1, reportDate: -1 });

module.exports = mongoose.model('DamageReport', damageReportSchema);
