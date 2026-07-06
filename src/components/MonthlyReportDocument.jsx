import React from 'react';

const MonthlyReportDocument = ({ 
  students, 
  selectedMonth, 
  totalExpectedFees,
  collectedThisMonth,
  pendingFees,
  totalStudents,
  pendingStudents
}) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const selectedMonthIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1], 10) - 1 : new Date().getMonth();
  const year = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
  const currentMonthName = monthNames[selectedMonthIndex];

  // Table styling according to brutalist theme
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    border: '4px solid black'
  };

  const thStyle = {
    border: '4px solid black',
    padding: '12px',
    background: 'var(--warning)',
    color: 'black',
    textTransform: 'uppercase',
    fontWeight: '800',
    textAlign: 'left'
  };

  const tdStyle = {
    border: '4px solid black',
    padding: '12px',
    fontWeight: '600'
  };

  return (
    <div style={{
      width: '800px', // Fixed width for consistent PDF output
      padding: '40px',
      background: '#ffffff',
      fontFamily: '"Space Grotesk", sans-serif',
      color: '#000000'
    }}>
      {/* Header */}
      <div style={{
        border: '6px solid black',
        background: '#2563eb', // Blue background as requested
        color: '#ffffff', // White text as requested
        padding: '20px',
        textAlign: 'center',
        marginBottom: '30px',
        boxShadow: '8px 8px 0px black'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          textTransform: 'uppercase',
          letterSpacing: '-1px'
        }}>
          Partha's Sir Tuition
        </h1>
        <h2 style={{ 
          margin: '10px 0 0 0', 
          fontSize: '1.5rem', 
          fontWeight: 800 
        }}>
          Monthly Report: {currentMonthName} {year}
        </h2>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          border: '4px solid black',
          padding: '15px',
          background: '#ffffff',
          boxShadow: '4px 4px 0px black'
        }}>
          <h3 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: '1rem', color: '#333333' }}>Overview</h3>
          <p style={{ margin: '5px 0', fontWeight: 700 }}>Total Students: <span style={{ float: 'right' }}>{totalStudents}</span></p>
          <p style={{ margin: '5px 0', fontWeight: 700 }}>Pending Students: <span style={{ float: 'right', color: '#ef4444' }}>{pendingStudents.length}</span></p>
          <p style={{ margin: '5px 0', fontWeight: 700 }}>Fully Paid Students: <span style={{ float: 'right', color: '#4ade80' }}>{totalStudents - pendingStudents.length}</span></p>
        </div>
        
        <div style={{
          border: '4px solid black',
          padding: '15px',
          background: '#facc15',
          boxShadow: '4px 4px 0px black'
        }}>
          <h3 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: '1rem', color: '#000000' }}>Financials</h3>
          <p style={{ margin: '5px 0', fontWeight: 800, color: '#000000' }}>Total Received: <span style={{ float: 'right' }}>₹{collectedThisMonth}</span></p>
          <p style={{ margin: '5px 0', fontWeight: 800, color: '#000000' }}>Pending Amount: <span style={{ float: 'right', color: '#ef4444' }}>₹{pendingFees}</span></p>
          <p style={{ margin: '5px 0', fontWeight: 800, color: '#000000', borderTop: '2px solid black', paddingTop: '5px', marginTop: '5px' }}>Total Expected: <span style={{ float: 'right' }}>₹{totalExpectedFees}</span></p>
        </div>
      </div>

      {/* Student Details Table */}
      <h3 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: 800, borderBottom: '4px solid black', display: 'inline-block', paddingBottom: '5px', color: '#000000' }}>
        Student Details
      </h3>
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Subjects</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Mode</th>
            <th style={thStyle}>Paid (₹)</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => {
            const monthPayments = (student.payments || []).filter(p => p.monthKey === selectedMonth);
            const amountPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            const isPaid = amountPaid >= Number(student.monthlyFee);
            
            // Get the most recent payment date and mode for this month if available
            const latestPayment = monthPayments.length > 0 ? [...monthPayments].sort((a,b) => new Date(b.date) - new Date(a.date))[0] : null;
            const paymentDate = latestPayment && latestPayment.date ? new Date(latestPayment.date).toLocaleDateString() : '-';
            const paymentMode = latestPayment ? (latestPayment.paymentMethod || latestPayment.payment_method || 'online') : '-';

            return (
              <tr key={student.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f0f0', color: '#000000' }}>
                <td style={tdStyle}>{student.name}</td>
                <td style={tdStyle}>{student.phone || '-'}</td>
                <td style={tdStyle}>{student.subjects || '1'}</td>
                <td style={tdStyle}>{paymentDate}</td>
                <td style={{...tdStyle, textTransform: 'capitalize'}}>{paymentMode}</td>
                <td style={tdStyle}>{amountPaid} / {student.monthlyFee}</td>
                <td style={{
                  ...tdStyle, 
                  color: '#ffffff', // White text
                  background: isPaid ? '#4ade80' : '#ef4444', // Green for paid, Red for unpaid
                  fontWeight: '800'
                }}>
                  {isPaid ? 'PAID' : 'PENDING'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center', fontWeight: 600, color: '#333333', fontSize: '0.9rem' }}>
        Report generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default MonthlyReportDocument;
