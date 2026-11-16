// client/src/views/SupportView.jsx
import React, { useState, useEffect } from 'react';
import { getSupportTickets, createSupportTicket } from '../services/dashboardService';

export default function SupportView() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'TAX_INCENTIVE_QUERY',
    priority: 'MEDIUM',
    description: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const resp = await getSupportTickets();
      if (resp?.data) {
        setTickets(resp.data);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSuccessMsg(null);

    try {
      const resp = await createSupportTicket(newTicket);
      setSuccessMsg('Support ticket successfully created. A compliance specialist will respond shortly.');
      setNewTicket({ subject: '', category: 'TAX_INCENTIVE_QUERY', priority: 'MEDIUM', description: '' });
      setShowNewModal(false);
      fetchTickets();
    } catch (err) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Compliance & Specialist Support</h2>
          <p className="text-slate-500 mt-1">
            Submit questions to our Indian R&D tax advisory specialists and track ticket resolution.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
        >
          + Create Support Ticket
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
          ✓ {successMsg}
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-600 flex justify-between">
          <span>Your Support Inquiries ({tickets.length})</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading support records...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-3xl block mb-2">💬</span>
            <p>No support tickets yet. Click "+ Create Support Ticket" above if you have any questions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className="p-4 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-500 font-bold">#{t.ticketId}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{t.subject}</h4>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-1 mt-1">{t.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Created on {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-slate-400 font-bold">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-xs text-slate-700 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <span className="font-mono text-slate-400 font-bold">Ticket #{selectedTicket.ticketId}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border mb-4">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Your Inquiry:</span>
              <p className="text-slate-800 mt-1 leading-relaxed">{selectedTicket.description}</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h4 className="font-bold uppercase text-slate-500 text-[10px]">Responses & Advisory Notes:</h4>
              {selectedTicket.responses?.map((r, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] text-emerald-900 font-bold mb-1">
                    <span>{r.sender}</span>
                    <span>{new Date(r.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-emerald-950 text-xs">{r.message}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-xs text-slate-700 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">New Support Inquiry</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clarification on Section 80-IAC Turnover Threshold"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    <option value="ELIGIBILITY">Eligibility Criteria</option>
                    <option value="ENGAGEMENT">Engagement & Agreement</option>
                    <option value="DOCUMENT_UPLOAD">Document Ingestion & Vault</option>
                    <option value="TAX_INCENTIVE_QUERY">Tax Law / Statutory Query</option>
                    <option value="TECHNICAL_SUPPORT">Technical Platform Issue</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Priority</label>
                  <select
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Detailed Description</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide context regarding your company's R&D activities or questions..."
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow disabled:opacity-50"
                >
                  {submitLoading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
