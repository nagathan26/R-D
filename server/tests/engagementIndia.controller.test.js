// server/tests/engagementIndia.controller.test.js
const engagementController = require('../src/controllers/engagementIndia.controller');
const engagementService = require('../src/services/engagementIndia.service');

describe('Module 2: Engagement Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, headers: {}, socket: { remoteAddress: '127.0.0.1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('prepareOrGetEngagement should call service.prepareEngagement and return 200', async () => {
    req.body = { companyId: 'COMP-123', assessmentId: 'ASM-123' };
    const mockEngagement = {
      engagementId: 'ENG-TEST',
      companyLegalName: 'Bharat AI Technologies Pvt Ltd',
      feeSchedule: { contingencyPercentage: 12 }
    };
    jest.spyOn(engagementService, 'prepareEngagement').mockResolvedValue(mockEngagement);

    await engagementController.prepareOrGetEngagement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockEngagement });
  });

  test('sendSigningOtp should return 400 when signerEmail is missing', async () => {
    req.params = { id: 'ENG-TEST' };
    req.body = {};

    await engagementController.sendSigningOtp(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.stringContaining('Signer email address is required')
    }));
  });

  test('sendSigningOtp should dispatch OTP and return 200 with result', async () => {
    req.params = { id: 'ENG-TEST' };
    req.body = { signerEmail: 'founder@test.in', signerName: 'Sanket', designation: 'Director' };

    jest.spyOn(engagementService, 'sendSigningOtp').mockResolvedValue({
      engagementId: 'ENG-TEST',
      recipientEmail: 'founder@test.in',
      demoOtp: '123456',
      message: 'OTP sent'
    });

    await engagementController.sendSigningOtp(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ recipientEmail: 'founder@test.in' })
    }));
  });

  test('verifyAndSignAgreement should return 400 when otpCode is missing', async () => {
    req.params = { id: 'ENG-TEST' };
    req.body = { signerName: 'Sanket', signerEmail: 'sanket@test.in' };

    await engagementController.verifyAndSignAgreement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.stringContaining('6-digit verification OTP code is required')
    }));
  });

  test('verifyAndSignAgreement should verify OTP, seal with audit hash, and return 200', async () => {
    req.params = { id: 'ENG-TEST' };
    req.body = {
      otpCode: '123456',
      signerName: 'Sanket',
      designation: 'Director',
      signerEmail: 'sanket@test.in'
    };

    const mockExecuted = {
      engagementId: 'ENG-TEST',
      agreementStatus: 'EXECUTED',
      digitalSignature: {
        sha256AuditHash: 'a1b2c3d4e5f6',
        authorizedSignatoryName: 'Sanket'
      }
    };

    jest.spyOn(engagementService, 'verifyOtpAndExecuteSign').mockResolvedValue(mockExecuted);

    await engagementController.verifyAndSignAgreement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: mockExecuted
    }));
  });
});

