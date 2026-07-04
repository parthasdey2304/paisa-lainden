import React, { useContext, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import html2pdf from 'html2pdf.js';
import { StudentContext } from '../context/StudentContext';
import ConfirmModal from './ConfirmModal';
import InvoiceDocument from './InvoiceDocument';

const StudentList = ({ onEdit, onPay, searchQuery = '' }) => {
  const { students, selectedMonth, currentMonthKey, deleteStudent } = useContext(StudentContext);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.paid-dropdown')) {
        document.querySelectorAll('.paid-dropdown-menu').forEach(el => el.style.display = 'none');
      }
    };
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  const handleDownloadInvoice = (student) => {
    const payment = student.payments.find(p => p.monthKey === selectedMonth);
    if (!payment) return;
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const selectedMonthIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1], 10) - 1 : new Date().getMonth();
    const currentMonthName = monthNames[selectedMonthIndex];

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    const root = createRoot(container);
    root.render(<InvoiceDocument student={student} payment={payment} monthName={currentMonthName} />);
    
    setTimeout(() => {
      const opt = {
        margin:       0,
        filename:     `${student.name}_Invoice_${selectedMonth}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(container.firstChild).save().then(() => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(container);
        }, 100);
      });
    }, 800); // Wait for Google fonts to load
  };

  const getFeeStatus = (student) => {
    const paidThisMonth = student.payments
      .filter(p => p.monthKey === selectedMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyFee = Number(student.monthlyFee);
    const leftAmount = monthlyFee - paidThisMonth;

    if (paidThisMonth >= monthlyFee) {
      return (
        <div className="paid-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            className="badge badge-success" 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'inherit', margin: '0 auto' }}
            onClick={(e) => {
              e.stopPropagation();
              // Hide others
              document.querySelectorAll('.paid-dropdown-menu').forEach(el => {
                if (el !== e.currentTarget.nextSibling) el.style.display = 'none';
              });
              const dropdown = e.currentTarget.nextSibling;
              dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }}
          >
            PAID <span style={{ fontSize: '0.6rem' }}>▼</span>
          </button>
          <div 
            className="paid-dropdown-menu" 
            style={{ 
              display: 'none', 
              position: 'absolute', 
              top: '100%', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: 'var(--surface)', 
              border: '2px solid var(--border)', 
              zIndex: 10,
              boxShadow: '4px 4px 0px var(--border)',
              marginTop: '4px',
              padding: '0'
            }}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.parentElement.style.display = 'none';
                handleDownloadInvoice(student);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                width: '100%',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--warning)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Download Invoice
            </button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span className="badge badge-danger">Pending</span>
        {leftAmount > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--danger-color)', fontWeight: 600 }}>Left: ₹{leftAmount}</span>}
      </div>
    );
  };

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return s.name?.toLowerCase().includes(lowerQuery) || s.phone?.includes(lowerQuery);
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aPaidThisMonth = (a.payments || [])
      .filter(p => p.monthKey === selectedMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    const bPaidThisMonth = (b.payments || [])
      .filter(p => p.monthKey === selectedMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const aIsPaid = aPaidThisMonth >= Number(a.monthlyFee);
    const bIsPaid = bPaidThisMonth >= Number(b.monthlyFee);
    
    if (aIsPaid && !bIsPaid) return -1;
    if (!aIsPaid && bIsPaid) return 1;
    return 0;
  });

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th className="hide-on-mobile">Contact</th>
            <th className="hide-on-mobile">Subjects</th>
            <th>Monthly<br/>Fee</th>
            <th style={{ textAlign: 'center' }} className="hide-on-mobile">Fee Status ({selectedMonth})</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No students found. Add one to get started!
              </td>
            </tr>
          ) : (
            sortedStudents.map(student => (
              <tr key={student.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{student.name}</div>
                  <div className="mobile-only mt-2">
                    {getFeeStatus(student)}
                  </div>
                </td>
                <td className="hide-on-mobile">
                  <div style={{ fontSize: '0.875rem' }}>📞 {student.phone}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>✉️ {student.email || 'No email provided'}</div>
                </td>
                <td className="hide-on-mobile">{student.subjects || 'N/A'}</td>
                <td>₹{student.monthlyFee}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }} className="hide-on-mobile">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {getFeeStatus(student)}
                  </div>
                </td>
                <td className="text-right action-col">
                  <div className="flex gap-2 action-buttons" style={{ justifyContent: 'flex-end' }}>
                    {student.email && (
                      <a href={`mailto:${student.email}?subject=Fee Update&body=Hello ${student.name},`} className="btn btn-secondary" title="Email Student">
                        ✉️ Email
                      </a>
                    )}
                    <button className="btn btn-secondary" onClick={() => onPay(student)}>
                      💰 Pay
                    </button>
                    <button className="btn btn-secondary" onClick={() => onEdit(student)}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => setStudentToDelete(student)}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ConfirmModal 
        isOpen={!!studentToDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};

export default StudentList;
