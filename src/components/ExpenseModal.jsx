import React, { useState, useContext } from 'react';
import { StudentContext } from '../context/StudentContext';

function ExpenseModal({ isOpen, onClose }) {
  const { addExpense, selectedMonth } = useContext(StudentContext);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    // Use selectedMonth as the monthKey by default so expenses match the dashboard view
    // if the user wants them to correspond. Or we can just extract it from date.
    // Let's use the selectedMonth so they apply to the current active month on the dashboard.
    addExpense(amount, description, date, selectedMonth);

    setAmount('');
    setDescription('');
    setDate(today);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Record Expense</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>How much money I have used? (Amount)</label>
            <input 
              type="number" 
              className="form-control" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              required 
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label>For what thing have I used it? (Description)</label>
            <input 
              type="text" 
              className="form-control" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Zoom Subscription, Books..."
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseModal;
