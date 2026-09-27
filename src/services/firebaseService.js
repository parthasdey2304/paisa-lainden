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
 * ============================================================================
 * FIRESTORE SCHEMA DEFINITIONS & VALIDATORS
 * ============================================================================
 * 
 * 1. Collection 'students':
 *    - name: string (required, trimmed, min 1 char)
 *    - phone: string (required, trimmed, min 1 char)
 *    - email: string | null (optional)
 *    - subjects: number (integer >= 1, default: 1)
 *    - monthly_fee: number (integer >= 0, required)
 *    - monthlyFee: number (mirrored for frontend camelCase)
 *    - class_year: string (optional, e.g. 'Class 10')
 *    - classYear: string (mirrored for frontend camelCase)
 *    - created_at: ISO 8601 string timestamp
 *    - updated_at: ISO 8601 string timestamp (on update)
 * 
 * 2. Collection 'payments':
 *    - student_id: string (reference to students doc ID, required)
 *    - studentId: string (mirrored for frontend)
 *    - amount: number (> 0, required)
 *    - payment_date: string (YYYY-MM-DD, required)
 *    - date: string (mirrored for frontend)
 *    - month_key: string (YYYY-MM, required)
 *    - monthKey: string (mirrored for frontend)
 *    - payment_method: 'online' | 'cash' | 'upi' | 'offline' (required)
 *    - paymentMethod: string (mirrored for frontend)
 *    - created_at: ISO 8601 string timestamp
 * 
 * 3. Collection 'expenses':
 *    - description: string (required, trimmed, min 1 char)
 *    - amount: number (> 0, required)
 *    - expense_date: string (YYYY-MM-DD, required)
 *    - date: string (mirrored for frontend)
 *    - month_key: string (YYYY-MM, required)
 *    - monthKey: string (mirrored for frontend)
 *    - category: string (optional, default 'General')
 *    - created_at: ISO 8601 string timestamp
 * ============================================================================
 */

export const validateStudentPayload = (data) => {
  const name = String(data.name || '').trim();
  const phone = String(data.phone || '').trim();
  if (!name) throw new Error('Student name is required.');
  if (!phone) throw new Error('Student phone number is required.');

  const fee = Number(data.monthlyFee ?? data.monthly_fee ?? 0);
  if (isNaN(fee) || fee < 0) throw new Error('Monthly fee must be a non-negative number.');

  const subjects = Math.max(1, parseInt(data.subjects || 1, 10));
  const classYear = String(data.classYear ?? data.class_year ?? '').trim();
  const email = data.email ? String(data.email).trim() : null;

  return {
    name,
    phone,
    email,
    subjects,
    monthly_fee: fee,
    monthlyFee: fee,
    class_year: classYear,
    classYear
  };
};

export const validatePaymentPayload = (studentId, amount, date, paymentMethod = 'online', customMonthKey = null) => {
  if (!studentId) throw new Error('Student ID is required for recording payment.');
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Payment amount must be greater than zero.');
  if (!date) throw new Error('Payment date is required.');

  let monthKey = customMonthKey;
  if (!monthKey && date) {
    const [year, month] = date.split('-');
    monthKey = `${year}-${month}`;
  }

  const method = String(paymentMethod || 'online').toLowerCase();

  return {
    student_id: String(studentId),
    studentId: String(studentId),
    amount: numAmount,
    payment_date: date,
    date,
    month_key: monthKey,
    monthKey,
    payment_method: method,
    paymentMethod: method
  };
};

export const validateExpensePayload = (amount, description, date, monthKey, category = 'General') => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Expense amount must be greater than zero.');
  const desc = String(description || '').trim();
  if (!desc) throw new Error('Expense description is required.');
  if (!date) throw new Error('Expense date is required.');

  const mKey = monthKey || (typeof date === 'string' ? date.slice(0, 7) : '');

  return {
    description: desc,
    amount: numAmount,
    expense_date: date,
    date,
    month_key: mKey,
    monthKey: mKey,
    category: String(category || 'General').trim()
  };
};

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
 * Add a new student document to Firestore with schema validation.
 */
export const addStudent = async (studentData) => {
  const sanitized = validateStudentPayload(studentData);
  const payload = {
    ...sanitized,
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
 * Update an existing student document with schema validation.
 */
export const editStudent = async (id, updatedData) => {
  if (!id) throw new Error('Student ID is required for editing.');
  const sanitized = validateStudentPayload(updatedData);
  const payload = {
    ...sanitized,
    updated_at: new Date().toISOString()
  };

  await updateDoc(doc(db, 'students', id), payload);
  return { id, ...payload };
};

/**
 * Delete a student and cascade delete their payments.
 */
export const deleteStudent = async (id) => {
  if (!id) throw new Error('Student ID is required for deletion.');
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
 * Record a payment for a student with schema validation.
 */
export const addPayment = async (studentId, amount, date, paymentMethod = 'online', customMonthKey = null) => {
  const sanitized = validatePaymentPayload(studentId, amount, date, paymentMethod, customMonthKey);
  const paymentRecord = {
    ...sanitized,
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
  return normalizePayment({ id: docRef.id, ...paymentRecord });
};

/**
 * Delete a payment record.
 */
export const deletePayment = async (paymentId) => {
  if (!paymentId) throw new Error('Payment ID is required.');
  await deleteDoc(doc(db, 'payments', paymentId));
};

/**
 * Record an expense with schema validation.
 */
export const addExpense = async (amount, description, date, monthKey, category = 'General') => {
  const sanitized = validateExpensePayload(amount, description, date, monthKey, category);
  const expenseRecord = {
    ...sanitized,
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'expenses'), expenseRecord);
  return { id: docRef.id, ...expenseRecord };
};

/**
 * Delete an expense record.
 */
export const deleteExpense = async (expenseId) => {
  if (!expenseId) throw new Error('Expense ID is required.');
  await deleteDoc(doc(db, 'expenses', expenseId));
};
