import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentList from '../components/StudentList';
import StudentModal from '../components/StudentModal';
import PaymentModal from '../components/PaymentModal';
import ConfirmModal from '../components/ConfirmModal';
import { StudentContext } from '../context/StudentContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils.jsx';

const StudentListPage = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'deleted'
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [payingStudentId, setPayingStudentId] = useState(null);
  const [studentToPermanentlyDelete, setStudentToPermanentlyDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    students,
    deletedStudents = [],
    loading,
    selectedMonth,
    totalExpectedFees,
    collectedThisMonth,
    pendingFees,
    totalStudents,
    pendingStudents,
    restoreStudent,
    permanentlyDeleteStudent
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

  const filteredDeletedStudents = (deletedStudents || []).filter(s => {
    const query = searchQuery.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(query);
    const phoneMatch = (s.phone || '').includes(query);
    return nameMatch || phoneMatch;
  });

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
          .student-tabs {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
          }
          .tab-badge {
            margin-left: 0.5rem;
            padding: 0.15rem 0.5rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 800;
          }
        `}
      </style>
      
      {/* Top Header Row */}
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

      {/* Tabs: Active vs Deleted Students */}
      <div className="student-tabs">
        <button
          className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.6rem 1.25rem', fontWeight: 800 }}
          onClick={() => setActiveTab('active')}
        >
          Active Students
          <span className="tab-badge" style={{ background: activeTab === 'active' ? 'black' : 'var(--border)', color: activeTab === 'active' ? 'white' : 'inherit' }}>
            {students.length}
          </span>
        </button>

        <button
          className={`btn ${activeTab === 'deleted' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ padding: '0.6rem 1.25rem', fontWeight: 800 }}
          onClick={() => setActiveTab('deleted')}
        >
          🗑️ Deleted / Archive
          <span className="tab-badge" style={{ background: activeTab === 'deleted' ? 'black' : 'var(--border)', color: activeTab === 'deleted' ? 'white' : 'inherit' }}>
            {deletedStudents.length}
          </span>
        </button>
      </div>
      
      {/* Content Area */}
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
        ) : activeTab === 'active' ? (
          <StudentList 
            onEdit={handleEditStudent} 
            onPay={handlePayFees} 
            searchQuery={searchQuery}
          />
        ) : (
          /* Deleted Students View */
          <div className="table-wrapper">
            {filteredDeletedStudents.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No deleted students found</h3>
                <p>When you delete a student, they are archived here so you can bring them back anytime!</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th className="hide-on-mobile">Contact</th>
                    <th>Fee</th>
                    <th className="hide-on-mobile">Deleted On</th>
                    <th className="hide-on-mobile">Saved History</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeletedStudents.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{student.name}</div>
                        {student.classYear && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.classYear}</div>}
                      </td>
                      <td className="hide-on-mobile">
                        <div>📞 {student.phone}</div>
                        {student.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>✉️ {student.email}</div>}
                      </td>
                      <td>₹{student.monthlyFee || student.monthly_fee}</td>
                      <td className="hide-on-mobile">
                        {student.deleted_at ? new Date(student.deleted_at).toLocaleDateString() : 'Previously'}
                      </td>
                      <td className="hide-on-mobile">
                        <span className="badge" style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
                          {(student.payments || []).length} payments preserved
                        </span>
                      </td>
                      <td className="text-right action-col">
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 800 }}
                            onClick={() => restoreStudent(student.id)}
                            title="Restore student and all payment records"
                          >
                            🔄 Bring Back
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => setStudentToPermanentlyDelete(student)}
                            title="Delete permanently from archive"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

      {/* Confirm Permanent Delete Modal */}
      <ConfirmModal 
        isOpen={!!studentToPermanentlyDelete}
        title="Delete Forever"
        message={`Are you sure you want to PERMANENTLY delete ${studentToPermanentlyDelete?.name}? This will remove them forever and cannot be undone.`}
        onConfirm={() => {
          if (studentToPermanentlyDelete) {
            permanentlyDeleteStudent(studentToPermanentlyDelete.id);
            setStudentToPermanentlyDelete(null);
          }
        }}
        onCancel={() => setStudentToPermanentlyDelete(null)}
      />
    </div>
  );
};

export default StudentListPage;
