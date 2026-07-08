import React, { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import api from '../api/axios';

function CaretakerDashboard() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const res = await api.get('/payments/?status=PENDING');
    setPendingPayments(res.data);
  };

  const handleAction = async (action) => {
    if (!selectedPayment) return;
    try {
      await api.patch(`/payments/${selectedPayment.id}/verify/`, { action, reason: action==='reject' ? reason : undefined });
      alert(`Payment ${action}d`);
      setSelectedPayment(null);
      fetchPending();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <div style={{ width: '300px', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
        <h3>Pending Payments</h3>
        {pendingPayments.map(p => (
          <div key={p.id} onClick={() => setSelectedPayment(p)} style={{ padding: '8px', cursor: 'pointer', background: selectedPayment?.id === p.id ? '#eee' : 'white' }}>
            ID: {p.id} - {p.amount} - {p.transaction_ref}
          </div>
        ))}
      </div>
      <PanelGroup direction="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={50} minSize={30}>
          <div style={{ padding: '10px', overflow: 'auto', height: '100%' }}>
            <h3>Receipt Image</h3>
            {selectedPayment?.receipt_image ? (
              <img src={`http://127.0.0.1:8000${selectedPayment.receipt_image}`} alt="receipt" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : (
              <p>Select a payment to view receipt</p>
            )}
          </div>
        </Panel>
        <PanelResizeHandle style={{ width: '5px', background: '#ccc' }} />
        <Panel defaultSize={50} minSize={30}>
          <div style={{ padding: '10px' }}>
            <h3>Verification</h3>
            {selectedPayment ? (
              <>
                <p><strong>Amount:</strong> {selectedPayment.amount}</p>
                <p><strong>Reference:</strong> {selectedPayment.transaction_ref}</p>
                {reason && <textarea placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} />}
                <button onClick={() => handleAction('approve')}>Approve</button>
                <button onClick={() => handleAction('reject')}>Reject</button>
              </>
            ) : (
              <p>No payment selected</p>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
export default CaretakerDashboard;