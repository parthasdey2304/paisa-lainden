import React, { useContext, useState } from 'react';
import { StudentContext } from '../context/StudentContext';
import ExpenseModal from '../components/ExpenseModal';

function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { expenses, deleteExpense, selectedMonth } = useContext(StudentContext);

  // Optionally filter by selectedMonth if we want this page to be monthly,
  // or just show all expenses and group them by month.
  // The user said "a list of all the expenses that I have made", so let's show all,
  // but maybe sort by date descending.
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonthExpenses = expenses
    .filter(e => e.month_key === selectedMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
    }
  };

  return (
    <div className="card dashboard-layout" style={{ flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ textTransform: 'uppercase', fontSize: '1.5rem', margin: 0 }}>All Expenses</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            + Record Expense
          </button>
          <div className="badge badge-warning" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            This Month: ₹{thisMonthExpenses}
          </div>
          <div className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            Total: ₹{totalExpenses}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {sortedExpenses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '3px solid var(--border)', background: 'var(--surface)' }}>
            <h3>No expenses recorded yet.</h3>
            <p>Use the + button at the bottom right to add an expense.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Month Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.expense_date}</td>
                  <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{expense.description}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>₹{expense.amount}</td>
                  <td>{expense.month_key}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      title="Delete Expense"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default ExpensesPage;
