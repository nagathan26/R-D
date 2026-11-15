import React, { useState } from 'react';
import { screenEligibilityIndia } from '../services/screenerService';

export default function IndiaEligibilityScreenerView({ onContinueToEngagement, initialCompany }) {
  const [formData, setFormData] = useState({
    companyName: initialCompany?.legalName || initialCompany?.companyName || '',
    contactEmail: initialCompany?.contactEmail || '',
    contactPhone: initialCompany?.contactPhone || '',
    companyPan: initialCompany?.pan || initialCompany?.companyPan || '',
    industrySector: initialCompany?.industrySector || 'Software/SaaS & AI',
    headcount: initialCompany?.headcount || '',
    incorporationDate: initialCompany?.incorporationDate ? new Date(initialCompany.incorporationDate).toISOString().split('T')[0] : '',
    annualTurnoverInr: '',
    annualRndPayrollInr: '',
    annualRndContractorSpendInr: '',
    annualRndCapitalEquipmentInr: '',
    isDpiitRecognized: false,
    hasRegisteredIndianPatents: false
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await screenEligibilityIndia(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (onContinueToEngagement && result) {
      onContinueToEngagement({
        company: result.company || {
          companyId: result.leadId,
          legalName: formData.companyName,
          pan: formData.companyPan,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone
        },
        assessment: result.assessment || {
          targetIncentives: [
            result.isEligibleFor80IAC ? 'SECTION_80_IAC' : null,
            result.isEligibleFor35_2AB ? 'SECTION_35_2AB_DSIR' : null,
            result.isEligibleForPatentBox115BBF ? 'SECTION_115BBF_PATENT' : null
          ].filter(Boolean),
          estimatedTaxSavingsInr: result.estimatedTaxSavingsInr
        },
        screeningResult: result
      });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
      {/* Step Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📋</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Step 1 of 3
                </span>
                <span className="text-xs text-slate-400">• Statutory Assessment</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Startup Eligibility & Incentive Screener</h1>
            </div>
          </div>
        </div>
        <p className="text-slate-300 text-xs mt-2 leading-relaxed max-w-2xl">
          Enter your company details to evaluate eligibility under Section 80-IAC (Startup Tax Holiday), DSIR Section 35(2AB), Section 115BBF Patent Box, and Government Innovation Grants.
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Company Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Technologies Pvt Ltd"
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Company PAN <span className="text-slate-400 font-normal lowercase">(e.g. ABCDE1234F)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ABCDE1234F"
              maxLength="10"
              pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}"
              title="Valid Indian PAN format: 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F)"
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg uppercase font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.companyPan}
              onChange={(e) => setFormData({ ...formData, companyPan: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Official Work Email</label>
            <input
              type="email"
              required
              placeholder="e.g. founder@company.com"
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Mobile Number (+91)</label>
            <input
              type="tel"
              pattern="[6-9][0-9]{9}"
              placeholder="e.g. 9876543210"
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Industry / Tech Domain</label>
            <select
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.industrySector}
              onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
            >
              <option>Software/SaaS & AI</option>
              <option>Deeptech & Hardware</option>
              <option>Biotechnology & Pharma</option>
              <option>CleanTech & EV</option>
              <option>Fintech</option>
              <option>Engineering & Manufacturing Services</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Date of Incorporation</label>
            <input
              type="date"
              required
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.incorporationDate}
              onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Annual Turnover (INR ₹)</label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 15000000 (1.5 Cr)"
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.annualTurnoverInr}
              onChange={(e) => setFormData({ ...formData, annualTurnoverInr: e.target.value })}
            />
            <span className="text-xs text-slate-500 mt-1 block">
              {formData.annualTurnoverInr
                ? `₹${(Number(formData.annualTurnoverInr) / 10000000).toFixed(2)} Crore (Max ₹100 Cr statutory cap for Section 80-IAC)`
                : 'Max ₹100 Cr statutory cap for Section 80-IAC eligibility'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Annual In-House R&D Payroll (INR ₹)</label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 6500000 (65 Lakhs)"
              className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.annualRndPayrollInr}
              onChange={(e) => setFormData({ ...formData, annualRndPayrollInr: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-5 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isDpiitRecognized}
                onChange={(e) => setFormData({ ...formData, isDpiitRecognized: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="font-medium">DPIIT Startup Recognition Certificate Available</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.hasRegisteredIndianPatents}
                onChange={(e) => setFormData({ ...formData, hasRegisteredIndianPatents: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="font-medium">Indian Patent Filed / Granted (IPO)</span>
            </label>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <span>Analyzing Statutory Eligibility Criteria...</span>
              ) : (
                <span>Evaluate Tax Benefits & Subsidies</span>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {result.isEligibleFor80IAC && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                  ✓ Section 80-IAC (100% Tax Holiday Candidate)
                </span>
              )}
              {result.isEligibleFor35_2AB && (
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">
                  ✓ Section 35(2AB) (DSIR R&D Deduction Candidate)
                </span>
              )}
              {result.isEligibleForPatentBox115BBF && (
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
                  ✓ Section 115BBF (10% Concessional Patent Box)
                </span>
              )}
            </div>

            <div className="mt-2">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Estimated Annual Tax / Incentive Value</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-0.5">{result.estimatedTaxSavingsInr.formatted}</div>
            </div>

            {result.eligibleGrants?.length > 0 && (
              <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Government Innovation Grants Available:</h4>
                <ul className="list-disc pl-5 text-xs text-amber-800 mt-1 space-y-0.5">
                  {result.eligibleGrants.map((grant, idx) => (
                    <li key={idx}>{grant}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Statutory Rationale:</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-slate-600 space-y-1">
                {result.rationale.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Seamless Flow Continuation Button */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleProceed}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-7 rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
              >
                <span>Proceed to Step 2: Agreement & E-Sign</span>
                <span className="text-base">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
