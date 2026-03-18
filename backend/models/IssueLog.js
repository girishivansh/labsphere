const mongoose = require('mongoose');

const issueLogSchema = new mongoose.Schema({
  item:               { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  issuedTo:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity:           { type: Number, required: true, min: 0.01 },
  purpose:            { type: String, trim: true },
  expectedReturnDate: { type: Date },
  issueDate:          { type: Date, default: Date.now },
  status:             { type: String, enum: ['issued', 'returned', 'partially_returned', 'overdue'], default: 'issued' },
  notes:              { type: String },
}, { timestamps: true });

issueLogSchema.index({ item: 1 });
issueLogSchema.index({ issuedTo: 1 });
issueLogSchema.index({ status: 1 });
issueLogSchema.index({ issueDate: -1 });

module.exports = mongoose.model('IssueLog', issueLogSchema);
