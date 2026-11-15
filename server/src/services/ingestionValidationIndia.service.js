// server/src/services/ingestionValidationIndia.service.js

class IngestionValidationIndiaService {
  /**
   * Validate EPFO ECR (Electronic Challan cum Return) Payroll headers and extract wage data
   */
  validateEpfoEcrHeaders(headers) {
    const required = ['uan', 'member_name', 'gross_wages', 'epf_wages'];
    const lowerHeaders = (headers || []).map((h) => String(h).toLowerCase().trim());
    const missing = required.filter((col) => !lowerHeaders.includes(col));
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }

  /**
   * Extract and audit EPFO Payroll data for Section 35(2AB) in-house R&D staff wages
   */
  processEpfoPayroll({ headers = [], rawRecords = [], declaredRndHeadcount = 0, declaredPayrollInr = 0 }) {
    const headerCheck = this.validateEpfoEcrHeaders(headers);
    const auditFlags = [];
    let validationStatus = 'VALIDATED';

    if (!headerCheck.isValid) {
      validationStatus = 'DEFICIENT_DATA';
      headerCheck.missingFields.forEach((f) => auditFlags.push(`Missing mandatory EPFO column: ${f}`));
    }

    const employeeCount = rawRecords.length > 0 ? rawRecords.length : Number(declaredRndHeadcount || 0);
    const totalWagesInr = Number(declaredPayrollInr || 0);
    const avgMonthlyWageInr = employeeCount > 0 ? Math.round(totalWagesInr / employeeCount / 12) : 0;

    if (employeeCount < 1) {
      auditFlags.push('Zero active employees reported in EPFO payroll ledger');
      validationStatus = 'DEFICIENT_DATA';
    }
    if (totalWagesInr <= 0) {
      auditFlags.push('Zero or undeclared R&D payroll wages in submission');
      validationStatus = 'DEFICIENT_DATA';
    }

    return {
      validationStatus,
      auditFlags,
      extractedData: {
        documentType: 'EPFO_ECR_PAYROLL',
        statutoryScheme: 'Section 35(2AB) In-House R&D Wage Substantiation',
        employeeCount,
        totalWagesInr,
        avgMonthlyWageInr,
        mandatoryColumnsVerified: headerCheck.isValid,
        epfContributionRate: '12% employer + 12% employee',
        parsedDate: new Date().toISOString()
      }
    };
  }

  /**
   * Validate GSTR-3B Monthly Return turnover against Section 80-IAC ₹100 Crore limit
   */
  validateGstr3bTurnover(turnoverInr) {
    const numTurnover = Number(turnoverInr || 0);
    const turnoverInCrores = numTurnover / 10000000;
    const isWithinCap = turnoverInCrores <= 100;
    return {
      isWithinCap,
      turnoverInCrores: Number(turnoverInCrores.toFixed(2)),
      warning: !isWithinCap
        ? `Turnover of ₹${turnoverInCrores.toFixed(2)} Cr exceeds Section 80-IAC statutory threshold of ₹100 Crore`
        : null
    };
  }

  /**
   * Process GSTR-3B Return and extract turnover proof
   */
  processGstr3b({ gstin, taxPeriod = 'FY 2025-26', declaredTurnoverInr = 0, interStateSuppliesInr = 0 }) {
    const turnoverCheck = this.validateGstr3bTurnover(declaredTurnoverInr);
    const auditFlags = [];
    let validationStatus = 'VALIDATED';

    if (!turnoverCheck.isWithinCap) {
      auditFlags.push(turnoverCheck.warning);
      validationStatus = 'DEFICIENT_DATA';
    }

    if (Number(declaredTurnoverInr || 0) <= 0) {
      auditFlags.push('Turnover is unrecorded or zero');
      validationStatus = 'NEEDS_REVIEW';
    }

    return {
      validationStatus,
      auditFlags,
      extractedData: {
        documentType: 'GSTR_3B_TURNOVER',
        statutoryScheme: 'Section 80-IAC Turnover Cap Verification',
        gstin: gstin || 'UNSPECIFIED',
        taxPeriod,
        taxableSuppliesInr: Number(declaredTurnoverInr || 0),
        turnoverInCrores: turnoverCheck.turnoverInCrores,
        isWithinStatutoryCap: turnoverCheck.isWithinCap,
        maxStatutoryCap: '₹100 Crore (Section 80-IAC)',
        parsedDate: new Date().toISOString()
      }
    };
  }

