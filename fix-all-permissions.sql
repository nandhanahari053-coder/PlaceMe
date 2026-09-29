-- ============================================================
-- PlaceMe - Complete Database Permissions & Fix Script
-- ============================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new
--
-- What this fixes:
-- 1. ERROR: Applications showing 0 in Recruiter / Company section
-- 2. Grants full SELECT / INSERT / UPDATE / DELETE rights to 'authenticated' and 'anon'
-- 3. Disables RLS on operational tables (companies, jobs, applications)
--    so recruiters can view candidates and students can apply seamlessly
-- 4. Auto-increments applicants_count on jobs whenever a student applies
-- 5. Auto-creates profile row whenever a new user signs up
-- ============================================================

-- STEP 1: Grant Schema Access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- STEP 2: Grant Table Privileges to Authenticated and Anon
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- STEP 3: Auto-grant on any future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- STEP 4: Configure Row Level Security (RLS)
-- Operational tables: Disable RLS so employers can see all applications submitted for their jobs,
-- and students can browse and apply without RLS blocking subqueries
ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS placement_drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;

-- Private tables:
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- STEP 5: Clean RLS Policies for Profiles & Notifications
DROP POLICY IF EXISTS "Public can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert own profile" ON profiles;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Notifications:
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- STEP 6: Auto-Sync Applicant Count on Jobs
CREATE OR REPLACE FUNCTION public.handle_application_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.jobs
    SET applicants_count = COALESCE(applicants_count, 0) + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.jobs
    SET applicants_count = GREATEST(COALESCE(applicants_count, 1) - 1, 0)
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_application_count ON public.applications;
CREATE TRIGGER tr_application_count
  AFTER INSERT OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_count();

-- Resync applicants_count for all existing jobs right now
UPDATE public.jobs j
SET applicants_count = COALESCE((
  SELECT COUNT(*) FROM public.applications a WHERE a.job_id = j.id
), 0);

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
SELECT 'PlaceMe permissions, RLS, and applicant counting successfully configured!' AS status;
