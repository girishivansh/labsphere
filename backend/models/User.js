const mongoose = require('mongoose');

const ROLES = ['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'LAB_INCHARGE', 'STUDENT'];

const userSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:      { type: String },  // null for invite-pending users
  role:              { type: String, enum: ROLES, required: true },
  institute:         { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },  // null for SUPER_ADMIN
  department:        { type: String, trim: true },
  isActive:          { type: Boolean, default: true },
  emailVerified:     { type: Boolean, default: false },
  inviteToken:       { type: String },
  inviteTokenExpiry: { type: Date },
  lastLogin:         { type: Date },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.inviteToken;
  delete obj.inviteTokenExpiry;
  return obj;
};

userSchema.index({ institute: 1, role: 1 });
userSchema.index({ inviteToken: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
