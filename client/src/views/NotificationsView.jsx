// client/src/views/NotificationsView.jsx
import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../services/dashboardService';

export default function NotificationsView({ onNavigateTab }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const resp = await getNotifications();
      if (resp?.data) {
        setNotifications(resp.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markNotificationRead('all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (err) {
        // ignore
      }
    }

    if (notif.link) {
      if (notif.link.includes('screener') || notif.link.includes('assessment')) onNavigateTab('screener');
      else if (notif.link.includes('engagement') || notif.link.includes('agreement')) onNavigateTab('engagement');
      else if (notif.link.includes('vault') || notif.link.includes('document')) onNavigateTab('vault');
      else if (notif.link.includes('support')) onNavigateTab('support');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">System & Audit Notifications</h2>
          <p className="text-slate-300 text-xs mt-1">Real-time alerts regarding statutory milestones and compliance reviews.</p>
        </div>

        <button
          onClick={handleMarkAll}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl font-semibold transition"
        >
          Mark All as Read
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-3xl block mb-2">🔔</span>
            <p>You have no notifications yet. All statutory updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleItemClick(n)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  !n.read
                    ? 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                    !n.read ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {n.type === 'ASSESSMENT' && '📊'}
                    {n.type === 'ENGAGEMENT' && '✍️'}
                    {n.type === 'DOCUMENT' && '📂'}
                    {n.type === 'SUPPORT' && '💬'}
                    {n.type === 'SYSTEM' && '⚡'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(n.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-emerald-600 font-bold hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
