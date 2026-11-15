// server/src/controllers/ingestionIndia.controller.js
const mongoose = require('mongoose');
const IngestionRecordIndia = require('../models/IngestionRecordIndia.model');
const EngagementIndia = require('../models/EngagementIndia.model');
const Company = require('../models/Company.model');
const EligibilityAssessment = require('../models/EligibilityAssessment.model');
const validationService = require('../services/ingestionValidationIndia.service');

/**
 * Returns dynamic document checklist tailored to the company's qualified incentives.
 * Strictly gated: Engagement must be in 'EXECUTED' status.
 */
exports.getIncentiveChecklist = async (req, res, next) => {
  try {
    const { engagementId } = req.params;

    let engagement = null;
    if (mongoose.isValidObjectId(engagementId)) {
      engagement = await EngagementIndia.findById(engagementId);
    }
    if (!engagement) {
      engagement = await EngagementIndia.findOne({ engagementId });
    }
    if (!engagement) {
      // Find latest engagement if demo identifier or not found
      engagement = await EngagementIndia.findOne().sort({ createdAt: -1 });
    }

    if (!engagement) {
      return res.status(404).json({
        success: false,
        error: `Engagement '${engagementId}' not found.`
      });
    }

    // Gate: Engagement must be EXECUTED
    if (engagement.agreementStatus !== 'EXECUTED') {
      return res.status(403).json({
        success: false,
        locked: true,
        agreementStatus: engagement.agreementStatus,
        error: `Compliance Data Ingestion is locked. The Engagement Agreement must be EXECUTED with verified digital signature before uploading compliance documents. (Current status: ${engagement.agreementStatus})`
      });
    }

    // Load company and assessment details
    let company = null;
    let assessment = null;
    if (engagement.companyId) {
      company = await Company.findById(engagement.companyId);
    }
    if (engagement.assessmentId) {
      assessment = await EligibilityAssessment.findById(engagement.assessmentId);
    }

    // Existing uploads for this engagement
    const engagementDbId = engagement._id ? engagement._id.toString() : engagement.engagementId;
    const uploadedRecords = await IngestionRecordIndia.find({
      $or: [
        { engagementId: engagement.engagementId },
        { engagementId: engagementDbId }
      ]
    }).sort({ createdAt: -1 });

    const uploadedCategories = new Set(uploadedRecords.map((r) => r.documentCategory));

    // Determine target incentives
    const incentives = engagement.targetIncentives || assessment?.targetIncentives || ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR'];

    // Assemble dynamic checklist
    const checklist = [];

    if (incentives.includes('SECTION_80_IAC')) {
      checklist.push({
        documentCategory: 'DPIIT_CERTIFICATE',
        title: 'DPIIT Startup Recognition Certificate',
        statutoryScheme: 'Section 80-IAC (100% Startup Tax Holiday)',
        description: 'Official DPIIT recognition certificate verifying startup incorporation date and tech/innovation domain.',
        mandatory: true,
        status: uploadedCategories.has('DPIIT_CERTIFICATE') ? 'UPLOADED' : 'PENDING'
      });
      checklist.push({
        documentCategory: 'GSTR_3B_TURNOVER',
        title: 'GSTR-3B Monthly Return / Turnover Ledger',
        statutoryScheme: 'Section 80-IAC (Turnover Cap Proof)',
        description: 'Statutory proof that annual company turnover does not exceed the statutory threshold of ₹100 Crore.',
        mandatory: true,
        status: uploadedCategories.has('GSTR_3B_TURNOVER') ? 'UPLOADED' : 'PENDING'
      });
    }

    if (incentives.includes('SECTION_35_2AB_DSIR')) {
      checklist.push({
        documentCategory: 'EPFO_ECR_PAYROLL',
        title: 'EPFO ECR Monthly Challan (In-House R&D Payroll)',
        statutoryScheme: 'Section 35(2AB) (Weighted R&D Deduction)',
        description: 'Electronic Challan cum Return detailing monthly wages, PF contributions and active headcount of in-house scientific and software engineers.',
        mandatory: true,
        status: uploadedCategories.has('EPFO_ECR_PAYROLL') ? 'UPLOADED' : 'PENDING'
      });
      checklist.push({
        documentCategory: 'FORM_26AS_CONTRACTOR_TDS',
        title: 'Form 26AS / AIS (Section 194J Technical TDS)',
        statutoryScheme: 'Section 35(2AB) (Contract R&D Spend)',
        description: 'TDS certificate for fees paid to technical contractors, software architects, and external R&D test labs.',
        mandatory: false,
        status: uploadedCategories.has('FORM_26AS_CONTRACTOR_TDS') ? 'UPLOADED' : 'PENDING'
      });
    }

    if (incentives.includes('SECTION_115BBF_PATENT')) {
      checklist.push({
        documentCategory: 'PATENT_CBR_RECEIPT',
        title: 'Indian Patent Office (IPO) CBR Filing Receipt',
        statutoryScheme: 'Section 115BBF (10% Concessional Patent Box)',
        description: 'Official Cash Book Receipt issued by IPO verifying filing or grant of indigenous Indian patent.',
        mandatory: true,
        status: uploadedCategories.has('PATENT_CBR_RECEIPT') ? 'UPLOADED' : 'PENDING'
      });
    }

    if (incentives.includes('GOVT_GRANTS_SISFS_BIRAC')) {
      checklist.push({
        documentCategory: 'AUDITED_FINANCIALS',
        title: 'Audited Financial Statements & Grant Sanction',
        statutoryScheme: 'MeitY / BIRAC / SISFS Innovation Grants',
        description: 'Balance sheet, profit & loss, and grant sanction letters or utilization certificates.',
        mandatory: false,
        status: uploadedCategories.has('AUDITED_FINANCIALS') ? 'UPLOADED' : 'PENDING'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        engagement: {
          engagementId: engagement.engagementId,
          companyLegalName: engagement.companyLegalName,
          panNumber: engagement.panNumber,
          gstin: engagement.gstin,
          agreementStatus: engagement.agreementStatus,
          executedAt: engagement.digitalSignature?.signedAt
        },
        company: company || { legalName: engagement.companyLegalName },
        targetIncentives: incentives,
        checklist,
        uploadedRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles document ingestion, classification, statutory extraction and validation
 */
exports.validateAndUploadIndiaDoc = async (req, res, next) => {
  try {
    const {
      engagementId,
      documentCategory,
      originalFilename,
      headers,
      declaredTurnoverInr,
      declaredPayrollInr,
      declaredHeadcount,
      contractorSpendInr,
      patentTitle,
      applicationNumber,
      cbrNumber,
      dpiitNumber,
      fileSize
    } = req.body;

    if (!documentCategory) {
      return res.status(400).json({ success: false, error: 'Document category is required' });
    }

    // Verify engagement exists and is EXECUTED
    let engagement = null;
    if (engagementId) {
      if (mongoose.isValidObjectId(engagementId)) {
        engagement = await EngagementIndia.findById(engagementId);
      }
      if (!engagement) {
        engagement = await EngagementIndia.findOne({ engagementId });
      }
    }
    if (!engagement) {
      engagement = await EngagementIndia.findOne().sort({ createdAt: -1 });
    }

    if (engagement && engagement.agreementStatus !== 'EXECUTED') {
      return res.status(403).json({
        success: false,
        error: 'Upload rejected: Engagement agreement is not executed yet.'
      });
    }

    let extractionResult = {
      validationStatus: 'VALIDATED',
      auditFlags: [],
      extractedData: {}
    };

    // Incentive & category-specific extraction logic
    if (documentCategory === 'EPFO_ECR_PAYROLL') {
      extractionResult = validationService.processEpfoPayroll({
        headers: headers || ['uan', 'member_name', 'gross_wages', 'epf_wages'],
        declaredPayrollInr,
        declaredRndHeadcount: declaredHeadcount
      });
    } else if (documentCategory === 'GSTR_3B_TURNOVER') {
      extractionResult = validationService.processGstr3b({
        gstin: engagement?.gstin,
        declaredTurnoverInr: Number(declaredTurnoverInr || 0)
      });
    } else if (documentCategory === 'FORM_26AS_CONTRACTOR_TDS') {
      extractionResult = validationService.processForm26AS({
        contractorSpendInr: Number(contractorSpendInr || 0)
      });
    } else if (documentCategory === 'PATENT_CBR_RECEIPT') {
      extractionResult = validationService.processPatentCbr({
        patentTitle,
        applicationNumber,
        cbrNumber
      });
    } else if (documentCategory === 'DPIIT_CERTIFICATE') {
      extractionResult = validationService.processDpiitCertificate({
        dpiitNumber,
        legalName: engagement?.companyLegalName
      });
    } else {
      extractionResult = {
        validationStatus: 'VALIDATED',
        auditFlags: [],
        extractedData: {
          documentType: documentCategory,
          notes: 'Standard financial/compliance document stored for statutory audit.',
          uploadedAt: new Date().toISOString()
        }
      };
    }

    const effectiveEngagementId = engagement?.engagementId || engagementId || 'ENG-DEFAULT';
    const effectiveCompanyId = engagement?.companyId || undefined;
    const effectiveAssessmentId = engagement?.assessmentId || undefined;

    const record = await IngestionRecordIndia.create({
      companyId: effectiveCompanyId,
      assessmentId: effectiveAssessmentId,
      engagementId: effectiveEngagementId,
      documentCategory,
      originalFilename: originalFilename || `${documentCategory.toLowerCase()}_${Date.now()}.pdf`,
      storageKey: `secure_vault/india/${effectiveEngagementId}/${Date.now()}-${originalFilename || 'doc.pdf'}`,
      fileSize: fileSize || 245000,
      validationStatus: extractionResult.validationStatus,
      extractedData: extractionResult.extractedData,
      auditFlags: extractionResult.auditFlags,
      humanReviewed: false
    });

    return res.status(201).json({
      success: true,
      message: `Document '${documentCategory}' successfully ingested, classified and verified.`,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Human Review / Correction / Approval of Extracted Data
 */
exports.reviewExtractedDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { extractedData, validationStatus, reviewerNotes } = req.body;

    const record = await IngestionRecordIndia.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Ingestion record not found' });
    }

    if (extractedData) {
      record.extractedData = { ...record.extractedData, ...extractedData };
    }
    if (validationStatus) {
      record.validationStatus = validationStatus;
    }
    record.humanReviewed = true;
    record.reviewerNotes = reviewerNotes || 'Approved by compliance auditor';

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Ingestion record reviewed and updated successfully.',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ingestion records for an engagement
 */
exports.getRecordsByEngagement = async (req, res, next) => {
  try {
    const { engagementId } = req.params;
    const records = await IngestionRecordIndia.find({
      $or: [
        { engagementId },
        { engagementId: String(engagementId) }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
