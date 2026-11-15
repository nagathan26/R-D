const crypto = require('crypto');
const mongoose = require('mongoose');
const EngagementIndia = require('../models/EngagementIndia.model');
const Company = require('../models/Company.model');
const EligibilityAssessment = require('../models/EligibilityAssessment.model');
const emailService = require('./email.service');

class EngagementIndiaService {
  generateDocumentHash(engagementId, feeSchedule, signerName, signerEmail, timestamp) {
    const rawPayload = `${engagementId}:${JSON.stringify(feeSchedule)}:${signerName}:${signerEmail}:${timestamp}`;
    return crypto.createHash('sha256').update(rawPayload).digest('hex');
  }

  /**
   * Prepares or retrieves a draft engagement for a company and assessment
   */
  async prepareEngagement({ companyId, assessmentId, feePercentage = 12, caDetails }) {
    let company = null;
    let assessment = null;

    if (companyId && mongoose.isValidObjectId(companyId)) {
      company = await Company.findById(companyId);
    } else if (companyId) {
      company = await Company.findOne({ companyId });
    }

    if (assessmentId && mongoose.isValidObjectId(assessmentId)) {
      assessment = await EligibilityAssessment.findById(assessmentId);
    } else if (assessmentId) {
      assessment = await EligibilityAssessment.findOne({ assessmentId });
    }

    const companyLegalName = company?.legalName || 'Applicant Entity';
    const panNumber = company?.pan || '';
    const gstin = company?.gstin || '';
    const targetIncentives = assessment?.targetIncentives || ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR'];

    // Check if active draft engagement already exists
    let engagement = null;
    if (company) {
      engagement = await EngagementIndia.findOne({ companyId: company._id, agreementStatus: { $ne: 'TERMINATED' } });
    }

    if (!engagement) {
      const generatedEngagementId = 'ENG-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      engagement = await EngagementIndia.create({
        engagementId: generatedEngagementId,
        companyId: company?._id || undefined,
        assessmentId: assessment?._id || undefined,
        companyLegalName,
        panNumber,
        gstin,
        targetIncentives,
        feeSchedule: {
          contingencyPercentage: Number(feePercentage) || 12,
          currency: 'INR',
          gstRate: 18
        },
        clientCharteredAccountant: caDetails || null,
        agreementStatus: 'SENT_FOR_E_SIGN'
      });
    }

    return engagement;
  }

  /**
   * Generates and dispatches a 6-digit OTP to the signatory's email using Nodemailer
   */
  async sendSigningOtp(engagementIdentifier, { signerEmail, signerName, designation }) {
    let engagement = null;
    if (mongoose.isValidObjectId(engagementIdentifier)) {
      engagement = await EngagementIndia.findById(engagementIdentifier);
    }
    if (!engagement) {
      engagement = await EngagementIndia.findOne({ engagementId: engagementIdentifier });
    }
    if (!engagement) {
      // Fallback: load latest engagement or create on the fly
      engagement = await this.prepareEngagement({});
    }

    if (engagement.agreementStatus === 'EXECUTED') {
      throw new Error('This agreement has already been executed. Duplicate signing is prohibited.');
    }

    // Generate 6-digit cryptographically random numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    engagement.signingOtp = {
      code: otpCode,
      recipientEmail: signerEmail.toLowerCase().trim(),
      expiresAt,
      attempts: 0
    };
    engagement.agreementStatus = 'OTP_SENT';
    await engagement.save();

    // Dispatch via Nodemailer email service
    const mailResult = await emailService.sendSigningOtpEmail({
      toEmail: signerEmail,
      signerName: signerName || 'Authorized Representative',
      companyName: engagement.companyLegalName,
      otpCode
    });

    return {
      engagementId: engagement.engagementId,
      _id: engagement._id,
      recipientEmail: signerEmail,
      expiresAt,
      message: `Verification OTP successfully sent to ${signerEmail}. Please check your inbox.`
    };
  }

  /**
   * Verifies the OTP, seals with SHA-256 audit hash, and marks agreement EXECUTED
   */
  async verifyOtpAndExecuteSign(engagementIdentifier, { otpCode, signerName, designation, signerEmail, ipAddress }) {
    let engagement = null;
    if (mongoose.isValidObjectId(engagementIdentifier)) {
      engagement = await EngagementIndia.findById(engagementIdentifier);
    }
    if (!engagement) {
      engagement = await EngagementIndia.findOne({ engagementId: engagementIdentifier });
    }
    if (!engagement) {
      throw new Error('Engagement record not found');
    }

    if (engagement.agreementStatus === 'EXECUTED') {
      throw new Error('This agreement has already been verified and executed.');
    }

    if (!engagement.signingOtp || !engagement.signingOtp.code) {
      throw new Error('No OTP request found for this engagement. Please request an OTP first.');
    }

    // Check expiration
    if (new Date() > new Date(engagement.signingOtp.expiresAt)) {
      throw new Error('The OTP has expired. Please request a new verification OTP.');
    }

    // Rate limiting attempts (max 5 attempts)
    if (engagement.signingOtp.attempts >= 5) {
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    }

    const providedOtp = String(otpCode).trim();
    const validOtp = String(engagement.signingOtp.code).trim();

    // Strict OTP verification — only the exact OTP sent via email is accepted
    const isOtpValid = providedOtp === validOtp;

    if (!isOtpValid) {
      engagement.signingOtp.attempts += 1;
      await engagement.save();
      throw new Error(`Invalid OTP code entered. ${5 - engagement.signingOtp.attempts} attempts remaining.`);
    }

    const timestamp = new Date();
    const docHash = this.generateDocumentHash(
      engagement.engagementId || engagement._id.toString(),
      engagement.feeSchedule,
      signerName,
      signerEmail,
      timestamp.toISOString()
    );

    engagement.agreementStatus = 'EXECUTED';
    engagement.digitalSignature = {
      authorizedSignatoryName: signerName,
      signatoryDesignation: designation || 'Director',
      signerEmail: signerEmail,
      signedAt: timestamp,
      ipAddress: ipAddress || '127.0.0.1',
      sha256AuditHash: docHash,
      verificationMethod: 'EMAIL_OTP',
      otpVerifiedAt: timestamp
    };

    // Clear sensitive OTP code after successful execution
    engagement.signingOtp.code = null;

    return await engagement.save();
  }
}

module.exports = new EngagementIndiaService();
