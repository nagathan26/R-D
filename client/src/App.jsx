import React, { useState } from 'react';
import IndiaEligibilityScreenerView from './views/IndiaEligibilityScreenerView';
import IndiaEngagementSignView from './views/IndiaEngagementSignView';
import IndiaDataIngestionView from './views/IndiaDataIngestionView';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [company, setCompany] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  const isScreened = Boolean(company && assessment);
  const isExecuted = engagement?.agreementStatus === 'EXECUTED';

  // Step 1 Complete -> Proceed to Step 2
  const handleScreeningComplete = ({ company: screenedCompany, assessment: screenedAssessment }) => {
    setCompany(screenedCompany);
    setAssessment(screenedAssessment);
    setMaxUnlockedStep((prev) => Math.max(prev, 2));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Executed -> Unlock Step 3
  const handleEngagementExecuted = (executedEngagement) => {
    setEngagement(executedEngagement);
    setMaxUnlockedStep(3);
  };

  const handleContinueToIngestion = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateProgress = () => {
    if (isExecuted) return 100;
    if (isScreened) return 66;
    return 33;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Enterprise Top Navigation */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md">
              <span className="text-xl">🇮🇳</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">TaxIncentive.in</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                  India Jurisdiction
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Income-tax Act, 1961 • Section 80-IAC • Section 35(2AB) • Section 115BBF
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {company?.legalName && (
              <div className="hidden sm:flex items-center bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-slate-400 mr-1.5">Client:</span>
                <span className="text-emerald-400 font-bold max-w-[180px] truncate">{company.legalName}</span>
                {company.pan && <span className="ml-1.5 text-slate-400 font-mono">({company.pan})</span>}
              </div>
            )}
            <div className="flex items-center space-x-2 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">System Online</span>
            </div>
          </div>
        </div>

        {/* Cohesive Stepper Progress Bar */}
        <div className="border-t border-slate-800 bg-slate-950/60 px-6 py-3">
          <div className="max-w-4xl mx-auto">
            {/* Progress Track */}
            <div className="flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-800 -z-0 rounded">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
              </div>

              {/* Step 1 */}
              <button
                onClick={() => setCurrentStep(1)}
                className={`relative z-10 flex items-center space-x-2.5 px-3 py-1.5 rounded-lg transition ${
                  currentStep === 1
                    ? 'bg-slate-800 text-white shadow'
                    : isScreened
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isScreened
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : currentStep === 1
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isScreened ? '✓' : '1'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold leading-tight">Eligibility Screener</div>
                  <div className="text-[10px] text-slate-400">Section 80-IAC & 35(2AB)</div>
                </div>
              </button>

              {/* Step 2 */}
              <button
                onClick={() => maxUnlockedStep >= 2 && setCurrentStep(2)}
                disabled={maxUnlockedStep < 2}
                className={`relative z-10 flex items-center space-x-2.5 px-3 py-1.5 rounded-lg transition ${
                  currentStep === 2
                    ? 'bg-slate-800 text-white shadow'
                    : isExecuted
                    ? 'text-slate-300 hover:text-white'
                    : maxUnlockedStep >= 2
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isExecuted
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : currentStep === 2
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isExecuted ? '✓' : '2'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold leading-tight">Engagement & E-Sign</div>
                  <div className="text-[10px] text-slate-400">Nodemailer OTP Audit</div>
                </div>
              </button>

              {/* Step 3 */}
              <button
                onClick={() => maxUnlockedStep >= 3 && setCurrentStep(3)}
                disabled={maxUnlockedStep < 3}
                className={`relative z-10 flex items-center space-x-2.5 px-3 py-1.5 rounded-lg transition ${
                  currentStep === 3
                    ? 'bg-slate-800 text-white shadow'
                    : maxUnlockedStep >= 3
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    currentStep === 3
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {maxUnlockedStep < 3 ? '🔒' : '3'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold leading-tight">Compliance Ingestion</div>
                  <div className="text-[10px] text-slate-400">EPFO, GSTR-3B & TDS</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Flow Container */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <IndiaEligibilityScreenerView
              initialCompany={company}
              onContinueToEngagement={handleScreeningComplete}
            />
          )}

          {currentStep === 2 && (
            <IndiaEngagementSignView
              company={company}
              assessment={assessment}
              existingEngagement={engagement}
              onEngagementExecuted={handleEngagementExecuted}
              onContinueToIngestion={handleContinueToIngestion}
              onBack={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentStep === 3 && (
            <IndiaDataIngestionView
              company={company}
              assessment={assessment}
              engagement={engagement}
              onBack={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-slate-500 border-t bg-white">
        <p>TaxIncentive.in • Indian R&D & Startup Incentive Advisory Platform</p>
        <p className="mt-1 text-slate-400">Complying with Income-tax Act, 1961, DPIIT Guidelines & DSIR Regulations</p>
      </footer>
    </div>
  );
}
