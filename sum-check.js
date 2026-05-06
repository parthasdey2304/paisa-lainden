const fetch = globalThis.fetch || require('node-fetch');
const url = 'https://ypefusjmzfiyfmpitglh.supabase.co/rest/v1';
const apikey = 'sb_publishable_szadwMt6-_psznRWnnQo-w_vKLTES82';

async function run() {
  const pRes = await fetch(url + '/payments', { headers: { apikey }});
  const payments = await pRes.json();
  const sRes = await fetch(url + '/students', { headers: { apikey }});
  const students = await sRes.json();

  const currentMonthKey = '2026-05';
  let sum = 0;
  
  students.forEach(s => {
      const studentPayments = payments.filter(p => p.student_id === s.id);
      const currentMonthPayments = studentPayments.filter(p => {
          return p.payment_date && p.payment_date.slice(0, 7) === currentMonthKey;
      });
      const studentPaid = currentMonthPayments.reduce((a, b) => a + Number(b.amount), 0);
      if (studentPaid > 0) {
        console.log(`Student: ${s.name}, Paid: ₹${studentPaid}`);
        sum += studentPaid;
      }
  });

  console.log('Total May Collected = ₹' + sum);
}
run();