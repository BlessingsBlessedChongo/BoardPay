import React, { useState } from 'react';
import api from '../api/axios.js';

export default function StudentDashboard() {
  const [form, setForm] = useState({
    lease: '',
    amount: '',
    transaction_ref: '',
    receipt_image: null,
  });
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg: string }
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'receipt_image') {
      setForm((f) => ({ ...f, receipt_image: files[0] }));
      setFileName(files[0]?.name || '');
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.append('lease', form.lease);
      data.append('amount', form.amount);
      data.append('transaction_ref', form.transaction_ref);
      if (form.receipt_image) data.append('receipt_image', form.receipt_image);

      await api.post('/payments/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus({ type: 'success', msg: 'Payment submitted successfully! Your caretaker will verify it shortly.' });
      setForm({ lease: '', amount: '', transaction_ref: '', receipt_image: null });
      setFileName('');
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data || err?.message || 'Submission failed.';
      setStatus({ type: 'error', msg: typeof detail === 'string' ? detail : JSON.stringify(detail) });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-brand-accent font-bold text-xl tracking-tighter">BoardPay</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Student Portal</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="glass-card w-full max-w-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Submit Rent Payment</h2>
          <p className="text-gray-400 text-sm mb-7">
            Upload your payment proof and we'll match it automatically.
          </p>

          {/* Status banner */}
          {status && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
                status.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Lease ID
              </label>
              <input
                type="number"
                name="lease"
                className="input-dark"
                placeholder="e.g. 42"
                value={form.lease}
                onChange={handleChange}
                required
                disabled={loading}
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Amount (ZMW)
              </label>
              <input
                type="number"
                name="amount"
                className="input-dark"
                placeholder="e.g. 1500.00"
                value={form.amount}
                onChange={handleChange}
                required
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Transaction Reference
              </label>
              <input
                type="text"
                name="transaction_ref"
                className="input-dark"
                placeholder="e.g. BP20240701ABC"
                value={form.transaction_ref}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Receipt Image
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-400 group-hover:border-brand-accent/50 transition-colors truncate">
                  {fileName || 'Choose file…'}
                </div>
                <span className="btn-cyan text-sm px-4 py-2.5 shrink-0">Browse</span>
                <input
                  type="file"
                  name="receipt_image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyan w-full mt-2"
            >
              {loading ? 'Submitting…' : 'Submit Payment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
