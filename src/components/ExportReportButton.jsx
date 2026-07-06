import React, { useState, useRef, useEffect, useContext } from 'react';
import { StudentContext } from '../context/StudentContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

/**
 * A self-contained Export Report dropdown button.
 * Reads all required data from StudentContext itself.
 * Pass `alignRight={true}` to open the dropdown towards the left.
 */
const ExportReportButton = ({ alignRight = true }) => {
  const {
    students,
    selectedMonth,
    totalExpectedFees,
    collectedThisMonth,
    pendingFees,
    totalStudents,
    pendingStudents,
  } = useContext(StudentContext);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePDF = () => {
    exportToPDF(students, selectedMonth, totalExpectedFees, collectedThisMonth, pendingFees, totalStudents, pendingStudents);
    setIsOpen(false);
  };

  const handleExcel = () => {
    exportToExcel(students, selectedMonth, totalExpectedFees, collectedThisMonth, pendingFees, totalStudents, pendingStudents);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        className="btn"
        style={{
          whiteSpace: 'nowrap',
          background: 'var(--surface)',
          color: 'var(--text-main)',
          border: '4px solid var(--border)',
          boxShadow: '4px 4px 0px var(--border)',
          fontWeight: 800,
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        Export Report ▼
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          [alignRight ? 'right' : 'left']: 0,
          marginTop: '8px',
          background: 'var(--surface)',
          color: 'var(--text-main)',
          border: '4px solid var(--border)',
          boxShadow: '4px 4px 0px var(--border)',
          zIndex: 200,
          minWidth: '180px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <button
            onClick={handlePDF}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              borderBottom: '4px solid var(--border)',
              textAlign: 'left',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--warning)'; e.target.style.color = 'black'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-main)'; }}
          >
            📄 Download PDF
          </button>
          <button
            onClick={handleExcel}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              textAlign: 'left',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--warning)'; e.target.style.color = 'black'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-main)'; }}
          >
            📊 Download Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportReportButton;
