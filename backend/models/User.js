const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  department:   { type: String, trim: true },
  phone:        { type: String, trim: true },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
