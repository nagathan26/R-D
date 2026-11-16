// client/src/views/CustomerRegisterView.jsx
import React, { useState } from 'react';
import { registerCustomer } from '../services/authService';

export default function CustomerRegisterView({ onRegisterSuccess, onNavigateLogin, onNavigateLanding }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyLegalName: '',
    companyPan: '',
    gstin: '',
    designation: 'Director / Founder'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.companyPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.companyPan.toUpperCase())) {
      setError('Invalid Indian PAN format. Must be 10 characters (e.g. ABCDE1234F).');
      return;
    }

    setLoading(true);

    try {
      const response = await registerCustomer({
        ...formData,
        companyPan: formData.companyPan.toUpperCase().trim(),
        gstin: formData.gstin ? formData.gstin.toUpperCase().trim() : undefined
      });

      const { token, user, company } = response;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccessMessage('Account registered successfully! Loading your personal dashboard...');
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess({ user, company, token });
      }, 800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition mb-6 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800"
        >
          <span>← Back to Home</span>
        </button>

        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
            IN
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">TaxIncentive.in</span>
        </div>
        <h2 className="mt-3 text-2xl font-black text-white">Register Your Enterprise Account</h2>
        <p className="mt-1 text-xs text-slate-400">
          Set up your workspace to assess Section 80-IAC, DSIR Section 35(2AB), and innovation grants.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
              <span className="text-base">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Section 1: Authorized Signatory Details */}
            <div className="border-b border-slate-800 pb-3 mb-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                1. Authorized Representative Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanket Nagathan"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Official Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="founder@company.com"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Mobile Number (+91)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  pattern="[0-9]{10}"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Corporate Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Director / CFO / Founder"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
            </div>

            {/* Section 2: Company Details */}
            <div className="border-b border-slate-800 pt-3 pb-3 mb-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                2. Company Profile
              </h3>
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-400 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sanket AI Technologies Private Limited"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.companyLegalName}
                onChange={(e) => setFormData({ ...formData, companyLegalName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">
                  Company PAN <span className="text-slate-500 lowercase">(10 chars)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  maxLength="10"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 uppercase font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.companyPan}
                  onChange={(e) => setFormData({ ...formData, companyPan: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">
                  GSTIN <span className="text-slate-500 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  maxLength="15"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 uppercase font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            {/* Section 3: Password & Security */}
            <div className="border-b border-slate-800 pt-3 pb-3 mb-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                3. Security Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type password"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Creating Secure Enterprise Account...</span>
                ) : (
                  <span>Create Account & Enter Dashboard →</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an enterprise account?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-emerald-400 hover:underline font-bold"
              >
                Sign In to Dashboard
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
