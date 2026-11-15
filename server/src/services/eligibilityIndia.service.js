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

