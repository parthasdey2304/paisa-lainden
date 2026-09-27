import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Normalizes payment structure for consistent UI usage across components.
 */
export const normalizePayment = (payment) => {
  const dateValue = payment.payment_date || payment.date || null;
  const monthFromDate = typeof dateValue === 'string' ? dateValue.slice(0, 7) : null;
  return {
    ...payment,
    date: dateValue,
    payment_date: dateValue,
    monthKey: payment.month_key || payment.monthKey || monthFromDate || null,
    month_key: payment.month_key || payment.monthKey || monthFromDate || null,
    paymentMethod: payment.payment_method || payment.paymentMethod || 'online',
    payment_method: payment.payment_method || payment.paymentMethod || 'online'
  };
};

/**
 * Fetch all students with their payments merged.
 */
export const fetchStudents = async () => {
  const studentsSnap = await getDocs(collection(db, 'students'));
  const paymentsSnap = await getDocs(collection(db, 'payments'));

  const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const paymentsData = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const merged = studentsData.map((s) => {
    const studentPayments = paymentsData.filter(
      (p) => p.student_id === s.id || p.studentId === s.id
    );
    return {
      ...s,
      monthlyFee: Number(s.monthly_fee ?? s.monthlyFee ?? 0),
      monthly_fee: Number(s.monthly_fee ?? s.monthlyFee ?? 0),
      classYear: s.class_year ?? s.classYear ?? '',
      class_year: s.class_year ?? s.classYear ?? '',
      payments: studentPayments.map(normalizePayment)
    };
  });

  return merged;
};

/**
 * Fetch all expenses from Firestore.
 */
export const fetchExpenses = async () => {
  const expensesSnap = await getDocs(collection(db, 'expenses'));
  return expensesSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    amount: Number(d.data().amount || 0)
  }));
};

/**
 * Add a new student document to Firestore.
 */
export const addStudent = async (studentData) => {
  const payload = {
    name: studentData.name,
    email: studentData.email || null,
    phone: studentData.phone,
    subjects: Number(studentData.subjects || 1),
    monthly_fee: Number(studentData.monthlyFee || studentData.monthly_fee || 0),
    monthlyFee: Number(studentData.monthlyFee || studentData.monthly_fee || 0),
    class_year: studentData.classYear || studentData.class_year || '',
    classYear: studentData.classYear || studentData.class_year || '',
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'students'), payload);
  return {
    id: docRef.id,
    ...payload,
    payments: []
  };
};

/**
 * Update an existing student document.
 */
export const editStudent = async (id, updatedData) => {
  const payload = {
    name: updatedData.name,
    email: updatedData.email || null,
    phone: updatedData.phone,
    subjects: Number(updatedData.subjects || 1),
    monthly_fee: Number(updatedData.monthlyFee || updatedData.monthly_fee || 0),
    monthlyFee: Number(updatedData.monthlyFee || updatedData.monthly_fee || 0),
    class_year: updatedData.classYear || updatedData.class_year || '',
    classYear: updatedData.classYear || updatedData.class_year || '',
    updated_at: new Date().toISOString()
  };

  await updateDoc(doc(db, 'students', id), payload);
  return { id, ...payload };
};

/**
 * Delete a student and cascade delete their payments.
 */
export const deleteStudent = async (id) => {
  await deleteDoc(doc(db, 'students', id));

  // Also remove associated payments
  try {
    const q = query(collection(db, 'payments'), where('student_id', '==', id));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.warn('Could not cascade delete payments for student:', err);
  }
};

/**
 * Record a payment for a student.
 */
export const addPayment = async (studentId, amount, date, paymentMethod = 'online', customMonthKey = null) => {
  let monthKey = customMonthKey;
  if (!monthKey && date) {
    const [year, month] = date.split('-');
    monthKey = `${year}-${month}`;
  }

  const paymentRecord = {
    student_id: studentId,
    studentId: studentId,
    amount: Number(amount),
    payment_date: date,
    date: date,
    month_key: monthKey,
    monthKey: monthKey,
    payment_method: paymentMethod,
    paymentMethod: paymentMethod,
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
  return normalizePayment({ id: docRef.id, ...paymentRecord });
};

/**
 * Delete a payment record.
 */
export const deletePayment = async (paymentId) => {
  await deleteDoc(doc(db, 'payments', paymentId));
};

/**
 * Record an expense.
 */
export const addExpense = async (amount, description, date, monthKey) => {
  const expenseRecord = {
    amount: Number(amount),
    description,
    expense_date: date,
    date: date,
    month_key: monthKey,
    monthKey: monthKey,
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'expenses'), expenseRecord);
  return { id: docRef.id, ...expenseRecord };
};

/**
 * Delete an expense record.
 */
export const deleteExpense = async (expenseId) => {
  await deleteDoc(doc(db, 'expenses', expenseId));
};
