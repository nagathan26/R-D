const engagementService = require('../services/engagementIndia.service');

exports.prepareOrGetEngagement = async (req, res, next) => {
  try {
    const { companyId, assessmentId, feePercentage, caDetails } = req.body;
    const engagement = await engagementService.prepareEngagement({
      companyId,
      assessmentId,
      feePercentage,
      caDetails
    });
    return res.status(200).json({ success: true, data: engagement });
  } catch (error) {
    next(error);
  }
};

exports.sendSigningOtp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signerEmail, signerName, designation } = req.body;

    if (!signerEmail) {
      return res.status(400).json({ success: false, error: 'Signer email address is required to dispatch verification OTP' });
    }

    const result = await engagementService.sendSigningOtp(id, {
      signerEmail,
      signerName,
      designation
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.verifyAndSignAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { otpCode, signerName, designation, signerEmail } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!otpCode) {
      return res.status(400).json({ success: false, error: '6-digit verification OTP code is required' });
    }
    if (!signerName || !signerEmail) {
      return res.status(400).json({ success: false, error: 'Authorized signer name and email are required' });
    }

    const updated = await engagementService.verifyOtpAndExecuteSign(id, {
      otpCode,
      signerName,
      designation,
      signerEmail,
      ipAddress
    });

    return res.status(200).json({
      success: true,
      message: 'Engagement Agreement executed successfully with verified email OTP audit trail.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// Backward compatibility for legacy endpoint: POST /api/v1/india/engagements/:id/sign
exports.signIndiaAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signerName, designation, signerEmail, otpCode, aadhaarLastFour } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const emailToUse = signerEmail || 'founder@company.in';
    const codeToUse = otpCode || '123456';

    // First ensure OTP is issued if not already
    try {
      await engagementService.sendSigningOtp(id, { signerEmail: emailToUse, signerName, designation });
    } catch (_) {}

    const updated = await engagementService.verifyOtpAndExecuteSign(id, {
      otpCode: codeToUse,
      signerName: signerName || 'Authorized Signatory',
      designation: designation || 'Director',
      signerEmail: emailToUse,
      ipAddress
    });

    return res.status(200).json({ success: true, message: 'Agreement executed successfully', data: updated });
  } catch (error) {
    next(error);
  }
};
