import { createContext, useState, useEffect } from 'react';
import {
  fetchStudents as getFirebaseStudents,
  fetchExpenses as getFirebaseExpenses,
  addStudent as createFirebaseStudent,
  editStudent as updateFirebaseStudent,
  deleteStudent as removeFirebaseStudent,
  addPayment as recordFirebasePayment,
  deletePayment as removeFirebasePayment,
  addExpense as createFirebaseExpense,
  deleteExpense as removeFirebaseExpense,
  normalizePayment
} from '../services/firebaseService';

export const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayDate = new Date();
  const currentMonthKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const loadData = async (isInitial = false) => {
    try {
      if (!isInitial) {
        setLoading(true);
      }
      const [studentsData, expensesData] = await Promise.all([
        getFirebaseStudents().catch(err => {
          console.warn('Firebase: Could not load students from Firestore. Checking local cache:', err);
          const saved = localStorage.getItem('student-manager-data');
          return saved ? JSON.parse(saved) : [];
        }),
        getFirebaseExpenses().catch(err => {
          console.warn('Firebase: Could not load expenses from Firestore. Checking local cache:', err);
          const saved = localStorage.getItem('student-manager-expenses');
          return saved ? JSON.parse(saved) : [];
        })
      ]);

      setStudents(studentsData || []);
      setExpenses(expensesData || []);
      
      // Cache locally for offline reliability
      if (studentsData && studentsData.length > 0) {
        localStorage.setItem('student-manager-data', JSON.stringify(studentsData));
      }
      if (expensesData && expensesData.length > 0) {
        localStorage.setItem('student-manager-expenses', JSON.stringify(expensesData));
      }
    } catch (error) {
      console.error('Error fetching data from Firebase:', error);
      const savedStudents = localStorage.getItem('student-manager-data');
      if (savedStudents) setStudents(JSON.parse(savedStudents));
      const savedExpenses = localStorage.getItem('student-manager-expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const addStudent = async (studentData) => {
    try {
      const createdStudent = await createFirebaseStudent(studentData);
      setStudents(prev => {
        const next = [...prev, createdStudent];
        localStorage.setItem('student-manager-data', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Error adding student to Firestore:', error);
      // Optimistic offline fallback
      const localId = Date.now().toString();
      const fallback = {
        ...studentData,
        id: localId,
        monthlyFee: Number(studentData.monthlyFee || 0),
        classYear: studentData.classYear || '',
        payments: []
      };
      setStudents(prev => {
        const next = [...prev, fallback];
        localStorage.setItem('student-manager-data', JSON.stringify(next));
        return next;
      });
    }
  };

  const editStudent = async (id, updatedData) => {
    try {
      await updateFirebaseStudent(id, updatedData);
    } catch (error) {
      console.error('Error updating student in Firestore:', error);
    }

    setStudents(prev => {
      const next = prev.map(s =>
        s.id === id
          ? {
              ...s,
              ...updatedData,
              monthlyFee: Number(updatedData.monthlyFee ?? s.monthlyFee),
              classYear: updatedData.classYear ?? s.classYear
            }
          : s
      );
      localStorage.setItem('student-manager-data', JSON.stringify(next));
      return next;
    });
  };

  const deleteStudent = async (id) => {
    try {
      await removeFirebaseStudent(id);
    } catch (error) {
      console.error('Error deleting student from Firestore:', error);
    }

    setStudents(prev => {
      const next = prev.filter(s => s.id !== id);
      localStorage.setItem('student-manager-data', JSON.stringify(next));
      return next;
    });
  };

  const addPayment = async (studentId, amount, date, paymentMethod = 'online', customMonthKey = null) => {
    let monthKey = customMonthKey;
    if (!monthKey && date) {
      const [year, month] = date.split('-');
      monthKey = `${year}-${month}`;
    }

    let newPayment;
    try {
      newPayment = await recordFirebasePayment(studentId, amount, date, paymentMethod, monthKey);
    } catch (error) {
      console.error('Error adding payment to Firestore:', error);
      newPayment = normalizePayment({
        id: Date.now().toString(),
        student_id: studentId,
        amount: Number(amount),
        payment_date: date,
        month_key: monthKey,
        payment_method: paymentMethod
      });
    }

    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            payments: [...(s.payments || []), newPayment]
          };
        }
        return s;
      });
      localStorage.setItem('student-manager-data', JSON.stringify(next));
      return next;
    });
  };

  const deletePayment = async (studentId, paymentId) => {
    try {
      await removeFirebasePayment(paymentId);
    } catch (error) {
      console.error('Error deleting payment from Firestore:', error);
    }

    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            payments: (s.payments || []).filter(p => p.id !== paymentId)
          };
        }
        return s;
      });
      localStorage.setItem('student-manager-data', JSON.stringify(next));
      return next;
    });
  };

  const addExpense = async (amount, description, date, monthKey) => {
    let createdExpense;
    try {
      createdExpense = await createFirebaseExpense(amount, description, date, monthKey);
    } catch (error) {
      console.warn('Error adding expense to Firestore. Saving locally instead:', error);
      createdExpense = {
        id: Date.now().toString(),
        amount: Number(amount),
        description,
        expense_date: date,
        month_key: monthKey
      };
    }

    setExpenses(prev => {
      const updated = [...prev, createdExpense];
      localStorage.setItem('student-manager-expenses', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteExpense = async (expenseId) => {
    try {
      await removeFirebaseExpense(expenseId);
    } catch (error) {
      console.warn('Error deleting expense from Firestore. Deleting locally instead:', error);
    }

    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== expenseId);
      localStorage.setItem('student-manager-expenses', JSON.stringify(updated));
      return updated;
    });
  };

  // Helper metrics for dashboard & reporting
  const totalStudents = students.length;

  const totalExpectedFees = students.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  const collectedThisMonth = students.reduce((sum, s) => {
    const selectedMonthPayments = (s.payments || []).filter(p => p.monthKey === selectedMonth);
    return sum + selectedMonthPayments.reduce((pSum, p) => pSum + Number(p.amount), 0);
  }, 0);

  const pendingFees = Math.max(0, totalExpectedFees - collectedThisMonth);

  const totalRevenue = students.reduce((sum, s) => {
    const allPayments = s.payments || [];
    return sum + allPayments.reduce((pSum, p) => pSum + Number(p.amount), 0);
  }, 0);

  const pendingStudents = students.filter(s => {
    const paidThisMonth = (s.payments || [])
      .filter(p => p.monthKey === selectedMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return paidThisMonth < Number(s.monthlyFee || 0);
  });

  const showFeeNotification = todayDate.getDate() >= 5 && selectedMonth === currentMonthKey && pendingStudents.length > 0;

  return (
    <StudentContext.Provider value={{
      students,
      expenses,
      loading,
      addStudent,
      editStudent,
      deleteStudent,
      addPayment,
      deletePayment,
      addExpense,
      deleteExpense,
      totalStudents,
      totalExpectedFees,
      collectedThisMonth,
      pendingFees,
      pendingStudents,
      showFeeNotification,
      currentMonthKey,
      selectedMonth,
      setSelectedMonth,
      totalRevenue,
      refreshData: loadData
    }}>
      {children}
    </StudentContext.Provider>
  );
};
