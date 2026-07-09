import React, { useState, useEffect, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import api from '../api/axios.js';

const API_ROOT = 'http://127.0.0.1:8000';

function OcrBadge({ match }) {
  return match ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 border border-green-500/30 text-green-400">
      ✅ Matched
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
      ⚠️ Unmatched
    </span>
  );
}

export default function CaretakerDashboard() {
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPayments = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/payments/?status=PENDING');
      setPayments(res.data?.results ?? res.data ?? []);
    } catch {
      showToast('Failed to load payments.', 'error');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (!selected || actionLoading) return;
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'a') handleAction('approve');
      if (e.key === 'r') handleAction('reject');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, reason, actionLoading]);

  const handleAction = async (action) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const body = { action };
      if (action === 'reject') body.reason = reason;
      await api.patch(`/payments/${selected.id}/verify/`, body);
      showToast(action === 'approve' ? 'Payment approved ✓' : 'Payment rejected.', 'success');
      setSelected(null);
      setReason('');
      await fetchPayments();
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
        <span className="text-brand-accent font-bold text-xl tracking-tighter">BoardPay</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Caretaker Portal</span>
          <kbd className="hidden sm:inline text-gray-600 text-xs border border-gray-700 rounded px-1.5 py-0.5">A</kbd>
          <span className="hidden sm:inline text-gray-600 text-xs">approve</span>
          <kbd className="hidden sm:inline text-gray-600 text-xs border border-gray-700 rounded px-1.5 py-0.5">R</kbd>
          <span className="hidden sm:inline text-gray-600 text-xs">reject</span>
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-2">
            Sign out
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-xl border ${
          toast.type === 'error'
            ? 'bg-red-900/90 border-red-500/40 text-red-200'
            : 'bg-green-900/90 border-green-500/40 text-green-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Body: sidebar + panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Pending Payments
              {!loadingList && (
                <span className="ml-2 bg-brand-accent/20 text-brand-accent text-xs px-2 py-0.5 rounded-full">
                  {payments.length}
                </span>
              )}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-sm">
                <span className="text-3xl mb-2">🎉</span>
                No pending payments
              </div>
            ) : (
              <ul>
                {payments.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => { setSelected(p); setReason(''); }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-800/60 transition-all hover:bg-gray-800/50 ${
                        selected?.id === p.id
                          ? 'border-l-2 border-l-brand-accent bg-cyan-900/20'
                          : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">#{p.id}</span>
                        <OcrBadge match={p.ocr_match} />
                      </div>
                      <p className="text-gray-400 text-xs truncate">Ref: {p.transaction_ref}</p>
                      <p className="text-brand-accent text-xs font-semibold mt-0.5">
                        ZMW {Number(p.amount).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Right: resizable panels */}
        {selected ? (
          <PanelGroup direction="horizontal" className="flex-1">
            {/* Receipt image */}
            <Panel defaultSize={55} minSize={30}>
              <div className="h-full flex flex-col bg-gray-950 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Receipt Image</h3>
                <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  {selected.receipt_image ? (
                    <img
                      src={`${API_ROOT}${selected.receipt_image}`}
                      alt="Receipt"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">No image uploaded</p>
                  )}
                </div>
              </div>
            </Panel>

            {/* Resize handle */}
            <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-brand-accent/40 transition-colors cursor-col-resize" />

            {/* Verification details */}
            <Panel defaultSize={45} minSize={30}>
              <div className="h-full flex flex-col bg-gray-950 p-4 overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Verification Details
                </h3>

                <div className="glass-card p-4 space-y-3 mb-4">
                  <Row label="Payment ID" value={`#${selected.id}`} />
                  <Row label="Amount" value={`ZMW ${Number(selected.amount).toLocaleString()}`} accent />
                  <Row label="Transaction Ref" value={selected.transaction_ref} mono />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">OCR Match</span>
                    <OcrBadge match={selected.ocr_match} />
                  </div>
                  {selected.lease && <Row label="Lease ID" value={selected.lease} />}
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Rejection Reason (required if rejecting)
                  </label>
                  <textarea
                    rows={3}
                    className="input-dark resize-none"
                    placeholder="Enter reason for rejection…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="btn-cyan flex-1"
                  >
                    {actionLoading ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading || !reason.trim()}
                    className="btn-ghost-red flex-1"
                  >
                    {actionLoading ? '…' : 'Reject'}
                  </button>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
            <div className="text-5xl">👆</div>
            <p className="text-gray-400 text-sm max-w-xs">
              Select a pending payment from the list to review the receipt and take action.
            </p>
            <p className="text-gray-600 text-xs">
              Keyboard: <kbd className="border border-gray-700 rounded px-1">A</kbd> approve · <kbd className="border border-gray-700 rounded px-1">R</kbd> reject
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, accent, mono }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`${accent ? 'text-brand-accent font-semibold' : 'text-white'} ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
