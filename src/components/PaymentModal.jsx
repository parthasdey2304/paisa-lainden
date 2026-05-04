import React, { useState, useContext } from 'react';
import { StudentContext } from '../context/StudentContext';
import ConfirmModal from './ConfirmModal';

const PaymentModal = ({ isOpen, onClose, student }) => {
  const { addPayment, deletePayment, currentMonthKey } = useContext(StudentContext);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  if (!isOpen || !student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    addPayment(student.id, amount, date);
    setAmount('');
    onClose();
  };

  const getPaidThisMonth = () => {
    return student.payments
      .filter(p => p.monthKey === currentMonthKey)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const pendingAmount = Math.max(0, Number(student.monthlyFee) - getPaidThisMonth());

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Record Payment for {student.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="mb-4 p-4" style={{ background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Monthly Fee:</span>
            <strong>₹{student.monthlyFee}</strong>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Paid This Month:</span>
            <strong style={{ color: 'var(--success)' }}>₹{getPaidThisMonth()}</strong>
          </div>
          <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-muted">Pending Balance:</span>
            <strong style={{ color: 'var(--danger)' }}>₹{pendingAmount}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Amount (₹)</label>
            <input 
              type="number" 
              className="form-control" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              min="1" 
              placeholder={`Suggest: ${pendingAmount}`}
            />
          </div>
          <div className="form-group">
            <label>Payment Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
          <div className="flex gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Payment</button>
          </div>
        </form>

        {student.payments.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Payment History</h3>
            <ul style={{ listStyle: 'none', maxHeight: '150px', overflowY: 'auto' }}>
              {[...student.payments].reverse().map(p => (
                <li key={p.id} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ marginRight: '1rem' }}>{new Date(p.date).toLocaleDateString()}</span>
                    <strong>₹{p.amount}</strong>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: 'var(--danger)', color: 'white', border: 'none' }}
                    onClick={() => setPaymentToDelete(p.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!paymentToDelete}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
        onConfirm={() => {
          deletePayment(student.id, paymentToDelete);
          setPaymentToDelete(null);
        }}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};

export default PaymentModal;
