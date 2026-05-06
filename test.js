import fs from 'fs';
import { fetchStudents } from './src/services/supabaseService.js';

async function test() {
  try {
    const students = await fetchStudents();
    console.log("Total students", students.length);
    const d = new Date();
    const currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    console.log("currentMonthKey", currentMonthKey);
    
    const pendingStudents = students.filter(s => {
      const paidThisMonth = (s.payments || [])
        .filter(p => p.monthKey === currentMonthKey)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return paidThisMonth < Number(s.monthlyFee || 0);
    });
    
    console.log("Pending students:", pendingStudents.map(s => ({
      name: s.name,
      paid: (s.payments || []).filter(p => p.monthKey === currentMonthKey).reduce((a,b)=>a+Number(b.amount),0),
      expected: Number(s.monthlyFee || 0),
      payments: s.payments
    })));
  } catch(e) {
    console.error(e);
  }
}
test();