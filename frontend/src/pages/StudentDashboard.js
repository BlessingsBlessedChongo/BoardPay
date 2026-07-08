import React, { useState } from 'react';
import api from '../api/axios';

function StudentDashboard() {
  const [leaseId, setLeaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('lease', leaseId);
    formData.append('amount', amount);
    formData.append('transaction_ref', ref);
    formData.append('receipt_image', file);
    try {
      await api.post('/payments/', formData);
      alert('Payment submitted for verification!');
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="number" placeholder="Lease ID" value={leaseId} onChange={(e) => setLeaseId(e.target.value)} required />
      <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <input type="text" placeholder="Transaction Reference" value={ref} onChange={(e) => setRef(e.target.value)} required />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
      <button type="submit">Submit Payment</button>
    </form>
  );
}
export default StudentDashboard;