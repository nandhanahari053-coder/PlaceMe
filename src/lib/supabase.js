import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────
// SUPABASE DATABASE SCHEMA (run this in Supabase SQL Editor)
// ─────────────────────────────────────────────────────────
/*
-- 1. Profiles (students & companies)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  college TEXT, degree TEXT, branch TEXT,
  graduation_year INT, cgpa DECIMAL(4,2),
  phone TEXT, skills TEXT[], bio TEXT,
  resume_url TEXT, profile_pic TEXT,
  linkedin_url TEXT, github_url TEXT,
  company_name TEXT, company_industry TEXT,
  company_size TEXT, company_location TEXT,
  profile_completion INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Companies
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, industry TEXT,
  description TEXT, location TEXT,
  website TEXT, size TEXT, logo TEXT,
  rating DECIMAL(2,1) DEFAULT 4.0,
  openings INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  posted_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL, description TEXT,
  requirements TEXT[], skills TEXT[],
  location TEXT, type TEXT,
  salary TEXT, stipend TEXT,
  duration TEXT, deadline DATE,
  category TEXT, is_remote BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  applicants_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Applications
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  student_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'Applied',
  cover_letter TEXT, resume_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Placement Drives
CREATE TABLE placement_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL, description TEXT,
  drive_date DATE, drive_time TEXT,
  location TEXT, eligibility TEXT,
  registration_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL, message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (enable in Supabase Dashboard)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students can view own applications" ON applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert applications" ON applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
*/

export default supabase;