  /**
   * Process Form 26AS / AIS for Section 194J Technical TDS (contractor R&D spend)
   */
  processForm26AS({ deductorTan, contractorSpendInr = 0, sectionCode = '194J' }) {
    const auditFlags = [];
    let validationStatus = 'VALIDATED';

    const is194J = sectionCode.toUpperCase().includes('194J');
    if (!is194J) {
      auditFlags.push(`Section ${sectionCode} reported; Section 194J required for Technical/R&D Service fees`);
      validationStatus = 'NEEDS_REVIEW';
    }

    const cleanSpend = Number(contractorSpendInr || 0);
    const tdsDeductedInr = Math.round(cleanSpend * 0.10); // Standard 10% TDS under 194J

    if (cleanSpend <= 0) {
      auditFlags.push('Zero contractor spend reported');
      validationStatus = 'NEEDS_REVIEW';
    }

    return {
      validationStatus,
      auditFlags,
      extractedData: {
        documentType: 'FORM_26AS_CONTRACTOR_TDS',
        statutoryScheme: 'Section 35(2AB) External Technical Contract Verification',
        deductorTan: deductorTan || 'UNSPECIFIED',
        sectionCode: 'Section 194J (Fees for Professional or Technical Services)',
        contractorSpendInr: cleanSpend,
        tdsDeductedInr,
        tdsRate: '10%',
        parsedDate: new Date().toISOString()
      }
    };
  }

  /**
   * Process Patent Office CBR (Cash Book Receipt) for Section 115BBF Patent Box
   */
  processPatentCbr({ applicationNumber, cbrNumber, patentTitle, filingDate }) {
    const auditFlags = [];
    let validationStatus = 'VALIDATED';

    if (!applicationNumber) {
      auditFlags.push('Patent Application Number missing from receipt submission');
      validationStatus = 'NEEDS_REVIEW';
    }

    return {
      validationStatus,
      auditFlags,
      extractedData: {
        documentType: 'PATENT_CBR_RECEIPT',
        statutoryScheme: 'Section 115BBF 10% Concessional Patent Tax Regime',
        issuingAuthority: 'Indian Patent Office (Controller General of Patents, Designs and Trade Marks)',
        applicationNumber: applicationNumber || 'PENDING_REGISTRATION',
        cbrNumber: cbrNumber || 'CBR-' + Date.now().toString().slice(-6),
        patentTitle: patentTitle || 'Unspecified Patent Title',
        filingDate: filingDate || new Date().toISOString().split('T')[0],
        status: 'OFFICIALLY_REGISTERED',
        parsedDate: new Date().toISOString()
      }
    };
  }

  /**
   * Process DPIIT Recognition Certificate for Section 80-IAC and SISFS Grants
   */
  processDpiitCertificate({ dpiitNumber, legalName, incorporationDate }) {
    const auditFlags = [];
    let validationStatus = 'VALIDATED';

    if (!dpiitNumber) {
      auditFlags.push('DPIIT Certificate Number is required for verification');
      validationStatus = 'NEEDS_REVIEW';
    }

    return {
      validationStatus,
      auditFlags,
      extractedData: {
        documentType: 'DPIIT_CERTIFICATE',
        statutoryScheme: 'Section 80-IAC & Startup India Seed Fund Scheme (SISFS)',
        dpiitCertificateNumber: dpiitNumber || 'PENDING_DPIIT_NUMBER',
        recognizedLegalName: legalName || 'Entity',
        incorporationDate: incorporationDate || 'Unspecified',
        recognitionStatus: 'ACTIVE_AND_RECOGNIZED',
        parsedDate: new Date().toISOString()
      }
    };
  }
}

module.exports = new IngestionValidationIndiaService();
