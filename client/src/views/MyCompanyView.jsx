// client/src/views/MyCompanyView.jsx
import React, { useState } from 'react';
import { updateCompanyProfile } from '../services/dashboardService';

export default function MyCompanyView({ company, onCompanyUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    legalName: company?.legalName || '',
    gstin: company?.gstin || '',
    headcount: company?.headcount || 1,
    industrySector: company?.industrySector || 'Software/SaaS & AI',
    incorporationDate: company?.incorporationDate ? new Date(company.incorporationDate).toISOString().split('T')[0] : '',
    contactPhone: company?.contactPhone || '',
    isDpiitRecognized: company?.dpiitDetails?.isRecognized || false,
    dpiitCertificateNumber: company?.dpiitDetails?.certificateNumber || '',
    hasRegisteredIndianPatents: company?.hasRegisteredIndianPatents || false,
    hasDsirApprovedLab: company?.hasDsirApprovedLab || false,
    caName: company?.charteredAccountant?.caName || '',
    caMembershipNumber: company?.charteredAccountant?.membershipNumber || '',
    caFirmName: company?.charteredAccountant?.firmName || '',
    caEmail: company?.charteredAccountant?.caEmail || ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [revealPan, setRevealPan] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const resp = await updateCompanyProfile({
        legalName: formData.legalName,
        gstin: formData.gstin ? formData.gstin.toUpperCase().trim() : undefined,
        headcount: Number(formData.headcount),
        industrySector: formData.industrySector,
        incorporationDate: formData.incorporationDate,
        contactPhone: formData.contactPhone,
        dpiitDetails: {
          isRecognized: Boolean(formData.isDpiitRecognized),
          certificateNumber: formData.dpiitCertificateNumber
        },
        hasRegisteredIndianPatents: Boolean(formData.hasRegisteredIndianPatents),
        hasDsirApprovedLab: Boolean(formData.hasDsirApprovedLab),
        charteredAccountant: {
          caName: formData.caName,
          membershipNumber: formData.caMembershipNumber,
          firmName: formData.caFirmName,
          caEmail: formData.caEmail
        }
      });

      setMessage('Company profile successfully updated.');
      setIsEditing(false);
      if (onCompanyUpdated) onCompanyUpdated(resp.data);
    } catch (err) {
      setError(err.message || 'Failed to update company profile.');
    } finally {
      setLoading(false);
    }
  };

  const maskedPan = company?.pan
    ? `${company.pan.substring(0, 3)}****${company.pan.substring(7)}`
    : 'Not Recorded';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1">
            <span>Corporate Entity Profile</span>
            <span>•</span>
            <span className="font-mono text-slate-300">ID: {company?.companyId}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{company?.legalName || 'Company Profile'}</h2>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow text-xs transition"
            >
              Edit Profile Details
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2">
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!isEditing ? (
          /* Read-Only Profile View */
          <div className="space-y-6">
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 border-b pb-2 mb-3">
                1. Statutory Identification & Tax Registrations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Company Legal Name</span>
                  <span className="font-bold text-slate-900 text-sm">{company?.legalName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Company PAN</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {revealPan ? company?.pan : maskedPan}
                    </span>
                    <button
                      onClick={() => setRevealPan(!revealPan)}
                      className="text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      {revealPan ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">GSTIN</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {company?.gstin || 'Not Registered'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Date of Incorporation</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {company?.incorporationDate
                      ? new Date(company.incorporationDate).toLocaleDateString('en-IN')
                      : 'Not Recorded'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 border-b pb-2 mb-3">
                2. Operational & Statutory Recognition
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Industry Sector</span>
                  <span className="font-bold text-slate-900 text-sm">{company?.industrySector}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Full-Time Headcount</span>
                  <span className="font-bold text-slate-900 text-sm">{company?.headcount || 1} employees</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">DPIIT Startup Recognition</span>
                  <span className={`font-bold text-xs ${company?.dpiitDetails?.isRecognized ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {company?.dpiitDetails?.isRecognized ? `✓ Recognized (${company.dpiitDetails.certificateNumber || 'DPIIT'})` : 'Not Recognized'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Indian Patents / DSIR Lab</span>
                  <span className="font-bold text-xs text-slate-900">
                    {company?.hasRegisteredIndianPatents ? 'Patents Filed' : 'No Patents'} • {company?.hasDsirApprovedLab ? 'DSIR Lab Approved' : 'No DSIR Lab'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 border-b pb-2 mb-3">
                3. Partner Chartered Accountant Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">CA Full Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {company?.charteredAccountant?.caName || 'Not Assigned'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">ICAI Membership #</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {company?.charteredAccountant?.membershipNumber || '—'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">CA Firm Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {company?.charteredAccountant?.firmName || '—'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Official CA Email</span>
                  <span className="font-mono text-slate-900 text-sm">
                    {company?.charteredAccountant?.caEmail || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Editable Profile Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">GSTIN</label>
                <input
                  type="text"
                  maxLength="15"
                  className="w-full p-2.5 border border-slate-300 rounded-lg uppercase font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Industry Sector</label>
                <select
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
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
                <label className="block font-bold uppercase text-slate-600 mb-1">Headcount</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.headcount}
                  onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Incorporation Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.incorporationDate}
                  onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDpiitRecognized}
                  onChange={(e) => setFormData({ ...formData, isDpiitRecognized: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium">DPIIT Startup Recognized</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasRegisteredIndianPatents}
                  onChange={(e) => setFormData({ ...formData, hasRegisteredIndianPatents: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium">Indian Patent Filed / Granted</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasDsirApprovedLab}
                  onChange={(e) => setFormData({ ...formData, hasDsirApprovedLab: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium">DSIR Approved In-House R&D Facility</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="font-bold uppercase text-slate-600 mb-2">Chartered Accountant Details (Optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="CA Name"
                  className="p-2 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  value={formData.caName}
                  onChange={(e) => setFormData({ ...formData, caName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Membership Number"
                  className="p-2 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  value={formData.caMembershipNumber}
                  onChange={(e) => setFormData({ ...formData, caMembershipNumber: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="CA Firm Name"
                  className="p-2 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  value={formData.caFirmName}
                  onChange={(e) => setFormData({ ...formData, caFirmName: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="CA Email"
                  className="p-2 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  value={formData.caEmail}
                  onChange={(e) => setFormData({ ...formData, caEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow disabled:opacity-50"
              >
                {loading ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
