/**
 * Eligibility View / DTO Presenter
 * Formats data for client presentation and audit-safe logs.
 */
class EligibilityView {
  formatScreeningResponse(lead) {
    const { _id, companyName, industry, screeningResult, createdAt } = lead;
    return {
      leadId: _id,
      companyName,
      industry,
      isQualified: screeningResult.isQualified,
      estimatedCreditRange: {
        min: screeningResult.estimatedCreditMin,
        max: screeningResult.estimatedCreditMax,
        formatted: `$${screeningResult.estimatedCreditMin.toLocaleString()} - $${screeningResult.estimatedCreditMax.toLocaleString()}`
      },
      eligibleForPayrollTaxOffset: screeningResult.eligibleForPayrollTaxOffset,
      rationale: screeningResult.rationale,
      disclaimer: screeningResult.disclaimer,
      evaluatedAt: createdAt
    };
  }
}

module.exports = new EligibilityView();

