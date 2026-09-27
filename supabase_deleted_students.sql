-- ============================================================================
-- Supabase Schema: deleted_students table
-- Run this in your Supabase Dashboard -> SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS deleted_students (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  subjects INTEGER DEFAULT 1,
  monthly_fee INTEGER NOT NULL,
  class_year TEXT,
  payments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE deleted_students ENABLE ROW LEVEL SECURITY;

-- Policies for full read/write access
CREATE POLICY "Enable read access for all users" ON deleted_students FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON deleted_students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON deleted_students FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON deleted_students FOR DELETE USING (true);
