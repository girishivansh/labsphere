const mongoose = require('mongoose');

const returnLogSchema = new mongoose.Schema({
  institute:        { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  issue:            { type: mongoose.Schema.Types.ObjectId, ref: 'IssueLog', required: true },
  item:             { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  returnedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receivedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantityReturned: { type: Number, required: true, min: 0.01 },
  condition:        { type: String, enum: ['good', 'damaged', 'broken'], required: true },
  returnDate:       { type: Date, default: Date.now },
  notes:            { type: String },
}, { timestamps: true });

returnLogSchema.index({ institute: 1, item: 1 });
returnLogSchema.index({ institute: 1, returnDate: -1 });

module.exports = mongoose.model('ReturnLog', returnLogSchema);
