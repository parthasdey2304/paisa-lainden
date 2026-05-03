import React, { useState } from 'react';
import StudentList from '../components/StudentList';
import StudentModal from '../components/StudentModal';
import PaymentModal from '../components/PaymentModal';

const StudentListPage = () => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [payingStudent, setPayingStudent] = useState(null);

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
