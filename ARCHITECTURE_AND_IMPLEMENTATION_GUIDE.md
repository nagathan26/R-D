# India R&D Tax Incentive & Government Subsidy Consulting Platform
## Complete MERN Architecture & MVC Implementation Guide (India Jurisdiction Only)

This platform is architected exclusively for the **Indian Jurisdiction**, automating the identification, documentation, audit-defense, and realization of government incentives under the **Income-tax Act, 1961**, **DPIIT (Department for Promotion of Industry and Internal Trade)**, and **DSIR (Department of Scientific and Industrial Research)**.

---

## Table of Contents
1. [System Architecture & Indian Statutory Framework](#1-system-architecture--indian-statutory-framework)
2. [Module 1: Indian R&D & Startup Screener API (Section 80-IAC & DSIR 35(2AB))](#2-module-1-indian-rd--startup-screener-api-section-80-iac--dsir-352ab)
3. [Module 2: Indian Client Onboarding, E-Sign & CA Partnership API (FR-4, FR-5, FR-6)](#3-module-2-indian-client-onboarding-e-sign--ca-partnership-api-fr-4-fr-5-fr-6)
4. [Module 3: Indian Statutory Data Ingestion & Audit Compliance (EPFO, GSTR-3B & Form 26AS) (FR-7, FR-10)](#4-module-3-indian-statutory-data-ingestion--audit-compliance-epfo-gstr-3b--form-26as-fr-7-fr-10)
5. [Module 4: DSIR Scientific Research & IMB Startup Innovation Classification Engine (FR-12, FR-13, FR-14)](#5-module-4-dsir-scientific-research--imb-startup-innovation-classification-engine-fr-12-fr-13-fr-14)
6. [Module 5: Indian Tax Incentive & 80-IAC / DSIR Calculation Engine (FR-17, FR-18)](#6-module-5-indian-tax-incentive--80-iac--dsir-calculation-engine-fr-17-fr-18)
7. [Module 6: Chartered Accountant (CA) Review Queue & Client RFI Workspace (FR-21, FR-22, FR-23)](#7-module-6-chartered-accountant-ca-review-queue--client-rfi-workspace-fr-21-fr-22-fr-23)
8. [Module 7: IMB / DSIR Filing Package, Audit Defense & Contingency GST Invoicing (FR-25, FR-26, FR-29, FR-30)](#8-module-7-imb--dsir-filing-package-audit-defense--contingency-gst-invoicing-fr-25-fr-26-fr-29-fr-30)
9. [Master Express Server Configuration (India Engine Only)](#9-master-express-server-configuration-india-engine-only)
10. [Summary Verification Matrix (India Jurisdiction Only)](#10-summary-verification-matrix-india-jurisdiction-only)

---

## 1. System Architecture & Indian Statutory Framework

### 1.1 The Four Indian Incentive Mechanisms
1. **Section 80-IAC (Startup India 3-Year 100% Tax Holiday)**:
   - 100% deduction on eligible profits for 3 consecutive assessment years out of the first 10 years.
   - Statutory criteria: DPIIT-recognized startup, incorporated on or after April 1, 2016, turnover under ₹100 Crore in all prior financial years, and certified by the Inter-Ministerial Board (IMB).
2. **Section 35(2AB) (In-House Scientific R&D Deduction)**:
   - 100% deduction on revenue and capital expenditure (excluding land and building) incurred on scientific research.
   - Statutory criteria: In-house R&D center approved and certified by the DSIR.
3. **Section 115BBF (Patent Box Regime)**:
   - Concessional corporate tax rate of **10%** (+ surcharge & cess) on royalty income earned from patents developed and registered in India under the Patents Act, 1970.
4. **Central & State Innovation Grants**:
   - Startup India Seed Fund Scheme (SISFS - up to ₹50 Lakhs), MeitY TIDE 2.0 / SAMRIDH, and BIRAC BIG (Biotechnology Ignition Grant).
5. **Chartered Accountant (CA) Partner Ecosystem**:
   - Integrates with practicing Chartered Accountants (ICAI members) to audit Form 1 (IMB), Form 3CL/3CM (DSIR), and ITR-6 tax audit reports.

```
R&D-Platform-India/
├── server/
│   ├── src/
│   │   ├── config/             # DB connection, Indian tax slab constants (80-IAC, 35(2AB), 115BBF)
│   │   ├── models/             # Mongoose Schemas (PAN, GSTIN, DPIIT, DSIR, Rupee ₹ amounts)
│   │   ├── views/              # View presenters / DTO response formatters
│   │   ├── controllers/        # Route Handlers (HTTP Layer)
│   │   ├── services/           # Business Logic / Indian Tax Rules Engine (Domain Layer)
│   │   ├── routes/             # Express API Route Registrations
│   │   ├── middleware/         # Auth, RBAC, Validation, Error Handling
│   │   └── app.js              # Express app definition
│   └── tests/                  # Integration & Unit Tests (Jest & Supertest)
└── client/
    ├── src/
    │   ├── views/              # React Page Views (INR ₹ currency, DPIIT Screener, DSIR Workspace)
    │   ├── components/         # Reusable UI widgets (GSTNBadge, IMBReadinessScore)
    │   └── services/           # Axios/Fetch API client wrappers
    └── package.json
```

---

## 2. Module 1: Indian R&D & Startup Screener API (Section 80-IAC & DSIR 35(2AB))

### 2.1 Model: `server/src/models/LeadEligibilityIndia.model.js`
```javascript
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
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid Indian PAN format (e.g. ABCDE1234F)']
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
```

### 2.2 Logic / Service: `server/src/services/eligibilityIndia.service.js`
```javascript
const QUALIFYING_INNOVATION_SECTORS = [
  'Software/SaaS & AI',
  'Deeptech & Hardware',
  'Biotechnology & Pharma',
  'CleanTech & EV'
];

class EligibilityIndiaService {
  evaluateEligibility(data) {
    const {
      industrySector,
      incorporationDate,
      annualTurnoverInr,
      annualRndPayrollInr,
      annualRndContractorSpendInr = 0,
      annualRndCapitalEquipmentInr = 0,
      isDpiitRecognized = false,
      hasRegisteredIndianPatents = false
    } = data;

    const rationale = [];
    const eligibleGrants = [];
    let isEligibleFor80IAC = false;
    let isEligibleFor35_2AB = false;
    let isEligibleForPatentBox115BBF = false;

    const incDate = new Date(incorporationDate);
    const aprilFirst2016 = new Date('2016-04-01');
    const today = new Date();
    const ageInYears = (today - incDate) / (1000 * 60 * 60 * 24 * 365.25);
    const turnoverInCrores = annualTurnoverInr / 10000000;

    // 1. Evaluate Section 80-IAC (Startup 3-Year 100% Tax Holiday)
    if (incDate >= aprilFirst2016 && ageInYears <= 10 && turnoverInCrores <= 100) {
      if (QUALIFYING_INNOVATION_SECTORS.includes(industrySector)) {
        isEligibleFor80IAC = true;
        rationale.push(
          `Eligible for Section 80-IAC Tax Holiday: 100% tax exemption on profits for 3 consecutive assessment years (Turnover ₹${turnoverInCrores.toFixed(1)} Cr is within ₹100 Cr statutory cap).`
        );
        if (!isDpiitRecognized) {
          rationale.push('Immediate action: Needs DPIIT startup recognition application followed by IMB certification.');
        }
      }
    } else {
      if (turnoverInCrores > 100) {
        rationale.push(`Ineligible for 80-IAC: Turnover ₹${turnoverInCrores.toFixed(1)} Cr exceeds the ₹100 Crore statutory cap.`);
      }
      if (ageInYears > 10) {
        rationale.push('Ineligible for 80-IAC: Entity age exceeds 10 years from incorporation.');
      }
    }

    // 2. Evaluate Section 35(2AB) (In-House Scientific R&D Deduction)
    const totalRndSpend = annualRndPayrollInr + annualRndContractorSpendInr + annualRndCapitalEquipmentInr;
    if (totalRndSpend >= 2500000) {
      if (['Deeptech & Hardware', 'Biotechnology & Pharma', 'CleanTech & EV', 'Software/SaaS & AI'].includes(industrySector)) {
        isEligibleFor35_2AB = true;
        rationale.push(
          `Eligible for Section 35(2AB) 100% R&D deduction: Annual qualifying expenditure of ₹${(totalRndSpend / 100000).toFixed(1)} Lakhs can be fully deducted against corporate taxable profits upon DSIR center approval.`
        );
      }
    }

    // 3. Evaluate Section 115BBF (Patent Box Regime)
    if (hasRegisteredIndianPatents) {
      isEligibleForPatentBox115BBF = true;
      rationale.push('Eligible for Section 115BBF Patent Box: Concessional 10% tax rate on worldwide patent royalty income.');
    }

    // 4. Evaluate Deeptech Grant Eligibility
    if (ageInYears <= 5 && totalRndSpend > 1000000) {
      eligibleGrants.push('Startup India Seed Fund Scheme (SISFS) - Up to ₹50 Lakhs');
      if (industrySector === 'Biotechnology & Pharma') {
        eligibleGrants.push('BIRAC BIG (Biotechnology Ignition Grant) - Up to ₹50 Lakhs');
      }
      if (['Software/SaaS & AI', 'Deeptech & Hardware'].includes(industrySector)) {
        eligibleGrants.push('MeitY TIDE 2.0 / SAMRIDH Innovation Grants');
      }
    }

    // 5. Estimate Potential Tax Savings (INR ₹)
    let estimatedTaxSavingsMinInr = 0;
    let estimatedTaxSavingsMaxInr = 0;

    if (isEligibleFor80IAC) {
      const estimatedProfits = annualTurnoverInr * 0.15;
      estimatedTaxSavingsMinInr = Math.round(estimatedProfits * 0.2517);
      estimatedTaxSavingsMaxInr = Math.round(estimatedTaxSavingsMinInr * 1.5);
    } else if (isEligibleFor35_2AB) {
      estimatedTaxSavingsMinInr = Math.round(totalRndSpend * 0.2517);
      estimatedTaxSavingsMaxInr = Math.round(totalRndSpend * 0.30);
    }

    return {
      isEligibleFor80IAC,
      isEligibleFor35_2AB,
      isEligibleForPatentBox115BBF,
      estimatedTaxSavingsMinInr,
      estimatedTaxSavingsMaxInr,
      eligibleGrants,
      rationale,
      disclaimer: 'Preliminary non-binding incentive estimate based on Indian Income-tax Act, 1961 provisions. Does not substitute formal tax or legal counsel.'
    };
  }
}

module.exports = new EligibilityIndiaService();
```

### 2.3 Controller: `server/src/controllers/eligibilityIndia.controller.js`
```javascript
const LeadEligibilityIndia = require('../models/LeadEligibilityIndia.model');
const eligibilityService = require('../services/eligibilityIndia.service');

exports.screenIndiaEligibility = async (req, res, next) => {
  try {
    const {
      companyName,
      contactEmail,
      contactPhone,
      companyPan,
      gstin,
      industrySector,
      headcount,
      incorporationDate,
      annualTurnoverInr,
      annualRndPayrollInr,
      annualRndContractorSpendInr,
      annualRndCapitalEquipmentInr,
      isDpiitRecognized,
      dpiitCertificateNumber,
      hasRegisteredIndianPatents,
      hasDsirApprovedLab
    } = req.body;

    if (!companyName || !contactEmail || !industrySector || !incorporationDate || annualTurnoverInr === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory fields: companyName, contactEmail, industrySector, incorporationDate, annualTurnoverInr'
      });
    }

    const screeningResult = eligibilityService.evaluateEligibility({
      industrySector,
      incorporationDate,
      annualTurnoverInr: Number(annualTurnoverInr),
      annualRndPayrollInr: Number(annualRndPayrollInr || 0),
      annualRndContractorSpendInr: Number(annualRndContractorSpendInr || 0),
      annualRndCapitalEquipmentInr: Number(annualRndCapitalEquipmentInr || 0),
      isDpiitRecognized: Boolean(isDpiitRecognized),
      hasRegisteredIndianPatents: Boolean(hasRegisteredIndianPatents),
      hasDsirApprovedLab: Boolean(hasDsirApprovedLab)
    });

    const lead = await LeadEligibilityIndia.create({
      companyName,
      contactEmail,
      contactPhone,
      companyPan,
      gstin,
      industrySector,
      headcount: Number(headcount || 1),
      incorporationDate,
      annualTurnoverInr: Number(annualTurnoverInr),
      annualRndPayrollInr: Number(annualRndPayrollInr || 0),
      annualRndContractorSpendInr: Number(annualRndContractorSpendInr || 0),
      annualRndCapitalEquipmentInr: Number(annualRndCapitalEquipmentInr || 0),
      isDpiitRecognized: Boolean(isDpiitRecognized),
      dpiitCertificateNumber,
      hasRegisteredIndianPatents: Boolean(hasRegisteredIndianPatents),
      hasDsirApprovedLab: Boolean(hasDsirApprovedLab),
      screeningResult
    });

    return res.status(201).json({
      success: true,
      data: {
        leadId: lead._id,
        companyName: lead.companyName,
        isEligibleFor80IAC: screeningResult.isEligibleFor80IAC,
        isEligibleFor35_2AB: screeningResult.isEligibleFor35_2AB,
        isEligibleForPatentBox115BBF: screeningResult.isEligibleForPatentBox115BBF,
        estimatedTaxSavingsInr: {
          min: screeningResult.estimatedTaxSavingsMinInr,
          max: screeningResult.estimatedTaxSavingsMaxInr,
          formatted: `₹${(screeningResult.estimatedTaxSavingsMinInr / 100000).toFixed(2)} Lakhs - ₹${(screeningResult.estimatedTaxSavingsMaxInr / 100000).toFixed(2)} Lakhs`
        },
        eligibleGrants: screeningResult.eligibleGrants,
        rationale: screeningResult.rationale,
        disclaimer: screeningResult.disclaimer
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 3. Module 2: Indian Client Onboarding, E-Sign & CA Partnership API (FR-4, FR-5, FR-6)

### 3.1 Model: `server/src/models/EngagementIndia.model.js`
```javascript
const mongoose = require('mongoose');

const EngagementIndiaSchema = new mongoose.Schema(
  {
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
      currency: { type: String, default: 'INR' }
    },
    agreementStatus: {
      type: String,
      enum: ['DRAFT', 'SENT_FOR_E_SIGN', 'EXECUTED_VIA_AADHAAR_OR_OTP', 'TERMINATED'],
      default: 'DRAFT'
    },
    digitalSignature: {
      authorizedSignatoryName: { type: String },
      signatoryDesignation: { type: String },
      signatoryAadhaarLastFour: { type: String },
      signedAt: { type: Date },
      ipAddress: { type: String },
      sha256AuditHash: { type: String }
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
```

### 3.2 Logic / Service: `server/src/services/engagementIndia.service.js`
```javascript
const crypto = require('crypto');
const EngagementIndia = require('../models/EngagementIndia.model');

class EngagementIndiaService {
  generateDocumentHash(engagementId, terms, signerName, timestamp) {
    const rawPayload = `${engagementId}:${JSON.stringify(terms)}:${signerName}:${timestamp}`;
    return crypto.createHash('sha256').update(rawPayload).digest('hex');
  }

  async executeAadhaarOrOtpSign(engagementId, { signerName, designation, aadhaarLastFour, ipAddress }) {
    const engagement = await EngagementIndia.findById(engagementId);
    if (!engagement) throw new Error('Engagement not found');

    const timestamp = new Date();
    const docHash = this.generateDocumentHash(
      engagement._id.toString(),
      engagement.feeSchedule,
      signerName,
      timestamp.toISOString()
    );

    engagement.agreementStatus = 'EXECUTED_VIA_AADHAAR_OR_OTP';
    engagement.digitalSignature = {
      authorizedSignatoryName: signerName,
      signatoryDesignation: designation || 'Director',
      signatoryAadhaarLastFour: aadhaarLastFour || 'XXXX',
      signedAt: timestamp,
      ipAddress,
      sha256AuditHash: docHash
    };

    return await engagement.save();
  }
}

module.exports = new EngagementIndiaService();
```

---

## 4. Module 3: Indian Statutory Data Ingestion & Audit Compliance (EPFO, GSTR-3B & Form 26AS) (FR-7, FR-10)

### 4.1 Model: `server/src/models/IngestionRecordIndia.model.js`
```javascript
const mongoose = require('mongoose');

const IngestionRecordIndiaSchema = new mongoose.Schema(
  {
    engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'EngagementIndia', required: true },
    documentCategory: {
      type: String,
      enum: ['EPFO_ECR_PAYROLL', 'GSTR_3B_TURNOVER', 'FORM_26AS_CONTRACTOR_TDS', 'PATENT_CBR_RECEIPT', 'AUDITED_FINANCIALS'],
      required: true
    },
    assessmentYear: { type: String, default: 'AY 2026-27' },
    originalFilename: { type: String, required: true },
    storageKey: { type: String, required: true },
    fileSize: { type: Number, required: true },
    validationStatus: {
      type: String,
      enum: ['PENDING', 'VALIDATED', 'MISMATCH_WITH_PAN', 'DEFICIENT_DATA'],
      default: 'PENDING'
    },
    auditFlags: [{ type: String }],
    isEncryptedAtRest: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IngestionRecordIndia', IngestionRecordIndiaSchema);
```

### 4.2 Logic / Service: `server/src/services/ingestionValidationIndia.service.js`
```javascript
class IngestionValidationIndiaService {
  validateEpfoEcrHeaders(headers) {
    const required = ['uan', 'member_name', 'gross_wages', 'epf_wages'];
    const missing = required.filter((col) => !headers.map((h) => h.toLowerCase().trim()).includes(col));
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }

  validateGstr3bTurnover(turnoverInr) {
    const turnoverInCrores = turnoverInr / 10000000;
    return {
      isWithinCap: turnoverInCrores <= 100,
      turnoverInCrores,
      warning: turnoverInCrores > 100 ? 'Turnover exceeds Section 80-IAC statutory threshold of ₹100 Crore' : null
    };
  }
}

module.exports = new IngestionValidationIndiaService();
```

---

## 5. Module 4: DSIR Scientific Research & IMB Startup Innovation Classification Engine (FR-12, FR-13, FR-14)

### 5.1 Model: `server/src/models/RndProjectActivityIndia.model.js`
```javascript
const mongoose = require('mongoose');

const RndProjectActivityIndiaSchema = new mongoose.Schema(
  {
    engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'EngagementIndia', required: true },
    projectTitle: { type: String, required: true },
    techDomain: { type: String, required: true },
    technicalUncertainty: { type: String, required: true },
    noveltyDescription: { type: String, required: true },
    dsirPillars: {
      novelty: { passed: { type: Boolean, default: false }, notes: String },
      technicalUncertainty: { passed: { type: Boolean, default: false }, notes: String },
      systematicInvestigation: { passed: { type: Boolean, default: false }, notes: String },
      marketScalability: { passed: { type: Boolean, default: false }, notes: String }
    },
    isEligibleForDsir: { type: Boolean, default: false },
    isEligibleForImb: { type: Boolean, default: false },
    confidenceScore: { type: Number, default: 0 },
    exclusionReason: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RndProjectActivityIndia', RndProjectActivityIndiaSchema);
```

### 5.2 Logic / Service: `server/src/services/dsirClassification.service.js`
```javascript
class DsirClassificationService {
  classifyIndianRndActivity(project) {
    const { projectTitle, technicalUncertainty, noveltyDescription, techDomain } = project;

    if (/bug fix|patch|cosmetic|cms setup|routine/i.test(projectTitle)) {
      return {
        isEligibleForDsir: false,
        isEligibleForImb: false,
        confidenceScore: 92,
        exclusionReason: 'Routine bug fixing, UI cosmetic adjustments, and standard website deployment are excluded from DSIR scientific research deductions.',
        dsirPillars: {
          novelty: { passed: false, notes: 'Routine change' },
          technicalUncertainty: { passed: false, notes: 'None' },
          systematicInvestigation: { passed: false, notes: 'Operational debugging' },
          marketScalability: { passed: false, notes: 'Zero novelty' }
        }
      };
    }

    const isDeepTech = ['Software/SaaS & AI', 'Deeptech & Hardware', 'Biotechnology & Pharma'].includes(techDomain);
    const confidenceScore = isDeepTech ? 90 : 75;

    return {
      isEligibleForDsir: true,
      isEligibleForImb: true,
      confidenceScore,
      exclusionReason: null,
      dsirPillars: {
        novelty: { passed: true, notes: noveltyDescription },
        technicalUncertainty: { passed: true, notes: technicalUncertainty },
        systematicInvestigation: { passed: true, notes: 'Documented sprints and Git commit audit log' },
        marketScalability: { passed: true, notes: 'High employment and domestic value addition' }
      }
    };
  }
}

module.exports = new DsirClassificationService();
```

---

## 6. Module 5: Indian Tax Incentive & 80-IAC / DSIR Calculation Engine (FR-17, FR-18)

### 6.1 Model: `server/src/models/IndiaTaxCalculation.model.js`
```javascript
const mongoose = require('mongoose');

const IndiaTaxCalculationSchema = new mongoose.Schema(
  {
    engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'EngagementIndia', required: true },
    assessmentYear: { type: String, default: 'AY 2026-27' },
    annualProfitsInr: { type: Number, required: true },
    annualRndSpendInr: { type: Number, required: true },
    corporateTaxRateApplied: { type: Number, default: 0.2517 },
    taxSavings80IACInr: { type: Number, default: 0 },
    taxSavings35_2ABInr: { type: Number, default: 0 },
    netTaxSavingsInr: { type: Number, required: true },
    versionNumber: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IndiaTaxCalculation', IndiaTaxCalculationSchema);
```

### 6.2 Logic / Service: `server/src/services/indiaTaxCalculator.service.js`
```javascript
class IndiaTaxCalculatorService {
  calculateIncentives({ annualProfitsInr, annualRndSpendInr, corporateTaxRate = 0.2517, is80IACApproved = false }) {
    let taxSavings80IACInr = 0;
    let taxSavings35_2ABInr = 0;

    if (is80IACApproved && annualProfitsInr > 0) {
      taxSavings80IACInr = Math.round(annualProfitsInr * corporateTaxRate);
    }

    if (annualRndSpendInr > 0) {
      taxSavings35_2ABInr = Math.round(annualRndSpendInr * corporateTaxRate);
    }

    const netTaxSavingsInr = Math.max(taxSavings80IACInr, taxSavings35_2ABInr);

    return {
      annualProfitsInr,
      annualRndSpendInr,
      corporateTaxRate: `${(corporateTaxRate * 100).toFixed(2)}%`,
      taxSavings80IACInr,
      taxSavings35_2ABInr,
      netTaxSavingsInr,
      effectiveAnnualSavingsFormatted: `₹${(netTaxSavingsInr / 100000).toFixed(2)} Lakhs`
    };
  }
}

module.exports = new IndiaTaxCalculatorService();
```

---

## 7. Module 6: Chartered Accountant (CA) Review Queue & Client RFI Workspace (FR-21, FR-22, FR-23)

### 7.1 Model: `server/src/models/CaReviewQueueItem.model.js`
```javascript
const mongoose = require('mongoose');

const CaReviewQueueItemSchema = new mongoose.Schema(
  {
    engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'EngagementIndia', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'RndProjectActivityIndia', required: true },
    assignedCaName: { type: String, required: true },
    caMembershipNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING_CA_AUDIT', 'CERTIFIED_FOR_IMB', 'ADDITIONAL_DOCS_REQUESTED', 'REJECTED'],
      default: 'PENDING_CA_AUDIT'
    },
    caAuditRemarks: { type: String, default: '' },
    rfiQueries: [
      {
        query: { type: String, required: true },
        clientReply: { type: String, default: null },
        status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaReviewQueueItem', CaReviewQueueItemSchema);
```

---

## 8. Module 7: IMB / DSIR Filing Package, Audit Defense & Contingency GST Invoicing (FR-25, FR-26, FR-29, FR-30)

### 8.1 Model: `server/src/models/InvoiceIndia.model.js`
```javascript
const mongoose = require('mongoose');

const InvoiceIndiaSchema = new mongoose.Schema(
  {
    engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'EngagementIndia', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    sacCode: { type: String, default: '998311' }, // GST SAC for Tax Consultancy
    clientGstin: { type: String, required: true },
    realizedBenefitType: {
      type: String,
      enum: ['80_IAC_CERTIFICATE_ISSUED', 'GRANT_DISBURSED', 'DSIR_TAX_DEDUCTION_REALIZED'],
      required: true
    },
    realizedBenefitAmountInr: { type: Number, required: true },
    contingencyRatePercent: { type: Number, required: true },
    taxableValueInr: { type: Number, required: true },
    gstDetails: {
      cgstRate: { type: Number, default: 9 },
      cgstAmountInr: { type: Number, required: true },
      sgstRate: { type: Number, default: 9 },
      sgstAmountInr: { type: Number, required: true },
      igstRate: { type: Number, default: 0 },
      igstAmountInr: { type: Number, default: 0 },
      totalGstInr: { type: Number, required: true }
    },
    totalInvoiceAmountInr: { type: Number, required: true },
    status: {
      type: String,
      enum: ['GENERATED', 'SENT_TO_CLIENT', 'PAID', 'TDS_DEDUCTED_194J'],
      default: 'GENERATED'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InvoiceIndia', InvoiceIndiaSchema);
```

### 8.2 Logic / Service: `server/src/services/indiaBilling.service.js`
```javascript
const InvoiceIndia = require('../models/InvoiceIndia.model');

class IndiaBillingService {
  async generateGstContingencyInvoice({ engagementId, clientGstin, benefitType, realizedAmountInr, contingencyRate = 12 }) {
    const taxableValueInr = Math.round(realizedAmountInr * (contingencyRate / 100));
    
    const cgstAmountInr = Math.round(taxableValueInr * 0.09);
    const sgstAmountInr = Math.round(taxableValueInr * 0.09);
    const totalGstInr = cgstAmountInr + sgstAmountInr;
    const totalInvoiceAmountInr = taxableValueInr + totalGstInr;

    const count = await InvoiceIndia.countDocuments();
    const invoiceNumber = `INV/2026-27/${String(count + 1).padStart(4, '0')}`;

    const invoice = await InvoiceIndia.create({
      engagementId,
      invoiceNumber,
      clientGstin,
      realizedBenefitType: benefitType,
      realizedBenefitAmountInr: realizedAmountInr,
      contingencyRatePercent: contingencyRate,
      taxableValueInr,
      gstDetails: {
        cgstRate: 9,
        cgstAmountInr,
        sgstRate: 9,
        sgstAmountInr,
        igstRate: 0,
        igstAmountInr: 0,
        totalGstInr
      },
      totalInvoiceAmountInr,
      status: 'GENERATED'
    });

    return invoice;
  }
}

module.exports = new IndiaBillingService();
```

---

## 9. Master Express Server Configuration (India Engine Only)

```javascript
// server/src/app.js
const express = require('express');
const cors = require('cors');

const eligibilityController = require('./controllers/eligibilityIndia.controller');
const engagementController = require('./controllers/engagementIndia.controller');
const ingestionController = require('./controllers/ingestionIndia.controller');
const activityController = require('./controllers/activityIndia.controller');
const taxCalcController = require('./controllers/taxCalculationIndia.controller');
const caReviewController = require('./controllers/caReviewIndia.controller');
const billingController = require('./controllers/indiaBilling.controller');

const app = express();
app.use(cors());
app.use(express.json());

// Indian Jurisdiction API Endpoints
app.post('/api/v1/india/eligibility/screen', eligibilityController.screenIndiaEligibility);
app.post('/api/v1/india/engagements', engagementController.createIndiaEngagement);
app.post('/api/v1/india/engagements/:id/sign', engagementController.signIndiaAgreement);
app.post('/api/v1/india/ingestion/upload', ingestionController.validateAndUploadIndiaDoc);
app.post('/api/v1/india/activities/classify', activityController.classifyIndianActivity);
app.post('/api/v1/india/tax/calculate', taxCalcController.computeIndiaTaxSavings);
app.post('/api/v1/india/ca-review/:id/certify', caReviewController.submitCaCertification);
app.post('/api/v1/india/billing/invoice', billingController.issueContingencyInvoice);

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
```

---

## 10. Summary Verification Matrix (India Jurisdiction Only)

| PRD Section | Module Name | Model | View | Controller | Service Logic | Automated Tests |
|---|---|---|---|---|---|---|
| **FR-1, FR-2** | 80-IAC & DSIR Screener | `LeadEligibilityIndia.model.js` | `IndiaEligibilityScreenerView.jsx` | `eligibilityIndia.controller.js` | `eligibilityIndia.service.js` | `eligibilityIndia.test.js` |
| **FR-4, FR-5, FR-6** | Onboarding & CA Partner | `EngagementIndia.model.js` | `IndiaEngagementSignView.jsx` | `engagementIndia.controller.js` | `engagementIndia.service.js` | `engagementIndia.test.js` |
| **FR-7, FR-10, FR-11** | EPFO & GSTR Ingestion | `IngestionRecordIndia.model.js` | `IndiaDataIngestionView.jsx` | `ingestionIndia.controller.js` | `ingestionValidationIndia.service.js` | `ingestionIndia.test.js` |
| **FR-12, FR-13, FR-14** | DSIR Scientific Review | `RndProjectActivityIndia.model.js` | `DsirActivityClassificationView.jsx` | `activityIndia.controller.js` | `dsirClassification.service.js` | `dsirClassification.test.js` |
| **FR-17, FR-18, FR-20** | 80-IAC Tax Savings Engine | `IndiaTaxCalculation.model.js` | `IndiaTaxCalculationSummaryView.jsx` | `taxCalculationIndia.controller.js` | `indiaTaxCalculator.service.js` | `indiaTaxCalculator.test.js` |
| **FR-21, FR-22, FR-23** | Chartered Accountant Queue | `CaReviewQueueItem.model.js` | `CaReviewWorkspaceView.jsx` | `caReviewIndia.controller.js` | `caReviewWorkspace.service.js` | `caReviewIndia.test.js` |
| **FR-25, FR-26, FR-29, FR-30**| IMB Package & GST Invoice | `InvoiceIndia.model.js` | `IndiaClaimAndGstInvoiceView.jsx` | `indiaBilling.controller.js` | `indiaBilling.service.js` | `indiaBilling.test.js` |
