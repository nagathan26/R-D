// server/src/models/UserIndia.model.js
const mongoose = require('mongoose');

const UserIndiaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    designation: { type: String, trim: true, default: 'Director / Founder' },
    role: {
      type: String,
      enum: ['STARTUP_FOUNDER_DIRECTOR', 'FINANCE_HEAD', 'TECH_LEAD', 'TAX_CONSULTANT', 'PARTNER_CHARTERED_ACCOUNTANT', 'CLIENT_ADMIN'],
      default: 'STARTUP_FOUNDER_DIRECTOR'
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    emailVerified: { type: Boolean, default: true },
    verificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserIndia', UserIndiaSchema);
