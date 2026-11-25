-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new

-- 1. Add company_name column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 2. Backfill existing jobs that have a company_id but no company_name
UPDATE jobs
SET company_name = companies.name
FROM companies
WHERE jobs.company_id = companies.id
  AND (jobs.company_name IS NULL OR jobs.company_name = '');

-- 3. Grant permissions
GRANT SELECT, UPDATE ON jobs TO authenticated;
