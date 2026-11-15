const mongoose = require('mongoose');

const IngestionRecordIndiaSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      index: true
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EligibilityAssessment',
      required: false
    },
    engagementId: {
      type: String,
      required: true,
      index: true
    },
    documentCategory: {
      type: String,
      enum: [
        'EPFO_ECR_PAYROLL',
        'GSTR_3B_TURNOVER',
        'FORM_26AS_CONTRACTOR_TDS',
        'PATENT_CBR_RECEIPT',
        'DPIIT_CERTIFICATE',
        'DSIR_APPROVAL_LETTER',
        'AUDITED_FINANCIALS'
      ],
      required: true
    },
    targetIncentiveScheme: {
      type: String,
      enum: ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR', 'SECTION_115BBF_PATENT', 'GOVT_GRANTS_SISFS_BIRAC', 'GENERAL_COMPLIANCE'],
      default: 'GENERAL_COMPLIANCE'
    },
    assessmentYear: {
      type: String,
      default: 'AY 2026-27'
    },
    originalFilename: {
      type: String,
      required: true
    },
    storageKey: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    validationStatus: {
      type: String,
      enum: ['PENDING', 'VALIDATED', 'NEEDS_REVIEW', 'DEFICIENT_DATA', 'REJECTED'],
      default: 'PENDING'
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    auditFlags: [{
      type: String
    }],
    humanReviewed: {
      type: Boolean,
      default: false
    },
    reviewerNotes: {
      type: String,
      default: null
    },
    isEncryptedAtRest: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IngestionRecordIndia', IngestionRecordIndiaSchema);
