import React, { useState, useEffect, useContext } from 'react';
import { StudentContext } from '../context/StudentContext';

const StudentModal = ({ isOpen, onClose, student }) => {
  const { addStudent, editStudent } = useContext(StudentContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    monthlyFee: '',
    subjects: '',
    classYear: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        monthlyFee: student.monthlyFee,
        subjects: student.subjects || '',
        classYear: student.classYear || student.class_year || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        monthlyFee: '',
        subjects: '',
        classYear: ''
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (student) {
      editStudent(student.id, formData);
    } else {
      addStudent(formData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address (Optional)</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Monthly Fee (₹)</label>
            <input type="number" className="form-control" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} required min="0" />
          </div>
          <div className="form-group">
            <label>Number of Subjects</label>
            <input type="number" className="form-control" name="subjects" value={formData.subjects} onChange={handleChange} min="1" />
          </div>
          <div className="form-group">
            <label>Class/Year</label>
            <input type="text" className="form-control" name="classYear" value={formData.classYear} onChange={handleChange} placeholder="e.g., 10th, 1st Year" />
          </div>
          <div className="flex gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{student ? 'Save Changes' : 'Add Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
