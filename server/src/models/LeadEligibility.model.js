const mongoose = require('mongoose');

const LeadEligibilitySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address format']
    },
    industry: {
      type: String,
      required: true,
      enum: ['Software/SaaS', 'Hardware/IoT', 'Biotech/Life Sciences', 'Engineering Services', 'Other']
    },
    headcount: {
      type: Number,
      required: true,
      min: [1, 'Headcount must be at least 1']
    },
    annualEngineeringPayroll: {
      type: Number,
      required: [true, 'Annual engineering payroll is required'],
      min: [0, 'Payroll cannot be negative']
    },
    contractorSpend: {
      type: Number,
      default: 0,
      min: 0
    },
    cloudHostingSpend: {
      type: Number,
      default: 0,
      min: 0
    },
    jurisdiction: {
      type: String,
      default: 'US-Federal',
      enum: ['US-Federal', 'US-State', 'UK', 'Canada-SRED']
    },
    hasPriorClaims: {
      type: Boolean,
      default: false
    },
    incorporationYear: {
      type: Number,
      required: true
    },
    grossReceiptsUnder5M: {
      type: Boolean,
      default: false
    },
    screeningResult: {
      isQualified: { type: Boolean, required: true },
      estimatedCreditMin: { type: Number, required: true },
      estimatedCreditMax: { type: Number, required: true },
      eligibleForPayrollTaxOffset: { type: Boolean, default: false },
      rationale: [{ type: String }],
      disclaimer: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'CONVERTED', 'UNQUALIFIED'],
      default: 'NEW'
    }
  },
  { timestamps: true }
);

LeadEligibilitySchema.index({ contactEmail: 1, createdAt: -1 });

module.exports = mongoose.model('LeadEligibility', LeadEligibilitySchema);

