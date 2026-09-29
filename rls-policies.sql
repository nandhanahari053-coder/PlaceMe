-- ============================================================
-- PlaceMe - RLS Policies ONLY (tables already exist)
-- Paste this into Supabase SQL Editor and click Run
-- URL: https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new
-- ============================================================

-- Step 1: Grant permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Step 2: Disable RLS on public tables (anyone can read jobs/companies)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE placement_drives DISABLE ROW LEVEL SECURITY;

-- Step 3: Enable RLS on private tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop old conflicting policies (safe even if they don't exist)
DROP POLICY IF EXISTS "Allow public read on companies" ON companies;
DROP POLICY IF EXISTS "Allow public read on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow public read on placement_drives" ON placement_drives;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view own applications" ON applications;
DROP POLICY IF EXISTS "Students can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

-- Step 4: Profiles - users manage only their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Applications - students see/submit only their own; employers see for their jobs
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
  ON applications FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update applications"
  ON applications FOR UPDATE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()
    )
  );

-- Step 6: Notifications - users see only their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
