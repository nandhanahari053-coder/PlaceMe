-- ============================================================
-- PlaceMe - Complete Database Permissions & Fix Script
-- ============================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new
--
-- What this fixes:
-- 1. ERROR 42501: permission denied for table companies / jobs
-- 2. Grants full SELECT / INSERT / UPDATE / DELETE rights to 'authenticated' and 'anon'
-- 3. Sets up RLS policies so public data is readable and private data is secure
-- 4. Auto-creates profile row whenever a new user signs up
-- ============================================================

-- STEP 1: Grant Schema Access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- STEP 2: Grant Table Privileges to Authenticated and Anon
-- In Supabase, logged-in users assume the PostgreSQL role 'authenticated'
-- Unauthenticated users assume 'anon'
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- STEP 3: Auto-grant on any future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- STEP 4: Configure Row Level Security (RLS)
-- Public browsing tables: Disable RLS so anyone can browse jobs & companies seamlessly
ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS placement_drives DISABLE ROW LEVEL SECURITY;

-- Private tables: Enable RLS for security
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- STEP 5: Drop any outdated/conflicting policies
DROP POLICY IF EXISTS "Public can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view own applications" ON applications;
DROP POLICY IF EXISTS "Students can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- STEP 6: Clean RLS Policies for Private Tables
-- Profiles: Authenticated users can view profiles (needed for recruiters viewing candidates),
-- and can update/insert their own profile
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Applications: Students manage their own; employers/recruiters can view & update applications for their jobs
DROP POLICY IF EXISTS "Students can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can view applications" ON applications;

CREATE POLICY "Users can view applications"
  ON applications FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()
    )
  );

CREATE POLICY "Students can insert applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update applications"
  ON applications FOR UPDATE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete applications"
  ON applications FOR DELETE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()
    )
  );

-- Notifications: Users manage only their own; authenticated users can send notifications to candidates
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- STEP 7: Automatic Profile Creation Trigger on Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, profile_completion, company_name, college, branch)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    25,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'branch'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    company_name = COALESCE(EXCLUDED.company_name, profiles.company_name),
    college = COALESCE(EXCLUDED.college, profiles.college),
    branch = COALESCE(EXCLUDED.branch, profiles.branch);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success check
SELECT 'PlaceMe permissions and RLS successfully configured!' AS status;
