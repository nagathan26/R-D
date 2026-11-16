// client/src/views/IncentiveTrackingView.jsx
import React from 'react';

export default function IncentiveTrackingView({ summary, onNavigateTab }) {
  const latestAssessment = summary?.latestAssessment;
  const targetIncentives = latestAssessment?.targetIncentives || [];
  const latestEngagement = summary?.latestEngagement;
  const isExecuted = latestEngagement?.agreementStatus === 'EXECUTED';

  const has80IAC = targetIncentives.includes('SECTION_80_IAC');
  const has35_2AB = targetIncentives.includes('SECTION_35_2AB_DSIR');
  const has115BBF = targetIncentives.includes('SECTION_115BBF_PATENT');
  const hasGrants = targetIncentives.includes('GOVT_GRANTS_SISFS_BIRAC');

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-600 font-semibold mb-1">
            <span>🇮🇳 Indian Statutory Schemes</span>
            <span>•</span>
            <span>Incentive Lifecycle Tracking</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Incentive Applications & Claims Pipeline</h2>
          <p className="text-slate-500 mt-1">
            Tracking statutory milestones under Income-tax Act, 1961, DPIIT guidelines, and DSIR certifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('vault')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
          >
            Upload Compliance Docs →
          </button>
        </div>
      </div>

      {/* Grid of Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheme 1: Section 80-IAC */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          has80IAC ? 'bg-white border-emerald-300' : 'bg-slate-50/70 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Income-tax Act, 1961
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">Section 80-IAC: 100% Tax Holiday</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              has80IAC ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {has80IAC ? 'Candidate Qualified' : 'Not Qualified'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            100% deduction on profits from eligible innovation business for 3 consecutive assessment years within the first 10 years of incorporation.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <h4 className="font-bold uppercase text-slate-500 text-[10px]">Statutory Milestones:</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>1. DPIIT Startup Recognition Certificate</span>
                <span className="text-emerald-600 font-bold">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>2. Inter-Ministerial Board (IMB) Application Dossier</span>
                <span className={isExecuted ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                  {isExecuted ? 'In Preparation' : 'Locked (Pending Sign)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>3. Form 10-CCB Audit Report by Chartered Accountant</span>
                <span className="text-slate-400">Scheduled for ITR filing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheme 2: Section 35(2AB) */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          has35_2AB ? 'bg-white border-teal-300' : 'bg-slate-50/70 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                DSIR Scientific R&D
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">Section 35(2AB): In-House R&D Deduction</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              has35_2AB ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {has35_2AB ? 'Candidate Qualified' : 'Not Qualified'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Statutory tax deduction for expenditure incurred on in-house scientific research & experimental development facility approved by DSIR.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <h4 className="font-bold uppercase text-slate-500 text-[10px]">Statutory Milestones:</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>1. Form 3CK Application to Secretary, DSIR</span>
                <span className="text-slate-500 font-medium">Pending Submission</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>2. EPFO ECR Payroll & Timesheet Substantiation</span>
                <span className="text-teal-600 font-bold">Document Vault Ready</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>3. Form 3CL Statutory Certification by DSIR to CBDT</span>
                <span className="text-slate-400">Post Inspection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheme 3: Section 115BBF */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          has115BBF ? 'bg-white border-purple-300' : 'bg-slate-50/70 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Indian Patent Box
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">Section 115BBF: 10% Concessional Patent Tax</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              has115BBF ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {has115BBF ? 'Candidate Qualified' : 'Not Qualified'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            10% concessional corporate income tax rate on royalty income derived from patents developed and registered in India under the Patents Act, 1970.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <h4 className="font-bold uppercase text-slate-500 text-[10px]">Statutory Milestones:</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>1. Patent CBR Filing / Grant Verification</span>
                <span className="text-purple-600 font-bold">Ready for Ingestion</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>2. Form 3CFA Annual Return to Director General</span>
                <span className="text-slate-400">Due with Form ITR-6</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheme 4: Innovation Grants */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          hasGrants ? 'bg-white border-amber-300' : 'bg-slate-50/70 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Non-Dilutive Subsidies
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">Government Grants (SISFS / BIRAC)</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              hasGrants ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {hasGrants ? 'Candidate Qualified' : 'Not Qualified'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Startup India Seed Fund Scheme (SISFS up to ₹50 Lakhs), BIRAC BIG grants for healthcare/biotech innovation, and state government R&D capital expenditure subsidies.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <h4 className="font-bold uppercase text-slate-500 text-[10px]">Statutory Milestones:</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>1. Incubator Selection / DPIIT Seed Fund Application</span>
                <span className="text-amber-600 font-bold">Available</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                <span>2. Milestone Expenditure & Utilization Audit</span>
                <span className="text-slate-400">Post Sanction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
