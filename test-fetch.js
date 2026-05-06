// Just fetch from the supabase endpoint using fetch and log
const supabaseUrl = 'https://ypefusjmzfiyfmpitglh.supabase.co';
const supabaseKey = 'sb_publishable_szadwMt6-_psznRWnnQo-w_vKLTES82';

async function test() {
  const sRes = await fetch(`${supabaseUrl}/rest/v1/students`, { headers: { apikey: supabaseKey }});
  const studentsData = await sRes.json();
  
  const pRes = await fetch(`${supabaseUrl}/rest/v1/payments`, { headers: { apikey: supabaseKey }});
  const paymentsData = await pRes.json();
  
  const merged = (studentsData || []).map((student) => {
    const pay = (paymentsData || []).filter((p) => p.student_id === student.id);
    return {
      ...student,
      monthlyFee: student.monthly_fee,
      payments: pay.map((p) => ({
        ...p,
        date: p.payment_date,
        monthKey: p.month_key,
      })),
    };
  });

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  console.log("Current month key:", currentMonthKey);

  const pendingStudents = merged.filter(s => {
    const paidThisMonth = (s.payments || [])
      .filter(p => p.monthKey === currentMonthKey)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return paidThisMonth < Number(s.monthlyFee || 0);
  });

  for(const p of pendingStudents) {
    const paidThisMonth = (p.payments || []).filter(_p => _p.monthKey === currentMonthKey).reduce((sum, _p) => sum + Number(_p.amount), 0);
    console.log(`${p.name} - Paid: ${paidThisMonth}, Expected: ${p.monthlyFee}`);
    if (paidThisMonth > 0) {
      console.log(` ---> They paid something. payments:`, p.payments);
    }
  }
}
test();