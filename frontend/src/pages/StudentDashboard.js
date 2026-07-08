import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function StudentDashboard() {
  const [leaseId, setLeaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!leaseId || !amount || !reference || !receiptImage) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('lease', leaseId);
      formData.append('amount', amount);
      formData.append('transaction_ref', reference);
      formData.append('receipt_image', receiptImage);

      await api.post('/payments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Payment submitted successfully!');
      setMessageType('success');
      setLeaseId('');
      setAmount('');
      setReference('');
      setReceiptImage(null);
      document.getElementById('fileInput').value = '';

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to submit payment. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Submit Rent Payment</h1>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-cyan-500 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md text-sm ${
            messageType === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lease ID</label>
            <input
              type="number"
              placeholder="Enter lease ID"
              value={leaseId}
              onChange={(e) => setLeaseId(e.target.value)}
              className="glass-input w-full"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              placeholder="Enter amount"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="glass-input w-full"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Reference</label>
            <input
              type="text"
              placeholder="Enter reference number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="glass-input w-full"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Receipt Image</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 transition-colors"
              required
              disabled={loading}
            />
            {receiptImage && (
              <p className="mt-2 text-sm text-cyan-400">File selected: {receiptImage.name}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cyan w-full font-semibold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentDashboard;
