// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import PublicLandingView from './views/PublicLandingView';
import CustomerLoginView from './views/CustomerLoginView';
import CustomerRegisterView from './views/CustomerRegisterView';
import DashboardLayout from './views/DashboardLayout';
import { getCurrentUser, logoutCustomer } from './services/authService';

export default function App() {
  const [currentView, setCurrentView] = useState('LANDING'); // 'LANDING' | 'LOGIN' | 'REGISTER' | 'DASHBOARD'
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize and check persistent session
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const resp = await getCurrentUser();
          if (resp?.data?.user) {
            setUser(resp.data.user);
            setCompany(resp.data.company);
            setCurrentView('DASHBOARD');
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentView('LANDING');
          }
        } catch (err) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentView('LANDING');
        }
      } else {
        setCurrentView('LANDING');
      }
      setInitializing(false);
    };

    checkSession();
  }, []);

  const handleLoginSuccess = ({ user: loggedInUser, company: userCompany }) => {
    setUser(loggedInUser);
    setCompany(userCompany);
    setCurrentView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = ({ user: registeredUser, company: newCompany }) => {
    setUser(registeredUser);
    setCompany(newCompany);
    setCurrentView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutCustomer();
    setUser(null);
    setCompany(null);
    setCurrentView('LANDING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-xl text-slate-950 animate-pulse shadow-xl shadow-emerald-500/20 mb-4">
          IN
        </div>
        <div className="text-sm font-bold text-slate-300">Initializing TaxIncentive.in Enterprise SaaS...</div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'LANDING' && (
        <PublicLandingView
          onNavigateLogin={() => {
            setCurrentView('LOGIN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateRegister={() => {
            setCurrentView('REGISTER');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentView === 'LOGIN' && (
        <CustomerLoginView
          onLoginSuccess={handleLoginSuccess}
          onNavigateRegister={() => {
            setCurrentView('REGISTER');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateLanding={() => {
            setCurrentView('LANDING');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentView === 'REGISTER' && (
        <CustomerRegisterView
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateLogin={() => {
            setCurrentView('LOGIN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateLanding={() => {
            setCurrentView('LANDING');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentView === 'DASHBOARD' && (
        <DashboardLayout
          user={user}
          company={company}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
