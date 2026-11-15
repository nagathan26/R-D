// client/src/views/IndiaEngagementSignView.jsx
import React, { useState, useEffect } from 'react';
import { prepareEngagement, sendSigningOtp, verifyAndSignAgreement } from '../services/engagementService';

export default function IndiaEngagementSignView({
  company,
  assessment,
  existingEngagement,
  onEngagementExecuted,
  onContinueToIngestion,
  onBack
}) {
  const [currentEngagement, setCurrentEngagement] = useState(existingEngagement || null);
  const [signerName, setSignerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [signerEmail, setSignerEmail] = useState(company?.contactEmail || '');
  const [otpCode, setOtpCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize or fetch engagement for the company
  useEffect(() => {
    let isMounted = true;
    const initEngagement = async () => {
      if (existingEngagement && existingEngagement.engagementId) {
        setCurrentEngagement(existingEngagement);
        return;
      }
      try {
        setLoading(true);
        const resp = await prepareEngagement({
          companyId: company?.companyId || company?._id,
          assessmentId: assessment?.assessmentId || assessment?._id,
          feePercentage: 12
        });
        if (isMounted && resp?.data) {
          setCurrentEngagement(resp.data);
          if (resp.data.agreementStatus === 'EXECUTED') {
            if (onEngagementExecuted) onEngagementExecuted(resp.data);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initEngagement();
    return () => { isMounted = false; };
  }, [company, assessment, existingEngagement]);

  // Request Nodemailer OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const engagementId = currentEngagement?.engagementId || currentEngagement?._id;
    if (!engagementId) {
      setError('Engagement record could not be found. Please return to Step 1.');
      setLoading(false);
      return;
    }

    try {
      const resp = await sendSigningOtp(engagementId, {
        signerEmail,
        signerName: signerName || 'Authorized Signatory',
        designation
      });
      setOtpSent(true);

      setSuccessMessage(resp?.data?.message || `Verification OTP has been dispatched to ${signerEmail}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Seal Agreement
  const handleVerifyAndExecute = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please tick the consent checkbox to authorize digital signature.');
      return;
    }
    setError(null);
    setLoading(true);

    const engagementId = currentEngagement?.engagementId || currentEngagement?._id;

    try {
      const resp = await verifyAndSignAgreement(engagementId, {
        otpCode: otpCode.trim(),
        signerName,
        designation,
        signerEmail
      });
      const executed = resp.data;
      setCurrentEngagement(executed);
      setSuccessMessage('Agreement successfully executed and sealed with SHA-256 audit hash.');
      if (onEngagementExecuted) {
        onEngagementExecuted(executed);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isExecuted = currentEngagement?.agreementStatus === 'EXECUTED';
  const displayLegalName = currentEngagement?.companyLegalName || company?.legalName || 'Applicant Entity';
  const displayPan = currentEngagement?.panNumber || company?.pan || 'Pending Verification';
  const displayIncentives = currentEngagement?.targetIncentives || assessment?.targetIncentives || [];

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
      {/* Step Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✍️</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Step 2 of 3
                </span>
                <span className="text-xs text-slate-400">• Agreement & E-Sign</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Contingency Consulting Agreement</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800"
              >
                ← Back to Screener
              </button>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isExecuted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {currentEngagement?.agreementStatus || 'DRAFT'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Verified Entity Context Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Verified Entity Profile & Incentive Scope
            </h4>
            {currentEngagement?.engagementId && (
              <span className="text-xs font-mono font-medium text-slate-500">ID: {currentEngagement.engagementId}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block font-medium">Legal Name</span>
              <span className="font-bold text-slate-900 text-sm">{displayLegalName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Company PAN</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{displayPan}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Eligible Schemes</span>
              <span className="font-semibold text-emerald-700">{displayIncentives.join(', ')}</span>
            </div>
            <div>
              <span className="text-slatdemoe-400 block font-medium">Fee Terms</span>
              <span className="font-semibold text-slate-900">12% Contingency (+ 18% GST)</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Executed View State */}
        {isExecuted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">Engagement Agreement Fully Executed</h3>
                <p className="text-xs text-emerald-700">Verified via Nodemailer Email OTP under Section 65B of Indian Evidence Act.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-100 text-xs space-y-2 text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><strong>Authorized Signatory:</strong> {currentEngagement?.digitalSignature?.authorizedSignatoryName} ({currentEngagement?.digitalSignature?.signatoryDesignation})</div>
                <div><strong>Signatory Email:</strong> {currentEngagement?.digitalSignature?.signerEmail}</div>
                <div><strong>Execution Timestamp:</strong> {new Date(currentEngagement?.digitalSignature?.signedAt || Date.now()).toLocaleString('en-IN')}</div>
                <div><strong>Audit Method:</strong> Nodemailer Email OTP</div>
              </div>
              <div className="pt-2 border-t">
                <span className="text-[11px] text-slate-500 block font-semibold mb-1">SHA-256 Legal Audit Hash:</span>
                <code className="text-[11px] font-mono bg-slate-100 p-1.5 rounded block break-all text-slate-800">
                  {currentEngagement?.digitalSignature?.sha256AuditHash}
                </code>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onContinueToIngestion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-7 rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
              >
                <span>Proceed to Step 3: Compliance Data Ingestion</span>
                <span className="text-base">→</span>
              </button>
            </div>
          </div>
        ) : (
          /* Agreement Terms & Signatory Form */
          <div>
            <div className="border border-slate-200 rounded-xl p-4 text-xs text-slate-600 bg-slate-50/70 mb-6 max-h-48 overflow-y-auto leading-relaxed">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Contingency Consulting Terms & Conditions</h5>
              <p className="mb-2">
                1. <strong>Scope of Service:</strong> The Consultant agrees to provide R&D technical compliance advisory, Section 80-IAC evaluation, and DSIR Section 35(2AB) substantiation for <strong>{displayLegalName}</strong>.
              </p>
              <p className="mb-2">
                2. <strong>Success-Based Contingency Fee:</strong> 12% of the certified tax deduction / disbursed government innovation grant, payable strictly upon statutory realization. Applicable Indian GST (18%) shall be charged on all professional fees.
              </p>
              <p className="mb-2">
                3. <strong>Zero Upfront Financial Risk:</strong> If the Inter-Ministerial Board (IMB) or DSIR does not approve the certification or incentive claim, zero consulting fee is payable by the Client.
              </p>
              <p>
                4. <strong>Audit Confidentiality:</strong> Client statutory records, EPFO payroll files, and GSTR ledgers shall remain strictly confidential under applicable Indian data privacy regulations.
              </p>
            </div>

            {!otpSent ? (
              /* Step 2A: Request OTP */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Authorized Signatory Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sanket Nagathan"
                      className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Signatory Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Director / Managing Partner"
                      className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Official Signer Email (Nodemailer Verification)</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                  />
                  <span className="text-xs text-slate-400 mt-1 block">
                    A 6-digit cryptographic verification OTP will be dispatched to this email address via Nodemailer.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 text-sm"
                >
                  {loading ? 'Dispatching Verification OTP...' : 'Send Verification OTP via Email (Nodemailer)'}
                </button>
              </form>
            ) : (
              /* Step 2B: Enter OTP & Execute */
              <form onSubmit={handleVerifyAndExecute} className="space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                  <p>A verification email has been dispatched to <strong>{signerEmail}</strong>.</p>

                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Enter 6-Digit Verification OTP</label>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    placeholder="e.g. 123456"
                    className="w-full mt-1.5 p-3 border border-slate-300 rounded-lg font-mono text-center text-xl tracking-widest uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>

                <div className="flex items-start space-x-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-600 cursor-pointer select-none leading-relaxed">
                    I, <strong>{signerName || 'the authorized representative'}</strong>, as <strong>{designation || 'Director'}</strong> of <strong>{displayLegalName}</strong>, hereby authorize the execution of this Contingency Consulting Agreement and consent to statutory tax data verification under the Income-tax Act, 1961.
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-3 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Change Email / Resend
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 text-xs"
                  >
                    {loading ? 'Verifying OTP & Sealing...' : 'Verify OTP & Execute Agreement'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
