// client/src/views/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import DashboardOverviewView from './DashboardOverviewView';
import MyCompanyView from './MyCompanyView';
import IncentiveTrackingView from './IncentiveTrackingView';
import NotificationsView from './NotificationsView';
import SupportView from './SupportView';
import AccountSettingsView from './AccountSettingsView';
import IndiaEligibilityScreenerView from './IndiaEligibilityScreenerView';
import IndiaEngagementSignView from './IndiaEngagementSignView';
import IndiaDataIngestionView from './IndiaDataIngestionView';
import { getDashboardSummary } from '../services/dashboardService';

export default function DashboardLayout({ user, company: initialCompany, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [company, setCompany] = useState(initialCompany);
  const [assessment, setAssessment] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchSummary = async () => {
    try {
      const resp = await getDashboardSummary();
      if (resp?.data) {
        setSummary(resp.data);
        if (resp.data.company) setCompany(resp.data.company);
        if (resp.data.latestAssessment) setAssessment(resp.data.latestAssessment);
        if (resp.data.latestEngagement) setEngagement(resp.data.latestEngagement);
        const unread = resp.data.recentNotifications?.filter(n => !n.read).length || 0;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleScreeningComplete = ({ company: screenedCompany, assessment: screenedAssessment }) => {
    setCompany(screenedCompany);
    setAssessment(screenedAssessment);
    fetchSummary();
    setActiveTab('engagement');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEngagementExecuted = (executedEngagement) => {
    setEngagement(executedEngagement);
    fetchSummary();
  };

  const handleContinueToIngestion = () => {
    setActiveTab('vault');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'company', label: 'My Company', icon: '🏢' },
    { id: 'screener', label: 'Eligibility Assessment', icon: '📋', badge: assessment ? '✓ Evaluated' : 'Module 1' },
    { id: 'engagement', label: 'Engagement & E-Sign', icon: '✍️', badge: engagement?.agreementStatus === 'EXECUTED' ? '✓ Executed' : 'Module 2' },
    { id: 'vault', label: 'Document Vault', icon: '📂', badge: 'Module 3' },
    { id: 'incentives', label: 'Incentive Tracking', icon: '🎯' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', count: unreadCount },
    { id: 'support', label: 'Support & Advisory', icon: '💬' },
    { id: 'settings', label: 'Account Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* SaaS Top Header */}
      <header className="bg-slate-950 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              ☰
            </button>

            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow text-slate-950 font-black text-sm">
                IN
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block leading-none">
                  TaxIncentive.in
                </span>
                <span className="text-[10px] text-slate-400">Enterprise Client Portal</span>
              </div>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {company?.legalName && (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400">Entity:</span>
                <span className="text-emerald-400 font-bold max-w-[180px] truncate">{company.legalName}</span>
                {company.pan && <span className="font-mono text-slate-400">({company.pan})</span>}
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Notifications"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-bold text-white truncate max-w-[120px]">{user?.name}</div>
                <div className="text-[10px] text-slate-400">{user?.designation || 'Signatory'}</div>
              </div>
              <button
                onClick={onLogout}
                className="ml-2 text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main SaaS Workspace with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 pt-16 lg:pt-0 lg:static lg:block transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Workspace Modules
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    activeTab === item.id ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count > 0 && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-6 border-t border-slate-800 mt-6 px-3">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-bold block mb-1">Income-tax Act, 1961</span>
                Sec 80-IAC, Sec 35(2AB), Sec 115BBF & DSIR Compliance Engine.
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          ></div>
        )}

        {/* Right Main Content Stage */}
        <main className="flex-1 p-4 sm:p-8 min-w-0">
          {activeTab === 'overview' && (
            <DashboardOverviewView
              summary={summary}
              company={company}
              user={user}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'company' && (
            <MyCompanyView
              company={company}
              onCompanyUpdated={(updated) => {
                setCompany(updated);
                fetchSummary();
              }}
            />
          )}

          {/* Module 1: Eligibility Screener */}
          {activeTab === 'screener' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Module 1: Statutory Eligibility Assessment</h2>
                  <p className="text-xs text-slate-500">Run or update your startup's tax qualification assessment.</p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  ← Back to Overview
                </button>
              </div>

              <IndiaEligibilityScreenerView
                initialCompany={company}
                onContinueToEngagement={handleScreeningComplete}
              />
            </div>
          )}

          {/* Module 2: Engagement & E-Sign */}
          {activeTab === 'engagement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Module 2: Engagement Letter & E-Sign</h2>
                  <p className="text-xs text-slate-500">Review transparent 12% contingency terms and sign with Nodemailer OTP.</p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  ← Back to Overview
                </button>
              </div>

              <IndiaEngagementSignView
                company={company}
                assessment={assessment}
                existingEngagement={engagement}
                onEngagementExecuted={handleEngagementExecuted}
                onContinueToIngestion={handleContinueToIngestion}
                onBack={() => setActiveTab('screener')}
              />
            </div>
          )}

          {/* Module 3: Document Vault & Ingestion */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Module 3: Compliance Data Ingestion Vault</h2>
                  <p className="text-xs text-slate-500">Upload EPFO ECR payroll, GSTR-3B filings, and TDS records for extraction.</p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  ← Back to Overview
                </button>
              </div>

              <IndiaDataIngestionView
                company={company}
                assessment={assessment}
                engagement={engagement}
                onBack={() => setActiveTab('engagement')}
              />
            </div>
          )}

          {activeTab === 'incentives' && (
            <IncentiveTrackingView
              summary={summary}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'support' && (
            <SupportView />
          )}

          {activeTab === 'settings' && (
            <AccountSettingsView user={user} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <p>TaxIncentive.in • Indian R&D Tax Incentive & Government Innovation Grant SaaS Platform</p>
      </footer>
    </div>
  );
}
