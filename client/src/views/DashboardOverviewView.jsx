// client/src/views/DashboardOverviewView.jsx
import React from 'react';

export default function DashboardOverviewView({
  summary,
  company,
  user,
  onNavigateTab
}) {
  const stats = summary?.stats || {};
  const currentStep = summary?.currentStep || 1;
  const journeyProgress = summary?.journeyProgress || 25;
  const latestAssessment = summary?.latestAssessment;
  const latestEngagement = summary?.latestEngagement;
  const isExecuted = latestEngagement?.agreementStatus === 'EXECUTED';
  const isScreened = Boolean(latestAssessment);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1">
              <span>🇮🇳 Indian R&D & Tax Incentive Workspace</span>
              <span>•</span>
              <span className="font-mono text-slate-300">ID: {company?.companyId || 'PROVISIONAL'}</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Welcome back, {user?.name || 'Director'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Managing incentive compliance for <strong className="text-white">{company?.legalName || 'Your Enterprise'}</strong> under Section 80-IAC, Section 35(2AB), and related government schemes.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('screener')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
            >
              {isScreened ? 'Re-evaluate Screener' : 'Start Assessment →'}
            </button>
            <button
              onClick={() => onNavigateTab('vault')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs transition"
            >
              Document Vault
            </button>
          </div>
        </div>
      </div>

      {/* Customer Journey Progress Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Customer Incentive Journey</h2>
            <p className="text-xs text-slate-500">Track statutory progress through assessment, legal execution, and document validation.</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {journeyProgress}% Completed
          </span>
        </div>

        {/* Stepper Bar */}
        <div className="relative mt-6 mb-8">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 rounded">
            <div
              className="h-full bg-emerald-500 transition-all duration-700 rounded"
              style={{ width: `${journeyProgress}%` }}
            ></div>
          </div>

          <div className="relative flex justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                  isScreened
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : currentStep === 1
                    ? 'bg-white border-emerald-500 text-emerald-600'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isScreened ? '✓' : '1'}
              </div>
              <span className="text-xs font-bold mt-2 text-slate-800">Eligibility Screener</span>
              <span className="text-[10px] text-slate-500">Module 1</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                  isExecuted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : currentStep === 2
                    ? 'bg-white border-emerald-500 text-emerald-600'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isExecuted ? '✓' : '2'}
              </div>
              <span className="text-xs font-bold mt-2 text-slate-800">Engagement & E-Sign</span>
              <span className="text-[10px] text-slate-500">Module 2</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                  stats.verifiedDocumentsCount > 0
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : currentStep === 3
                    ? 'bg-white border-emerald-500 text-emerald-600'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {stats.verifiedDocumentsCount > 0 ? '✓' : '3'}
              </div>
              <span className="text-xs font-bold mt-2 text-slate-800">Compliance Ingestion</span>
              <span className="text-[10px] text-slate-500">Module 3</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                  currentStep === 4
                    ? 'bg-white border-emerald-500 text-emerald-600'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                4
              </div>
              <span className="text-xs font-bold mt-2 text-slate-800">Claim Preparation</span>
              <span className="text-[10px] text-slate-500">IMB / DSIR Scrutiny</span>
            </div>
          </div>
        </div>

        {/* Dynamic Journey Callout Button */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-700">
            {currentStep === 1 && !isScreened && (
              <span>Your company has not yet completed the statutory screener. Evaluate tax holiday candidate status now.</span>
            )}
            {isScreened && !isExecuted && (
              <span>Your screener is complete! Sign the Contingency Engagement Agreement with zero upfront risk to unlock Document Vault.</span>
            )}
            {isExecuted && stats.pendingDocumentsCount === 0 && (
              <span>Engagement executed! Upload your EPFO payroll, GSTR-3B, and TDS ledgers in Document Vault.</span>
            )}
            {isExecuted && stats.pendingDocumentsCount > 0 && (
              <span>You have {stats.pendingDocumentsCount} statutory document(s) awaiting extraction review.</span>
            )}
          </div>

          <div>
            {!isScreened && (
              <button
                onClick={() => onNavigateTab('screener')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
              >
                Begin Screener →
              </button>
            )}
            {isScreened && !isExecuted && (
              <button
                onClick={() => onNavigateTab('engagement')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
              >
                Review & E-Sign Agreement →
              </button>
            )}
            {isExecuted && (
              <button
                onClick={() => onNavigateTab('vault')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
              >
                Open Document Vault →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Company Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>COMPANY ENTITY</span>
              <span className="text-emerald-600 text-lg">🏢</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate" title={company?.legalName}>
              {company?.legalName || 'Company Profile'}
            </h3>
            <p className="font-mono text-xs text-slate-500 mt-1">PAN: {company?.pan || 'Not Provided'}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{company?.industrySector || 'Technology'}</span>
            <button onClick={() => onNavigateTab('company')} className="text-emerald-600 font-bold hover:underline">
              Edit Profile →
            </button>
          </div>
        </div>

        {/* Card 2: Assessment Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>STATUTORY ELIGIBILITY</span>
              <span className="text-teal-600 text-lg">📊</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {stats.eligibleIncentivesCount} Schemes Qualified
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Est. Value: {stats.estimatedSavingsFormatted}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{stats.assessmentStatus}</span>
            <button onClick={() => onNavigateTab('screener')} className="text-emerald-600 font-bold hover:underline">
              {isScreened ? 'View Details →' : 'Run Screener →'}
            </button>
          </div>
        </div>

        {/* Card 3: Engagement Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>AGREEMENT STATUS</span>
              <span className="text-amber-600 text-lg">✍️</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {isExecuted ? 'Agreement Executed' : latestEngagement ? latestEngagement.agreementStatus : 'Not Initiated'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isExecuted ? 'Sealed with SHA-256 Digest' : 'Contingency Model (12% Fee)'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isExecuted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {stats.agreementStatus}
            </span>
            <button onClick={() => onNavigateTab('engagement')} className="text-emerald-600 font-bold hover:underline">
              {isExecuted ? 'View Seal →' : 'Execute →'}
            </button>
          </div>
        </div>

        {/* Card 4: Compliance Documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>DOCUMENT VAULT</span>
              <span className="text-cyan-600 text-lg">📂</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {stats.verifiedDocumentsCount} / {stats.totalDocumentsCount || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats.pendingDocumentsCount} Document(s) Pending Review
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">EPFO, GSTR & TDS</span>
            <button onClick={() => onNavigateTab('vault')} className="text-emerald-600 font-bold hover:underline">
              Manage Vault →
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Qualified Schemes & Recent Ingestion Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Eligible Schemes Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Statutory Schemes In Scope
            </h3>
            <button onClick={() => onNavigateTab('incentives')} className="text-xs text-emerald-600 font-bold hover:underline">
              View Tracking Pipeline →
            </button>
          </div>

          {latestAssessment?.targetIncentives?.length > 0 ? (
            <div className="space-y-3">
              {latestAssessment.targetIncentives.map((scheme, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">
                      {scheme === 'SECTION_80_IAC' && 'Section 80-IAC (100% Tax Holiday)'}
                      {scheme === 'SECTION_35_2AB_DSIR' && 'Section 35(2AB) (In-House Scientific R&D)'}
                      {scheme === 'SECTION_115BBF_PATENT' && 'Section 115BBF (10% Patent Box)'}
                      {scheme === 'GOVT_GRANTS_SISFS_BIRAC' && 'Government Innovation Grants (SISFS / BIRAC)'}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Statutory compliance & verification candidate</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Eligible
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No statutory assessment completed yet.</p>
              <button
                onClick={() => onNavigateTab('screener')}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Run Module 1 Screener Now
              </button>
            </div>
          )}
        </div>

        {/* Right: Statutory Compliance Box */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-3">
              <span className="uppercase tracking-wider">Statutory Audit Guidelines</span>
              <span>Income-tax Act, 1961</span>
            </div>
            <h3 className="text-base font-bold text-white">Indian Evidence Act (Section 65B) Compliance</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              All digital signatures, Nodemailer OTP events, and compliance document hashes generated on TaxIncentive.in are cryptographically timestamped and sealed with SHA-256 digests. Keep statutory records up-to-date for scrutiny by the Inter-Ministerial Board and DSIR.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Client CA Partnership Available</span>
            <button
              onClick={() => onNavigateTab('support')}
              className="text-emerald-400 hover:underline font-bold"
            >
              Contact Specialist Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
