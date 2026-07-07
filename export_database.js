import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ypefusjmzfiyfmpitglh.supabase.co';
const supabaseAnonKey = 'sb_publishable_szadwMt6-_psznRWnnQo-w_vKLTES82';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exportDatabase() {
  console.log('Fetching students...');
  const { data: students, error: studentsError } = await supabase.from('students').select('*');
  if (studentsError) console.error('Error fetching students:', studentsError);

  console.log('Fetching payments...');
  const { data: payments, error: paymentsError } = await supabase.from('payments').select('*');
  if (paymentsError) console.error('Error fetching payments:', paymentsError);

  console.log('Fetching expenses...');
  const { data: expenses, error: expensesError } = await supabase.from('expenses').select('*');
  if (expensesError) console.log('Notice: Could not fetch expenses from Supabase (table probably does not exist).');

  let sqlContent = `-- Database Export
-- Generated automatically

`;

  // Append schema.sql if it exists
  try {
    const schema = fs.readFileSync('schema.sql', 'utf8');
    sqlContent += `-- SCHEMA DEFINITION\n`;
    sqlContent += schema + `\n\n`;
  } catch (err) {
    console.error('Could not read schema.sql:', err);
  }

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val;
    // escape single quotes
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  sqlContent += `-- DATA DUMP\n\n`;

  // Students
  if (students && students.length > 0) {
    sqlContent += `-- Students Data\n`;
    for (const student of students) {
      const keys = Object.keys(student).join(', ');
      const values = Object.values(student).map(formatValue).join(', ');
      sqlContent += `INSERT INTO students (${keys}) VALUES (${values});\n`;
    }
    sqlContent += `\n`;
  }

  // Payments
  if (payments && payments.length > 0) {
    sqlContent += `-- Payments Data\n`;
    for (const payment of payments) {
      const keys = Object.keys(payment).join(', ');
      const values = Object.values(payment).map(formatValue).join(', ');
      sqlContent += `INSERT INTO payments (${keys}) VALUES (${values});\n`;
    }
    sqlContent += `\n`;
  }

  // Expenses
  if (expenses && expenses.length > 0) {
    sqlContent += `-- Expenses Data\n`;
    for (const expense of expenses) {
      const keys = Object.keys(expense).join(', ');
      const values = Object.values(expense).map(formatValue).join(', ');
      sqlContent += `INSERT INTO expenses (${keys}) VALUES (${values});\n`;
    }
    sqlContent += `\n`;
  }

  fs.writeFileSync('full_database_export.sql', sqlContent);
  console.log('Successfully generated full_database_export.sql!');
}

exportDatabase();
