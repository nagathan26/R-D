/**
 * Indian Eligibility View / DTO Presenter
 */
class EligibilityIndiaView {
  formatResponse(lead) {
    const { _id, companyName, industrySector, screeningResult, createdAt } = lead;
    return {
      leadId: _id,
      companyName,
      industrySector,
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
      disclaimer: screeningResult.disclaimer,
      evaluatedAt: createdAt
    };
  }
}

module.exports = new EligibilityIndiaView();

