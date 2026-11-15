const mongoose = require('mongoose');

const EligibilityAssessmentSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    financialMetrics: {
      annualTurnoverInr: { type: Number, required: true },
      annualRndPayrollInr: { type: Number, required: true },
      annualRndContractorSpendInr: { type: Number, default: 0 },
      annualRndCapitalEquipmentInr: { type: Number, default: 0 }
    },
    targetIncentives: [{
      type: String,
      enum: ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR', 'SECTION_115BBF_PATENT', 'GOVT_GRANTS_SISFS_BIRAC']
    }],
    qualificationResults: {
      isEligibleFor80IAC: { type: Boolean, default: false },
      isEligibleFor35_2AB: { type: Boolean, default: false },
      isEligibleForPatentBox115BBF: { type: Boolean, default: false }
    },
    estimatedTaxSavingsInr: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      formatted: { type: String, default: '₹0' }
    },
    eligibleGrants: [{ type: String }],
    rationale: [{ type: String }],
    disclaimer: { type: String, required: true },
    assessedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EligibilityAssessment', EligibilityAssessmentSchema);

