const mongoose = require('mongoose');

const LeadEligibilityIndiaSchema = new mongoose.Schema(
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
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits starting with 6-9)']
    },
    companyPan: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: 'Invalid Indian PAN format. Must be 10 characters (e.g. ABCDE1234F)'
      }
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    industrySector: {
      type: String,
      required: true,
      enum: [
        'Software/SaaS & AI',
        'Deeptech & Hardware',
        'Biotechnology & Pharma',
        'CleanTech & EV',
        'Fintech',
        'Engineering & Manufacturing Services',
        'Other'
      ]
    },
    headcount: {
      type: Number,
      required: true,
      min: 1
    },
    incorporationDate: {
      type: Date,
      required: true
    },
    annualTurnoverInr: {
      type: Number,
      required: true,
      min: 0
    },
    annualRndPayrollInr: {
      type: Number,
      required: true,
      min: 0
    },
    annualRndContractorSpendInr: {
      type: Number,
      default: 0
    },
    annualRndCapitalEquipmentInr: {
      type: Number,
      default: 0
    },
    isDpiitRecognized: {
      type: Boolean,
      default: false
    },
    dpiitCertificateNumber: {
      type: String,
      trim: true,
      default: null
    },
    hasRegisteredIndianPatents: {
      type: Boolean,
      default: false
    },
    hasDsirApprovedLab: {
      type: Boolean,
      default: false
    },
    screeningResult: {
      isEligibleFor80IAC: { type: Boolean, default: false },
      isEligibleFor35_2AB: { type: Boolean, default: false },
      isEligibleForPatentBox115BBF: { type: Boolean, default: false },
      estimatedTaxSavingsMinInr: { type: Number, default: 0 },
      estimatedTaxSavingsMaxInr: { type: Number, default: 0 },
      eligibleGrants: [{ type: String }],
      rationale: [{ type: String }],
      disclaimer: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ['NEW', 'CONSULTATION_SCHEDULED', 'ENGAGEMENT_SIGNED', 'DISQUALIFIED'],
      default: 'NEW'
    }
  },
  { timestamps: true }
);

LeadEligibilityIndiaSchema.index({ contactEmail: 1, companyPan: 1 });

module.exports = mongoose.model('LeadEligibilityIndia', LeadEligibilityIndiaSchema);

