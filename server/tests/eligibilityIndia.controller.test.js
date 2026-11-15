const eligibilityController = require('../src/controllers/eligibilityIndia.controller');
const LeadEligibilityIndia = require('../src/models/LeadEligibilityIndia.model');

jest.mock('../src/models/LeadEligibilityIndia.model');

describe('Module 1: Indian Eligibility Controller Tests (Mocked Req/Res)', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('should return 201 with formatted Indian DTO view when valid data is supplied', async () => {
    req = {
      body: {
        companyName: 'Bharat AI Technologies Pvt Ltd',
        contactEmail: 'founder@bharatai.in',
        contactPhone: '9876543210',
        companyPan: 'AABCB1234D',
        industrySector: 'Software/SaaS & AI',
        headcount: 20,
        incorporationDate: '2022-05-10',
        annualTurnoverInr: 15000000, // ₹1.5 Cr
        annualRndPayrollInr: 6500000, // ₹65 Lakhs
        isDpiitRecognized: true
      }
    };

    const mockSavedLead = {
      _id: 'leadMockId999',
      companyName: req.body.companyName,
      industrySector: req.body.industrySector,
      screeningResult: {
        isEligibleFor80IAC: true,
        isEligibleFor35_2AB: true,
        isEligibleForPatentBox115BBF: false,
        estimatedTaxSavingsMinInr: 566325,
        estimatedTaxSavingsMaxInr: 849487,
        eligibleGrants: ['Startup India Seed Fund Scheme (SISFS) - Up to ₹50 Lakhs'],
        rationale: ['Eligible for Section 80-IAC'],
        disclaimer: 'Preliminary non-binding incentive estimate'
      },
      createdAt: new Date()
    };

    LeadEligibilityIndia.create.mockResolvedValue(mockSavedLead);

    await eligibilityController.screenIndiaEligibility(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          companyName: 'Bharat AI Technologies Pvt Ltd',
          isEligibleFor80IAC: true,
          estimatedTaxSavingsInr: expect.objectContaining({
            formatted: expect.stringContaining('Lakhs')
          })
        })
      })
    );
  });

  test('should return 400 when mandatory fields are missing', async () => {
    req = { body: { companyName: 'Incomplete' } };

    await eligibilityController.screenIndiaEligibility(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Missing mandatory fields')
      })
    );
  });
});

