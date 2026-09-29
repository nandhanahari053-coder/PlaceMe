-- ============================================================
-- PlaceMe - Full Schema + Permissions Setup
-- Paste this ENTIRE script into Supabase SQL Editor and click Run
-- URL: https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new
-- ============================================================

-- 1. Grant schema access
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;

-- 2. Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  location TEXT,
  website TEXT,
  size TEXT,
  logo TEXT,
  rating DECIMAL(2,1) DEFAULT 4.0,
  openings INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  posted_by UUID,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  skills TEXT[],
  location TEXT,
  type TEXT,
  salary TEXT,
  stipend TEXT,
  duration TEXT,
  deadline DATE,
  category TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  applicants_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Placement Drives table
CREATE TABLE IF NOT EXISTS placement_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT,
  drive_date DATE,
  drive_time TEXT,
  location TEXT,
  eligibility TEXT,
  registration_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  college TEXT,
  degree TEXT,
  branch TEXT,
  graduation_year INT,
  cgpa DECIMAL(4,2),
  phone TEXT,
  skills TEXT[],
  bio TEXT,
  resume_url TEXT,
  profile_pic TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  company_name TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_location TEXT,
  profile_completion INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  student_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'Applied',
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Grant full access to service_role (for seeding & admin)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 9. Grant read access to anon (public browsing — unauthenticated users)
GRANT SELECT ON companies TO anon;
GRANT SELECT ON jobs TO anon;
GRANT SELECT ON placement_drives TO anon;

-- 10. Grant authenticated users their needed permissions
-- Public tables: authenticated users also need SELECT (logged-in users use the
-- 'authenticated' role in Supabase, NOT 'anon', so both roles must be granted)
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON jobs TO authenticated;
GRANT SELECT ON placement_drives TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT ON applications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;

-- 11. Future tables will also inherit service_role permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
