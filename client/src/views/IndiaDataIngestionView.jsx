// client/src/views/IndiaDataIngestionView.jsx
import React, { useState, useEffect } from 'react';
import { getIncentiveChecklist, uploadAndValidateDocIndia, reviewExtractedDocument } from '../services/ingestionService';

export default function IndiaDataIngestionView({
  company,
  assessment,
  engagement,
  onBack
}) {
  const [checklistData, setChecklistData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('EPFO_ECR_PAYROLL');
  const [uploadPayload, setUploadPayload] = useState({
    declaredTurnoverInr: assessment?.financialMetrics?.annualTurnoverInr || '',
    declaredPayrollInr: assessment?.financialMetrics?.annualRndPayrollInr || '',
    declaredHeadcount: company?.headcount || '',
    contractorSpendInr: assessment?.financialMetrics?.annualRndContractorSpendInr || '',
    patentTitle: '',
    applicationNumber: '',
    cbrNumber: '',
    dpiitNumber: company?.dpiitDetails?.certificateNumber || ''
  });
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const isExecuted = engagement?.agreementStatus === 'EXECUTED';
  const engagementId = engagement?.engagementId || engagement?._id;

  // Fetch dynamic checklist on mount or when engagement updates
  const fetchChecklist = async () => {
    if (!engagementId) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await getIncentiveChecklist(engagementId);
      if (resp?.data) {
        setChecklistData(resp.data);
        if (resp.data.uploadedRecords) {
          setUploadedRecords(resp.data.uploadedRecords);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExecuted && engagementId) {
      fetchChecklist();
    }
  }, [isExecuted, engagementId]);

  // Handle document ingestion
  const handleUploadAndValidate = async (e) => {
    e.preventDefault();
    if (!engagementId) {
      setError('Engagement ID not found. Please complete Step 2.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const headers = selectedCategory === 'EPFO_ECR_PAYROLL'
        ? ['uan', 'member_name', 'gross_wages', 'epf_wages']
        : ['gstin', 'tax_period', 'turnover_taxable_value'];

      const resp = await uploadAndValidateDocIndia({
        engagementId,
        documentCategory: selectedCategory,
        originalFilename: `${selectedCategory.toLowerCase()}_${Date.now()}.pdf`,
        headers,
        ...uploadPayload
      });

      setSuccessMsg(resp.message || 'Document ingested and validated successfully.');
      await fetchChecklist();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Human Auditor Review / Approval
  const handleApproveRecord = async (recordId) => {
    try {
      setLoading(true);
      await reviewExtractedDocument(recordId, {
        validationStatus: 'VALIDATED',
        reviewerNotes: reviewerNotes || 'Verified against statutory filing records by Tax Consultant.'
      });
      setReviewingId(null);
      setReviewerNotes('');
      await fetchChecklist();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If engagement is not executed, display the strict statutory gate screen
  if (!isExecuted) {
    return (
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto text-3xl mb-4 font-bold shadow-sm">
          🔒
        </div>
        <h2 className="text-xl font-bold text-slate-900">Step 3 Locked: Engagement Not Executed</h2>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Under Indian statutory compliance procedures, sensitive payroll (EPFO), tax (GSTR-3B), and contractor TDS (Form 26AS) data cannot be ingested without a legally executed Contingency Consulting Agreement.
        </p>
        <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 inline-block text-xs font-mono text-slate-700">
          Agreement Status: <span className="font-bold text-amber-600">{engagement?.agreementStatus || 'DRAFT / NOT STARTED'}</span>
        </div>
        <div className="mt-6">
          <button
            onClick={onBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow flex items-center space-x-2 mx-auto text-xs"
          >
            <span>← Return to Step 2: Complete E-Sign & OTP Verification</span>
          </button>
        </div>
      </div>
    );
  }

  const checklist = checklistData?.checklist || [];
  const targetIncentives = checklistData?.targetIncentives || assessment?.targetIncentives || ['SECTION_80_IAC', 'SECTION_35_2AB_DSIR'];

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
      {/* Step Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📑</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Step 3 of 3
                </span>
                <span className="text-xs text-slate-400">• Statutory Document Vault</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Indian Compliance Data Ingestion</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800"
              >
                ← Back to Agreement
              </button>
            )}
            <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-300 font-mono">
              Executed: {engagementId}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Checklist Tailored to Qualified Incentives */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Incentive-Specific Document Checklist</h3>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
              Qualified Scope: {targetIncentives.join(' • ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCategory(item.documentCategory)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedCategory === item.documentCategory
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">{item.statutoryScheme}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.title}</h4>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    item.status === 'UPLOADED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.mandatory ? 'Mandatory for Claim' : 'Supporting Audit File'}</span>
                  <span className="text-emerald-600 font-bold">Select Document →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Upload & Extraction Form */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/80 mb-8">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Ingest & Verify Compliance Document</h3>
          <p className="text-xs text-slate-500 mb-4">
            Submit statutory filings for automated OCR classification and rule verification.
          </p>

          <form onSubmit={handleUploadAndValidate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Document Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="EPFO_ECR_PAYROLL">EPFO ECR Monthly Challan (PF / Wages)</option>
                  <option value="GSTR_3B_TURNOVER">GSTR-3B Monthly Return (Turnover Proof)</option>
                  <option value="FORM_26AS_CONTRACTOR_TDS">Form 26AS / AIS (Section 194J Technical TDS)</option>
                  <option value="PATENT_CBR_RECEIPT">Patent Office CBR Filing Receipt</option>
                  <option value="DPIIT_CERTIFICATE">DPIIT Startup Recognition Certificate</option>
                </select>
              </div>

              {selectedCategory === 'EPFO_ECR_PAYROLL' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">In-House R&D Headcount</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 25"
                      className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      value={uploadPayload.declaredHeadcount}
                      onChange={(e) => setUploadPayload({ ...uploadPayload, declaredHeadcount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Annual In-House R&D Wages (INR ₹)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 6500000"
                      className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      value={uploadPayload.declaredPayrollInr}
                      onChange={(e) => setUploadPayload({ ...uploadPayload, declaredPayrollInr: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {selectedCategory === 'GSTR_3B_TURNOVER' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Declared Annual Turnover (INR ₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15000000"
                    className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    value={uploadPayload.declaredTurnoverInr}
                    onChange={(e) => setUploadPayload({ ...uploadPayload, declaredTurnoverInr: Number(e.target.value) })}
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Statutory cap: ₹100 Crore for Section 80-IAC eligibility.</span>
                </div>
              )}

              {selectedCategory === 'FORM_26AS_CONTRACTOR_TDS' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">External Technical Contractor Spend (INR ₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000000"
                    className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    value={uploadPayload.contractorSpendInr}
                    onChange={(e) => setUploadPayload({ ...uploadPayload, contractorSpendInr: Number(e.target.value) })}
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Subject to 10% Section 194J TDS under Income-tax Act.</span>
                </div>
              )}

              {selectedCategory === 'PATENT_CBR_RECEIPT' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Patent Application Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 202441012345"
                      className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={uploadPayload.applicationNumber}
                      onChange={(e) => setUploadPayload({ ...uploadPayload, applicationNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">CBR Number</label>
                    <input
                      type="text"
                      placeholder="e.g. CBR-IPO-88219"
                      className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={uploadPayload.cbrNumber}
                      onChange={(e) => setUploadPayload({ ...uploadPayload, cbrNumber: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedCategory === 'DPIIT_CERTIFICATE' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">DPIIT Recognition Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DIPP88123"
                    className="w-full mt-1.5 p-2.5 border border-slate-300 rounded-lg bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                    value={uploadPayload.dpiitNumber}
                    onChange={(e) => setUploadPayload({ ...uploadPayload, dpiitNumber: e.target.value })}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 text-xs"
            >
              {loading ? 'Classifying & Extracting Document...' : 'Ingest, Classify & Verify Document'}
            </button>
          </form>
        </div>

        {/* Extracted Compliance Data & Review Panel */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Extracted Records & Statutory Verification</h3>

          {uploadedRecords.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
              No compliance documents ingested yet. Select a document category above to ingest.
            </div>
          ) : (
            <div className="space-y-4">
              {uploadedRecords.map((rec) => (
                <div key={rec._id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">{rec.documentCategory}</span>
                      <h4 className="text-xs font-bold text-slate-800">{rec.originalFilename}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rec.validationStatus === 'VALIDATED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.validationStatus === 'DEFICIENT_DATA'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.validationStatus}
                      </span>
                      {rec.humanReviewed && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Auditor Approved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Extracted Key-Values */}
                  <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700 font-sans">
                    {Object.entries(rec.extractedData || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-slate-100 py-0.5 text-[11px]">
                        <span className="font-semibold text-slate-600">{key}:</span>
                        <span className="font-mono text-slate-900">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    ))}
                  </div>

                  {rec.auditFlags?.length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                      <strong>Audit Flags:</strong>
                      <ul className="list-disc pl-4 mt-1">
                        {rec.auditFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Human Review Actions */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[10px]">Vault Key: {rec.storageKey}</span>
                    {!rec.humanReviewed ? (
                      reviewingId === rec._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Auditor notes..."
                            value={reviewerNotes}
                            onChange={(e) => setReviewerNotes(e.target.value)}
                            className="p-1 border rounded text-xs outline-none"
                          />
                          <button
                            onClick={() => handleApproveRecord(rec._id)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded font-bold hover:bg-emerald-700 text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setReviewingId(null)}
                            className="text-slate-500 hover:text-slate-700 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(rec._id)}
                          className="text-emerald-700 hover:text-emerald-800 font-bold underline text-xs"
                        >
                          Review & Approve Extraction
                        </button>
                      )
                    ) : (
                      <span className="text-emerald-700 text-xs font-semibold">
                        ✓ {rec.reviewerNotes || 'Approved'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
