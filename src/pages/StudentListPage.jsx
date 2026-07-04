import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentList from '../components/StudentList';
import StudentModal from '../components/StudentModal';
import PaymentModal from '../components/PaymentModal';
import { StudentContext } from '../context/StudentContext';

const StudentListPage = () => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [payingStudentId, setPayingStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { students } = useContext(StudentContext);
  const editingStudent = students.find(s => s.id === editingStudentId) || null;
  const payingStudent = students.find(s => s.id === payingStudentId) || null;

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '4px solid black', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Student Directory</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '300px', width: '100%' }}
          />
          <button className="btn btn-primary" onClick={handleAddStudent} style={{ whiteSpace: 'nowrap' }}>
            + Add New Student
          </button>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <StudentList 
          onEdit={handleEditStudent} 
          onPay={handlePayFees} 
          searchQuery={searchQuery}
        />
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
