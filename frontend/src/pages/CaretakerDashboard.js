import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import api from '../api/axios';
import '../App.css';

function CaretakerDashboard() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setFetchLoading(true);
    try {
      const res = await api.get('/payments/?status=PENDING');
      setPendingPayments(res.data);
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAction = useCallback(async (action) => {
    if (!selectedPayment || loading) return;

    if (action === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);

    try {
      await api.patch(`/payments/${selectedPayment.id}/verify/`, {
        action,
        reason: action === 'reject' ? reason : undefined
      });

      setSelectedPayment(null);
      setReason('');
      await fetchPending();
    } catch (error) {
      alert(error.response?.data?.detail || `Failed to ${action} payment. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [selectedPayment, reason, loading]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedPayment) return;
      if (e.key === 'a' || e.key === 'A') {
        handleAction('approve');
      } else if (e.key === 'r' || e.key === 'R') {
        handleAction('reject');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPayment, handleAction]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const getOCRBadge = (ocrMatch) => {
    if (ocrMatch) {
      return <span className="status-badge status-match">✅ Match</span>;
    } else {
      return <span className="status-badge status-nomatch">⚠️ No Match</span>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-cyan-400/10 bg-gray-900/50">
        <div className="p-4 border-b border-cyan-400/10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-white">Pending Payments</h2>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-cyan-500 text-xs font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-400 text-xs">Total: {pendingPayments.length}</p>
        </div>

        {fetchLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading payments...</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-center px-4">No pending payments to verify</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {pendingPayments.map(payment => (
              <div
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className={`p-4 border-l-4 cursor-pointer transition-all ${
                  selectedPayment?.id === payment.id
                    ? 'border-l-cyan-500 bg-cyan-900/20'
                    : 'border-l-gray-700 hover:bg-gray-800/30'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-white">ID: {payment.id}</p>
                    <p className="text-sm text-gray-400">Ref: {payment.transaction_ref}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-cyan-400 font-medium">${payment.amount}</p>
                  {getOCRBadge(payment.ocr_match)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={50} minSize={30} className="overflow-hidden">
            <div className="h-full flex flex-col bg-gray-950 border-r border-cyan-400/10">
              <div className="p-4 border-b border-cyan-400/10">
                <h3 className="text-lg font-semibold text-white">Receipt Image</h3>
              </div>
              <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                {selectedPayment?.receipt_image ? (
                  <img
                    src={`http://127.0.0.1:8000${selectedPayment.receipt_image}`}
                    alt="receipt"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <p className="text-gray-400 text-center">Select a payment to view receipt</p>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="panel-resizer" />

          <Panel defaultSize={50} minSize={30} className="overflow-hidden">
            <div className="h-full flex flex-col bg-gray-950 overflow-auto">
              <div className="p-4 border-b border-cyan-400/10">
                <h3 className="text-lg font-semibold text-white">Verification Details</h3>
              </div>

              {selectedPayment ? (
                <div className="flex-1 flex flex-col p-4">
                  <div className="space-y-4 flex-1">
                    <div className="glass-card p-4">
                      <p className="text-gray-400 text-sm mb-1">Amount</p>
                      <p className="text-2xl font-bold text-cyan-400">${selectedPayment.amount}</p>
                    </div>

                    <div className="glass-card p-4">
                      <p className="text-gray-400 text-sm mb-1">Transaction Reference</p>
                      <p className="text-white font-mono">{selectedPayment.transaction_ref}</p>
                    </div>

                    <div className="glass-card p-4">
                      <p className="text-gray-400 text-sm mb-2">OCR Status</p>
                      {getOCRBadge(selectedPayment.ocr_match)}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rejection Reason {selectedPayment && <span className="text-gray-500">(required for reject)</span>}
                      </label>
                      <textarea
                        placeholder="Enter reason if rejecting..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="glass-input w-full resize-none focus:ring-2 focus:ring-cyan-500"
                        rows="4"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-cyan-400/10">
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={loading}
                      className="btn-cyan flex-1 disabled:opacity-50 disabled:cursor-not-allowed py-2"
                      title="Shortcut: Press 'A'"
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={loading}
                      className="btn-red-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed py-2"
                      title="Shortcut: Press 'R'"
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-gray-400 text-center">Select a payment from the list to review</p>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default CaretakerDashboard;
