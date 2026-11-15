const QUALIFYING_INDUSTRIES = ['Software/SaaS', 'Hardware/IoT', 'Biotech/Life Sciences', 'Engineering Services'];
const CURRENT_TAX_YEAR = 2026;

class EligibilityService {
  /**
   * Evaluates qualification & computes estimated credit range (ASC Method heuristics).
   */
  evaluateEligibility(data) {
    const {
      industry,
      annualEngineeringPayroll,
      contractorSpend = 0,
      cloudHostingSpend = 0,
      incorporationYear,
      grossReceiptsUnder5M
    } = data;

    const rationale = [];
    let isQualified = true;

    // 1. Industry Eligibility Check
    if (!QUALIFYING_INDUSTRIES.includes(industry)) {
      isQualified = false;
      rationale.push(`Industry '${industry}' typically requires custom manual review for technical uncertainty.`);
    }

    // 2. Minimum Payroll Threshold ($100k min for meaningful benefit)
    if (annualEngineeringPayroll < 100000) {
      isQualified = false;
      rationale.push('Annual engineering payroll under $100,000 provides negligible net credit after review costs.');
    }

    if (!isQualified) {
      return {
        isQualified: false,
        estimatedCreditMin: 0,
        estimatedCreditMax: 0,
        eligibleForPayrollTaxOffset: false,
        rationale,
        disclaimer: 'Preliminary non-binding evaluation. Does not constitute tax or legal advice.'
      };
    }

    // 3. Estimate Qualified Research Expenses (QRE)
    // Heuristic: 65% of software engineering wages qualify; 65% of contractor spend qualifies under §41(b)(3)
    const qualifyingWages = annualEngineeringPayroll * 0.65;
    const qualifyingContractors = (contractorSpend * 0.65) * 0.65; // Statutory 65% limit applied
    const qualifyingCloud = cloudHostingSpend * 0.50; // Direct dev/test environments

    const estimatedTotalQRE = qualifyingWages + qualifyingContractors + qualifyingCloud;

    // 4. Calculate Net Credit Range using Alternative Simplified Credit (ASC) heuristic (6% - 10% effective rate)
    const estimatedCreditMin = Math.round(estimatedTotalQRE * 0.06);
    const estimatedCreditMax = Math.round(estimatedTotalQRE * 0.10);

    // 5. Check Payroll Tax Offset Eligibility (IRC §41(h): < 5 yrs in business & < $5M gross receipts)
    const businessAgeYears = CURRENT_TAX_YEAR - incorporationYear;
    const eligibleForPayrollTaxOffset = businessAgeYears <= 5 && grossReceiptsUnder5M === true;

    rationale.push(`Identified estimated annual QRE base of ~$${Math.round(estimatedTotalQRE).toLocaleString()}.`);
    if (eligibleForPayrollTaxOffset) {
      rationale.push('Eligible for Federal Payroll Tax Offset up to $500,000/year to offset employer FICA tax.');
    } else {
      rationale.push('Eligible for Income Tax Credit carryforward.');
    }

    return {
      isQualified: true,
      estimatedCreditMin,
      estimatedCreditMax,
      eligibleForPayrollTaxOffset,
      rationale,
      disclaimer: 'Estimates are based on standard IRC §41 guidance. Actual recovery is subject to audit review and CPA filing.'
    };
  }
}

module.exports = new EligibilityService();

