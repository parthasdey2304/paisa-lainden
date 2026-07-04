import React, { useContext, useState } from 'react';
import { StudentContext } from '../context/StudentContext';
import ConfirmModal from './ConfirmModal';

const StudentList = ({ onEdit, onPay, searchQuery = '' }) => {
  const { students, selectedMonth, currentMonthKey, deleteStudent } = useContext(StudentContext);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const getFeeStatus = (student) => {
    const paidThisMonth = student.payments
      .filter(p => p.monthKey === selectedMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyFee = Number(student.monthlyFee);
    const leftAmount = monthlyFee - paidThisMonth;

    if (paidThisMonth >= monthlyFee) {
      return <span className="badge badge-success">Paid</span>;
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
            <th className="text-right">Actions</th>
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
