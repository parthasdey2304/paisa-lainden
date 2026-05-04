import React, { useContext, useState } from 'react';
import { StudentContext } from '../context/StudentContext';
import ConfirmModal from './ConfirmModal';

const StudentList = ({ onEdit, onPay }) => {
  const { students, currentMonthKey, deleteStudent } = useContext(StudentContext);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const getFeeStatus = (student) => {
    const paidThisMonth = student.payments
      .filter(p => p.monthKey === currentMonthKey)
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

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Subjects</th>
            <th>Monthly Fee</th>
            <th style={{ textAlign: 'center' }}>Fee Status (Current)</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No students found. Add one to get started!
              </td>
            </tr>
          ) : (
            students.map(student => (
              <tr key={student.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{student.name}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem' }}>📞 {student.phone}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>✉️ {student.email || 'No email provided'}</div>
                </td>
                <td>{student.subjects || 'N/A'}</td>
                <td>₹{student.monthlyFee}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {getFeeStatus(student)}
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex justify-between gap-2" style={{ justifyContent: 'flex-end' }}>
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
