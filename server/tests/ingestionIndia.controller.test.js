// server/tests/ingestionIndia.controller.test.js
const ingestionController = require('../src/controllers/ingestionIndia.controller');
const EngagementIndia = require('../src/models/EngagementIndia.model');
const IngestionRecordIndia = require('../src/models/IngestionRecordIndia.model');
const validationService = require('../src/services/ingestionValidationIndia.service');

describe('Module 3: Ingestion Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getIncentiveChecklist should return 403 locked if engagement is not EXECUTED', async () => {
    req.params = { engagementId: 'ENG-123' };
    jest.spyOn(EngagementIndia, 'findOne').mockResolvedValue({
      engagementId: 'ENG-123',
      agreementStatus: 'SENT_FOR_E_SIGN'
    });

    await ingestionController.getIncentiveChecklist(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      locked: true,
      success: false
    }));
  });

  test('getIncentiveChecklist should return dynamic checklist when engagement is EXECUTED', async () => {
    req.params = { engagementId: 'ENG-123' };
    jest.spyOn(EngagementIndia, 'findOne').mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      engagementId: 'ENG-123',
      companyLegalName: 'Test Tech Pvt Ltd',
      agreementStatus: 'EXECUTED',
      targetIncentives: ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR']
    });
    jest.spyOn(IngestionRecordIndia, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });

    await ingestionController.getIncentiveChecklist(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        checklist: expect.arrayContaining([
          expect.objectContaining({ documentCategory: 'DPIIT_CERTIFICATE' }),
          expect.objectContaining({ documentCategory: 'GSTR_3B_TURNOVER' }),
          expect.objectContaining({ documentCategory: 'EPFO_ECR_PAYROLL' })
        ])
      })
    }));
  });

  test('validateAndUploadIndiaDoc should validate and save EPFO ECR payroll document', async () => {
    req.body = {
      engagementId: 'ENG-123',
      documentCategory: 'EPFO_ECR_PAYROLL',
      headers: ['uan', 'member_name', 'gross_wages', 'epf_wages'],
      declaredPayrollInr: 6500000,
      declaredHeadcount: 20
    };

    jest.spyOn(EngagementIndia, 'findOne').mockResolvedValue({
      engagementId: 'ENG-123',
      agreementStatus: 'EXECUTED'
    });

    const mockSavedRecord = {
      _id: 'rec_123',
      engagementId: 'ENG-123',
      documentCategory: 'EPFO_ECR_PAYROLL',
      validationStatus: 'VALIDATED',
      extractedData: { employeeCount: 20 }
    };
    jest.spyOn(IngestionRecordIndia, 'create').mockResolvedValue(mockSavedRecord);

    await ingestionController.validateAndUploadIndiaDoc(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: mockSavedRecord
    }));
  });
});
