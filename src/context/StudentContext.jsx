import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizePayment = (payment) => {
    const dateValue = payment.payment_date || payment.date || null;
    const monthFromDate = typeof dateValue === 'string' ? dateValue.slice(0, 7) : null;
    return {
      ...payment,
      date: dateValue,
      monthKey: monthFromDate || payment.month_key || payment.monthKey || null,
      paymentMethod: payment.payment_method || payment.paymentMethod
    };
  };

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
          classYear: student.class_year,
          payments: studentPayments.map(normalizePayment)
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
      // class_year removed because it does not exist in the remote database yet
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
      setStudents(prev => [...prev, { ...data[0], monthlyFee: data[0].monthly_fee, classYear: data[0].class_year, payments: [] }]);
    }
  };

  const editStudent = async (id, updatedData) => {
    const dbData = {
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      subjects: Number(updatedData.subjects || 1),
      monthly_fee: Number(updatedData.monthlyFee)
      // class_year removed to prevent API error
    };

    const { error } = await supabase
      .from('students')
      .update(dbData)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating student:', error);
    }
    // Optimistic update
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedData, monthlyFee: updatedData.monthlyFee, classYear: updatedData.classYear } : s));
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

  const addPayment = async (studentId, amount, date, paymentMethod = 'offline') => {
    // Prevent timezone issues from shifting the date to the previous month
    const [year, month] = date.split('-');
    const monthKey = `${year}-${month}`;
    
    const paymentRecord = {
      student_id: studentId,
      amount: Number(amount),
      payment_date: date,
      month_key: monthKey
      // payment_method removed because it doesn't exist in the remote database yet
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([paymentRecord])
      .select();

    if (error) {
      console.error('Error adding payment:', error);
    }
    
    const paymentObj = (data && data.length > 0) ? data[0] : { id: Date.now().toString(), ...paymentRecord };
    const normalizedPayment = normalizePayment({
      ...paymentObj,
      payment_date: paymentObj.payment_date || paymentRecord.payment_date,
      month_key: paymentObj.month_key || paymentRecord.month_key,
      payment_method: paymentObj.payment_method || paymentRecord.payment_method
    });

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          payments: [...(s.payments || []), normalizedPayment]
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

  // Total revenue all time
  const totalRevenue = students.reduce((sum, s) => {
    const allPayments = s.payments || [];
    return sum + allPayments.reduce((pSum, p) => pSum + Number(p.amount), 0);
  }, 0);

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
      currentMonthKey,
      totalRevenue
    }}>
      {children}
    </StudentContext.Provider>
  );
};
