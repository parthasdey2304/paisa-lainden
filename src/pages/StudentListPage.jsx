import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentList from '../components/StudentList';
import StudentModal from '../components/StudentModal';
import PaymentModal from '../components/PaymentModal';
import { StudentContext } from '../context/StudentContext';

const StudentListPage = () => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [payingStudent, setPayingStudent] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { students } = useContext(StudentContext);

  useEffect(() => {
    if (location.state?.openPaymentFor && students.length > 0) {
      const studentToPay = students.find(s => s.id === location.state.openPaymentFor);
      if (studentToPay) {
        setPayingStudent(studentToPay);
        setIsPaymentModalOpen(true);
        // Clear the state so it doesn't reopen if they close the modal and it re-renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, students, navigate, location.pathname]);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handlePayFees = (student) => {
    setPayingStudent(student);
    setIsPaymentModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '4px solid black' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>Student Directory</h2>
        <button className="btn btn-primary" onClick={handleAddStudent}>
          + Add New Student
        </button>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <StudentList 
          onEdit={handleEditStudent} 
          onPay={handlePayFees} 
        />
      </div>

      <StudentModal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        student={editingStudent}
      />
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        student={payingStudent}
      />
    </div>
  );
};

export default StudentListPage;
