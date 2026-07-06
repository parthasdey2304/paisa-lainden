import { supabase } from '../supabaseClient';

/**
 * Fetch all students with their payments merged.
 */
export const fetchStudents = async () => {
  const { data: studentsData, error: studentError } = await supabase
    .from('students')
    .select('*');
  if (studentError) throw studentError;

  const { data: paymentsData, error: paymentError } = await supabase
    .from('payments')
    .select('*');
  if (paymentError) throw paymentError;

  // Merge payments into each student
  const normalizePayment = (payment) => {
    const dateValue = payment.payment_date || payment.date || null;
    const monthFromDate = typeof dateValue === 'string' ? dateValue.slice(0, 7) : null;
    return {
      ...payment,
      date: dateValue,
      monthKey: payment.month_key || payment.monthKey || monthFromDate || null,
      paymentMethod: payment.payment_method || payment.paymentMethod,
    };
  };

  const merged = (studentsData || []).map((s) => {
    const pay = (paymentsData || []).filter((p) => p.student_id === s.id);
    return {
      ...s,
      monthlyFee: s.monthly_fee,
      classYear: s.class_year,
      payments: pay.map(normalizePayment),
    };
  });
  return merged;
};

/** Add a new student */
export const addStudent = async (student) => {
  const payload = {
    name: student.name,
    email: student.email,
    phone: student.phone,
    subjects: Number(student.subjects || 1),
    monthly_fee: Number(student.monthlyFee)
  };
  const { data, error } = await supabase.from('students').insert([payload]).select();
  if (error) throw error;
  return data[0];
};

/** Edit existing student */
export const editStudent = async (id, updates) => {
  const payload = {
    name: updates.name,
    email: updates.email,
    phone: updates.phone,
    subjects: Number(updates.subjects || 1),
    monthly_fee: Number(updates.monthlyFee)
  };
  const { error } = await supabase.from('students').update(payload).eq('id', id);
  if (error) throw error;
};

/** Delete a student */
export const deleteStudent = async (id) => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
};

/** Add a payment for a student */
export const addPayment = async (studentId, amount, date, paymentMethod = 'online', customMonthKey = null) => {
  // If a custom month is provided, use it. Otherwise, default to the payment date's month
  let monthKey = customMonthKey;
  if (!monthKey) {
    const [year, month] = date.split('-');
    monthKey = `${year}-${month}`;
  }
  const payload = {
    student_id: studentId,
    amount: Number(amount),
    payment_date: date,
    month_key: monthKey
    // payment_method omitted to prevent API error
  };
  const { data, error } = await supabase.from('payments').insert([payload]).select();
  if (error) throw error;
  return data[0];
};

/** Fetch all payments (optional filter by student) */
export const fetchPayments = async (studentId = null) => {
  let query = supabase.from('payments').select('*');
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((payment) => {
    const dateValue = payment.payment_date || payment.date || null;
    const monthFromDate = typeof dateValue === 'string' ? dateValue.slice(0, 7) : null;
    return {
      ...payment,
      date: dateValue,
      monthKey: payment.month_key || payment.monthKey || monthFromDate || null,
      paymentMethod: payment.payment_method || payment.paymentMethod,
    };
  });
};

/** Delete a payment */
export const deletePayment = async (id) => {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
};
