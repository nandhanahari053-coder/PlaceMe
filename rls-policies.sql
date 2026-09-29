-- ============================================================
-- PlaceMe - RLS Policies & Permissions Fix Script
-- Paste this into Supabase SQL Editor and click Run
-- URL: https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new
-- ============================================================

-- Step 1: Grant permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Step 2: Disable RLS on operational tables so anyone can read/write without RLS blocks
ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS placement_drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;

-- Step 3: Enable RLS on profiles and notifications
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop old conflicting policies
DROP POLICY IF EXISTS "Public can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can view applications" ON applications;
DROP POLICY IF EXISTS "Students can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can update applications" ON applications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Step 5: Profiles - Anyone authenticated can view (for recruiters viewing applicants), user can edit their own
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 6: Notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Step 7: Auto-Sync Applicant Count on Jobs
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

-- Resync existing applicant counts
UPDATE public.jobs j
SET applicants_count = COALESCE((
  SELECT COUNT(*) FROM public.applications a WHERE a.job_id = j.id
), 0);

SELECT 'Permissions and RLS successfully updated!' AS status;
