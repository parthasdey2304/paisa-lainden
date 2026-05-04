import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data: studentsData, error: studentError } = await supabase
        .from('students')
        .select('*');
        
      if (studentError) throw studentError;

      const { data: paymentsData, error: paymentError } = await supabase
        .from('payments')
        .select('*');
        
      if (paymentError) throw paymentError;

      // merge payments into students
      const mergedStudents = (studentsData || []).map(student => {
        const studentPayments = (paymentsData || []).filter(p => p.student_id === student.id);
        // Map database snake_case to camelCase for existing UI logic
        return { 
          ...student, 
          monthlyFee: student.monthly_fee,
          payments: studentPayments.map(p => ({
            ...p,
            date: p.payment_date,
            monthKey: p.month_key
          }))
        };
      });
      
      setStudents(mergedStudents);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      // Fallback to localstorage or empty array for graceful degradation if DB isn't set up yet
      const saved = localStorage.getItem('student-manager-data');
      if (saved) setStudents(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (studentData) => {
    const dbData = {
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      subjects: Number(studentData.subjects || 1),
      monthly_fee: Number(studentData.monthlyFee)
    };

    const { data, error } = await supabase
      .from('students')
      .insert([dbData])
      .select();
      
    if (error) {
      console.error('Error adding student:', error);
      // Fallback optimistic UI
      setStudents(prev => [...prev, { ...studentData, id: Date.now().toString(), payments: [] }]);
    } else if (data && data.length > 0) {
      setStudents(prev => [...prev, { ...data[0], monthlyFee: data[0].monthly_fee, payments: [] }]);
    }
  };

  const editStudent = async (id, updatedData) => {
    const dbData = {
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      subjects: Number(updatedData.subjects || 1),
      monthly_fee: Number(updatedData.monthlyFee)
    };

    const { error } = await supabase
      .from('students')
      .update(dbData)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating student:', error);
    }
    // Optimistic update
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedData, monthlyFee: updatedData.monthlyFee } : s));
  };

  const deleteStudent = async (id) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting student:', error);
    }
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addPayment = async (studentId, amount, date) => {
    const d = new Date(date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const paymentRecord = {
      student_id: studentId,
      amount: Number(amount),
      payment_date: date,
      month_key: monthKey
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([paymentRecord])
      .select();

    if (error) {
      console.error('Error adding payment:', error);
    }
    
    const paymentObj = (data && data.length > 0) ? data[0] : { id: Date.now().toString(), ...paymentRecord };

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          payments: [...(s.payments || []), { ...paymentObj, date: paymentObj.payment_date, monthKey: paymentObj.month_key }]
        };
      }
      return s;
    }));
  };

  const deletePayment = async (studentId, paymentId) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);
      
    if (error) {
      console.error('Error deleting payment:', error);
    }
    
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          payments: s.payments.filter(p => p.id !== paymentId)
        };
      }
      return s;
    }));
  };

  // Helper logic for dashboard
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  const totalStudents = students.length;
  
  // Total fees expected this month
  const totalExpectedFees = students.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);
  
  // Total fees collected this month
  const collectedThisMonth = students.reduce((sum, s) => {
    const currentMonthPayments = (s.payments || []).filter(p => p.monthKey === currentMonthKey);
    return sum + currentMonthPayments.reduce((pSum, p) => pSum + Number(p.amount), 0);
  }, 0);

  const pendingFees = Math.max(0, totalExpectedFees - collectedThisMonth);

  // Students who haven't fully paid this month
  const pendingStudents = students.filter(s => {
    const paidThisMonth = (s.payments || [])
      .filter(p => p.monthKey === currentMonthKey)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return paidThisMonth < Number(s.monthlyFee || 0);
  });

  // Notification Logic
  const todayDate = new Date().getDate();
  const showFeeNotification = todayDate >= 5 && pendingStudents.length > 0;

  return (
    <StudentContext.Provider value={{
      students,
      loading,
      addStudent,
      editStudent,
      deleteStudent,
      addPayment,
      deletePayment,
      totalStudents,
      totalExpectedFees,
      collectedThisMonth,
      pendingFees,
      pendingStudents,
      showFeeNotification,
      currentMonthKey
    }}>
      {children}
    </StudentContext.Provider>
  );
};
