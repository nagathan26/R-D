const eligibilityService = require('../src/services/eligibilityIndia.service');

describe('Module 1: Indian Eligibility Screener Service Unit Tests', () => {
  test('should qualify Deeptech startup under Section 80-IAC, Patent Box, and Government Grants', () => {
    const input = {
      industrySector: 'Deeptech & Hardware',
      incorporationDate: '2022-04-15',
      annualTurnoverInr: 25000000, // ₹2.5 Crore
      annualRndPayrollInr: 9500000, // ₹95 Lakhs
      annualRndContractorSpendInr: 1500000,
      annualRndCapitalEquipmentInr: 1000000,
      isDpiitRecognized: true,
      hasRegisteredIndianPatents: true
    };

    const res = eligibilityService.evaluateEligibility(input);

    expect(res.isEligibleFor80IAC).toBe(true);
    expect(res.isEligibleFor35_2AB).toBe(true);
    expect(res.isEligibleForPatentBox115BBF).toBe(true);
    expect(res.estimatedTaxSavingsMinInr).toBeGreaterThan(0);
    expect(res.eligibleGrants).toContain('Startup India Seed Fund Scheme (SISFS) - Up to ₹50 Lakhs');
    expect(res.eligibleGrants).toContain('MeitY TIDE 2.0 / SAMRIDH Innovation Grants');
  });

  test('should disqualify from Section 80-IAC when turnover exceeds ₹100 Crore', () => {
    const input = {
      industrySector: 'Software/SaaS & AI',
      incorporationDate: '2021-01-01',
      annualTurnoverInr: 1500000000, // ₹150 Crore (Exceeds ₹100 Cr cap)
      annualRndPayrollInr: 30000000
    };

    const res = eligibilityService.evaluateEligibility(input);

    expect(res.isEligibleFor80IAC).toBe(false);
    expect(res.rationale.some((r) => r.includes('exceeds the ₹100 Crore statutory cap'))).toBe(true);
  });

  test('should qualify for Section 35(2AB) when R&D spend exceeds ₹25 Lakhs', () => {
    const input = {
      industrySector: 'Biotechnology & Pharma',
      incorporationDate: '2015-01-01', // >10 yrs old, so ineligible for 80-IAC
      annualTurnoverInr: 50000000,
      annualRndPayrollInr: 5000000, // ₹50 Lakhs R&D spend
      isDpiitRecognized: false
    };

    const res = eligibilityService.evaluateEligibility(input);

    expect(res.isEligibleFor80IAC).toBe(false);
    expect(res.isEligibleFor35_2AB).toBe(true);
    expect(res.rationale.some((r) => r.includes('Section 35(2AB) 100% R&D deduction'))).toBe(true);
  });
});

