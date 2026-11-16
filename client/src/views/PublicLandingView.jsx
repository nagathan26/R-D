// client/src/views/PublicLandingView.jsx
import React, { useState } from 'react';

export default function PublicLandingView({ onNavigateLogin, onNavigateRegister, onStartDemo }) {
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Enterprise Public Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              IN
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">TaxIncentive.in</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  India SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">R&D Tax Incentives & Government Grant Advisory</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#overview" className="hover:text-emerald-400 transition">Overview</a>
            <a href="#incentives" className="hover:text-emerald-400 transition">Incentives</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
            <a href="#features" className="hover:text-emerald-400 transition">Features</a>
            <a href="#security" className="hover:text-emerald-400 transition">Security</a>
            <a href="#contact" className="hover:text-emerald-400 transition">Contact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateLogin}
              className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateRegister}
              className="text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 sm:px-5 py-2 rounded-lg shadow-lg shadow-emerald-500/25 transition flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Indian Statutory Compliance • Income-tax Act, 1961</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">R&D Tax Benefits</span> & Government Incentives
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover eligible Indian tax holidays, substantiate in-house scientific R&D expenditures, streamline statutory document ingestion, and track claims through one unified, enterprise-grade platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateRegister}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-xl shadow-emerald-500/30 transition text-base flex items-center justify-center space-x-2"
            >
              <span>Register Your Company</span>
              <span>→</span>
            </button>
            <a
              href="#incentives"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition text-base flex items-center justify-center"
            >
              Explore Incentives
            </a>
          </div>

          {/* Quick Stat Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 pt-8 text-left">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-emerald-400">100%</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">3-Year Tax Holiday (Sec 80-IAC)</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-teal-400">₹25L+</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">DSIR Sec 35(2AB) Eligible Cap</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-cyan-400">10%</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Patent Box Rate (Sec 115BBF)</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-amber-400">SHA-256</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Legally Sealed Audit Trails</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Platform Overview</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Built for Indian Technology & R&D Enterprises</h3>
            <p className="text-slate-400 text-sm sm:text-base mt-4">
              Navigating Indian tax statutes, DPIIT guidelines, and DSIR certifications is notoriously complex. TaxIncentive.in replaces fragmented spreadsheets and ad-hoc filings with a single, verifiable workflow.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-4">
                🎯
              </div>
              <h4 className="text-lg font-bold text-white">Automated Statutory Screener</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Instantly evaluate your incorporation vintage, DPIIT status, turnover caps, and scientific R&D expenditures against Indian statutory thresholds.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-2xl mb-4">
                ✍️
              </div>
              <h4 className="text-lg font-bold text-white">Verifiable Digital E-Sign</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Review contingency consulting engagements with zero upfront retainer risk, sealed cryptographically via Nodemailer OTP and SHA-256 evidence digests.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl mb-4">
                📂
              </div>
              <h4 className="text-lg font-bold text-white">Compliance Ingestion Vault</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Scheme-specific statutory document checklists: parse EPFO ECR wages, reconcile GSTR-3B turnover, extract Section 194J technical TDS, and track patent CBRs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Incentives Section */}
      <section id="incentives" className="py-20 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Statutory Coverage</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Indian Government Incentives & Tax Provisions</h3>
            <p className="text-slate-400 text-sm mt-3">Evaluated under the statutory provisions of the Indian Income-tax Act, 1961.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded">
                  Income-tax Act, 1961
                </span>
                <span className="text-xs text-slate-500 font-mono">DPIIT / IMB</span>
              </div>
              <h4 className="text-xl font-bold text-white mt-3">Section 80-IAC: 100% Startup Tax Holiday</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Eligible recognized DPIIT startups incorporated between April 1, 2016 and March 31, 2025 with turnover under ₹100 Crore can claim a 100% tax deduction on eligible profits for 3 consecutive years out of their first 10 years.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ ₹100 Cr Turnover Cap</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ DPIIT Certificate Required</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Form 10-CCB Filing</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded">
                  Scientific Research
                </span>
                <span className="text-xs text-slate-500 font-mono">DSIR Approved</span>
              </div>
              <h4 className="text-xl font-bold text-white mt-3">Section 35(2AB): In-House Scientific R&D</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Companies engaged in research, biotechnology, manufacturing, or eligible software/AI development incurring in-house scientific R&D expenditures (capital and revenue, excluding land & building) in approved centers.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Form 3CK & 3CL Filings</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ EPFO R&D Payroll Proof</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Separate R&D Accounts</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded">
                  Patent Box Regime
                </span>
                <span className="text-xs text-slate-500 font-mono">Indian Patent Office</span>
              </div>
              <h4 className="text-xl font-bold text-white mt-3">Section 115BBF: 10% Concessional Royalty</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Indian resident companies holding registered patents developed and registered in India can benefit from a concessional income tax rate of 10% on royalty income generated from commercializing patented inventions.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Form 3CFA Annual Return</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Patent CBR Receipt</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ 10% Flat Tax Benefit</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded">
                  Innovation Subsidies
                </span>
                <span className="text-xs text-slate-500 font-mono">DPIIT / MeitY / BIRAC</span>
              </div>
              <h4 className="text-xl font-bold text-white mt-3">Government Innovation Grants & Subsidies</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Startup India Seed Fund Scheme (SISFS up to ₹50 Lakhs), BIRAC BIG grants for biotechnology & healthcare, MeitY TIDE 2.0, and state government R&D capital expenditure subsidies.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Non-Dilutive Capital</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Milestone Disbursements</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">✓ Utilization Audits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">The 3-Step Journey</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">How Indian Companies Realize Incentives</h3>
            <p className="text-slate-400 text-sm mt-3">From initial eligibility screening to verified document ingestion and claim preparation.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base mb-4 shadow-lg shadow-emerald-500/20">
                1
              </div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Module 1</span>
              <h4 className="text-lg font-bold text-white mt-1">Eligibility Screener</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Input your company details, incorporation date, headcount, turnover, and annual R&D payroll. Our statutory engine checks Section 80-IAC, 35(2AB), 115BBF, and government grant criteria.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-base mb-4 shadow-lg shadow-teal-500/20">
                2
              </div>
              <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">Module 2</span>
              <h4 className="text-lg font-bold text-white mt-1">Contingency Agreement & E-Sign</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Review transparent contingency consulting terms (12% success fee, zero upfront cost). Verify authorized representative via Nodemailer OTP and seal with an immutable SHA-256 legal hash.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-base mb-4 shadow-lg shadow-cyan-500/20">
                3
              </div>
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Module 3</span>
              <h4 className="text-lg font-bold text-white mt-1">Compliance Data Ingestion</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Unlock dynamic statutory checklists tailored to your qualified incentives. Upload EPFO ECR payroll, GSTR-3B filings, Section 194J TDS ledgers, and patent CBR receipts for extraction and audit review.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onNavigateRegister}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition text-sm"
            >
              Start Free Assessment Now →
            </button>
          </div>
        </div>
      </section>

      {/* Security & Evidence Act Section */}
      <section id="security" className="py-20 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded">
                  Legal Evidence Admissibility
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
                  Compliant with Section 65B of the Indian Evidence Act
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
                  Every engagement letter, consent authorization, and statutory document upload is bound to an immutable SHA-256 cryptographic digest. Audit trails record signer identity, IP address, timestamp, and verification logs acceptable for tax scrutiny proceedings before the Income Tax Department and DSIR.
                </p>
                <div className="mt-6 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Role-based customer workspace isolation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Nodemailer cryptographic email verification OTP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Zero plain-text password storage (bcrypt salted hashing)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl font-mono text-xs text-slate-400">
                <div className="text-slate-500 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>statutory_audit_seal.json</span>
                  <span className="text-emerald-400 text-[10px]">VERIFIED</span>
                </div>
                <pre className="mt-3 text-[11px] leading-relaxed text-emerald-400/90 overflow-x-auto">
{`{
  "jurisdiction": "INDIA_INCOME_TAX_ACT_1961",
  "statute": "Section 80-IAC / Section 35(2AB)",
  "evidenceCompliance": "Section 65B Indian Evidence Act",
  "sha256AuditHash": "9e2c...84f1a",
  "verificationMethod": "EMAIL_OTP_NODEMAILER",
  "status": "STATUTORILY_SEALED"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Contact & Support</h2>
            <h3 className="text-3xl font-extrabold text-white mt-2">Have Questions on Section 80-IAC or DSIR?</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">
              Reach out to our Indian tax incentive advisory specialists or create an account to start your direct assessment.
            </p>
          </div>

          <div className="mt-8 bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800">
            {contactSubmitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <span className="text-3xl">✓</span>
                <h4 className="text-lg font-bold text-white mt-2">Thank you for your enquiry!</h4>
                <p className="text-xs text-emerald-300 mt-1">Our advisory team will review your company details and respond within 24 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-slate-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sanket Nagathan"
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-slate-400 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Inquiry / Query</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Tell us about your R&D projects, incorporation date, or incentive questions..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg text-sm"
                >
                  Send Advisory Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-white text-sm">TaxIncentive.in</span>
            <p className="mt-1 text-slate-400">Enterprise R&D Tax Incentive & Government Innovation Grant Advisory Platform</p>
            <p className="mt-0.5 text-[11px] text-slate-600">Complying with Income-tax Act, 1961 • Section 80-IAC • Section 35(2AB) • DPIIT Guidelines</p>
          </div>
          <div className="flex flex-wrap gap-6 text-slate-400 text-xs">
            <a href="#overview" className="hover:text-white transition">Overview</a>
            <a href="#incentives" className="hover:text-white transition">Incentives</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#security" className="hover:text-white transition">Security</a>
            <button onClick={onNavigateLogin} className="hover:text-emerald-400 transition font-medium">Customer Login</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-900 text-[11px] text-slate-600 text-center">
          <p>
            Disclaimer: TaxIncentive.in is an independent compliance technology and advisory software platform. All tax eligibility determinations are subject to final scrutiny and statutory approval by the Inter-Ministerial Board (IMB), Department of Scientific and Industrial Research (DSIR), and the Income Tax Department of India.
          </p>
        </div>
      </footer>
    </div>
  );
}
