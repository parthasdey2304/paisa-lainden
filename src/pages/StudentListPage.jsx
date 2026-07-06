import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentList from '../components/StudentList';
import StudentModal from '../components/StudentModal';
import PaymentModal from '../components/PaymentModal';
import { StudentContext } from '../context/StudentContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils.jsx';

const StudentListPage = () => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [payingStudentId, setPayingStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    students, 
    loading,
    selectedMonth,
    totalExpectedFees,
    collectedThisMonth,
    pendingFees,
    totalStudents,
    pendingStudents 
  } = useContext(StudentContext);
  
  const editingStudent = students.find(s => s.id === editingStudentId) || null;
  const payingStudent = students.find(s => s.id === payingStudentId) || null;
  const exportMenuRefDesktop = useRef(null);
  const exportMenuRefMobile = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop = exportMenuRefDesktop.current && !exportMenuRefDesktop.current.contains(event.target);
      const clickedOutsideMobile = exportMenuRefMobile.current && !exportMenuRefMobile.current.contains(event.target);
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.state?.openPaymentFor && students.length > 0) {
      const studentToPay = students.find(s => s.id === location.state.openPaymentFor);
      if (studentToPay) {
        setPayingStudentId(studentToPay.id);
        setIsPaymentModalOpen(true);
        // Clear the state so it doesn't reopen if they close the modal and it re-renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, students, navigate, location.pathname]);

  useEffect(() => {
    if (payingStudentId && !payingStudent) {
      setIsPaymentModalOpen(false);
      setPayingStudentId(null);
    }
  }, [payingStudentId, payingStudent]);

  useEffect(() => {
    if (editingStudentId && !editingStudent) {
      setIsStudentModalOpen(false);
      setEditingStudentId(null);
    }
  }, [editingStudentId, editingStudent]);

  const handleAddStudent = () => {
    setEditingStudentId(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setIsStudentModalOpen(true);
  };

  const handlePayFees = (student) => {
    setPayingStudentId(student.id);
    setIsPaymentModalOpen(true);
  };

  const handleExportPDF = () => {
    exportToPDF(students, selectedMonth, totalExpectedFees, collectedThisMonth, pendingFees, totalStudents, pendingStudents);
    setIsExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(students, selectedMonth, totalExpectedFees, collectedThisMonth, pendingFees, totalStudents, pendingStudents);
    setIsExportMenuOpen(false);
  };

  const renderExportMenu = (ref, alignRight = false, className = "") => (
    <div className={className} style={{ position: 'relative' }} ref={ref}>
      <button 
        className="btn" 
        style={{ 
          whiteSpace: 'nowrap', 
          background: 'var(--surface)', 
          color: 'var(--text-main)',
          border: '4px solid var(--border)', 
          boxShadow: '4px 4px 0px var(--border)',
          fontWeight: 800,
          padding: '0.5rem 1rem'
        }} 
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
      >
        Export Report ▼
      </button>
      {isExportMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          [alignRight ? 'right' : 'left']: 0,
          marginTop: '8px',
          background: 'var(--surface)',
          color: 'var(--text-main)',
          border: '4px solid var(--border)',
          boxShadow: '4px 4px 0px var(--border)',
          zIndex: 100,
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <button 
            onClick={handleExportPDF}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              borderBottom: '4px solid var(--border)',
              textAlign: 'left',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--warning)'; e.target.style.color = 'black'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-main)'; }}
          >
            📄 Download PDF
          </button>
          <button 
            onClick={handleExportExcel}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              textAlign: 'left',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit'
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

  return (
    <div>
      <style>
        {`
          .export-mobile-only { display: none; }
          @media (max-width: 768px) {
            .export-mobile-only { display: block; }
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '4px solid black', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Student Directory</h2>
          {renderExportMenu(exportMenuRefMobile, false, "export-mobile-only")}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '300px', width: '100%' }}
          />

          {renderExportMenu(exportMenuRefDesktop, true, "desktop-only")}

          <button className="btn btn-primary" onClick={handleAddStudent} style={{ whiteSpace: 'nowrap' }}>
            + Add New Student
          </button>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div 
            style={{ 
              padding: '2rem', 
              minHeight: '350px', 
              background: 'var(--warning)', 
              border: '4px solid var(--border)',
              boxShadow: '6px 6px 0px var(--border)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '20px'
            }}
          >
            <img 
              src="https://cdn.dribbble.com/userupload/22569723/file/original-a121107ab8231c9e9be60c6593ee33f9.gif" 
              alt="Loading data..."
              style={{ width: '200px', height: 'auto', borderRadius: '12px', border: '4px solid var(--border)', boxShadow: '6px 6px 0px var(--border)' }}
            />
          </div>
        ) : (
          <StudentList 
            onEdit={handleEditStudent} 
            onPay={handlePayFees} 
            searchQuery={searchQuery}
          />
        )}
      </div>

      <StudentModal 
        isOpen={isStudentModalOpen} 
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudentId(null);
        }} 
        student={editingStudent}
      />
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPayingStudentId(null);
        }}
        student={payingStudent}
      />
    </div>
  );
};

export default StudentListPage;
