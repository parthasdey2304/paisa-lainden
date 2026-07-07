import { Client } from 'pg';
import fs from 'fs';

// To run this script, you need to provide your Supabase Database Connection String.
// You can find it in your Supabase Dashboard -> Project Settings -> Database -> Connection string (URI)
// It looks like: postgres://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: Please provide the DATABASE_URL environment variable.");
  console.error("Example: set DATABASE_URL=postgres://... && node migrate-expenses.js");
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to the database successfully.");

    const sql = `
      -- Create expenses table if it doesn't exist
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        expense_date DATE NOT NULL,
        month_key TEXT NOT NULL
      );

      ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist (to avoid errors on re-run)
      DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
      DROP POLICY IF EXISTS "Enable insert access for all users" ON expenses;
      DROP POLICY IF EXISTS "Enable update access for all users" ON expenses;
      DROP POLICY IF EXISTS "Enable delete access for all users" ON expenses;

      -- Recreate policies
      CREATE POLICY "Enable read access for all users" ON expenses FOR SELECT USING (true);
      CREATE POLICY "Enable insert access for all users" ON expenses FOR INSERT WITH CHECK (true);
      CREATE POLICY "Enable update access for all users" ON expenses FOR UPDATE USING (true);
      CREATE POLICY "Enable delete access for all users" ON expenses FOR DELETE USING (true);
    `;

    await client.query(sql);
    console.log("Successfully created the expenses table and policies in the remote database!");

  } catch (error) {
    console.error("Database migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigration();
