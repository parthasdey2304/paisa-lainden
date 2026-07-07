import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseModal from './ExpenseModal';

function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleRecordExpense = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const handleViewExpenses = () => {
    setIsOpen(false);
    navigate('/expenses');
  };

  return (
    <>
      <div className="fab-container">
        {isOpen && (
          <div className="fab-menu">
            <button className="fab-item" onClick={handleRecordExpense}>
              <span className="fab-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </span>
              Record Expense
            </button>
            <button className="fab-item" onClick={handleViewExpenses}>
              <span className="fab-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </span>
              View Expenses
            </button>
          </div>
        )}
        
        <button 
          className={`fab-button ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          title="Expense Actions"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default FloatingActionMenu;
