const mongoose = require('mongoose');

const EngagementIndiaSchema = new mongoose.Schema(
  {
    engagementId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      index: true
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EligibilityAssessment',
      required: false,
      index: true
    },
    companyLegalName: { type: String, required: true },
    panNumber: { type: String, required: true, uppercase: true },
    gstin: { type: String, uppercase: true },
    targetIncentives: [{
      type: String,
      enum: ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR', 'SECTION_115BBF_PATENT', 'GOVT_GRANTS_SISFS_BIRAC']
    }],
    feeSchedule: {
      contingencyPercentage: { type: Number, default: 12, min: 5, max: 25 },
      minimumRetainerInr: { type: Number, default: 0 },
      capAmountInr: { type: Number, default: null },
      currency: { type: String, default: 'INR' },
      gstRate: { type: Number, default: 18 }
    },
    agreementStatus: {
      type: String,
      enum: ['DRAFT', 'SENT_FOR_E_SIGN', 'OTP_SENT', 'EXECUTED', 'TERMINATED'],
      default: 'DRAFT'
    },
    signingOtp: {
      code: { type: String, default: null },
      recipientEmail: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 }
    },
    digitalSignature: {
      authorizedSignatoryName: { type: String },
      signatoryDesignation: { type: String },
      signerEmail: { type: String },
      signedAt: { type: Date },
      ipAddress: { type: String },
      sha256AuditHash: { type: String },
      verificationMethod: { type: String, default: 'EMAIL_OTP' },
      otpVerifiedAt: { type: Date }
    },
    clientCharteredAccountant: {
      caName: { type: String },
      caMembershipNumber: { type: String },
      firmRegistrationNumber: { type: String },
      caEmail: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EngagementIndia', EngagementIndiaSchema);
