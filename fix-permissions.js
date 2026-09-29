/**
 * fix-permissions.js
 * Uses Supabase's pg_meta REST API to run SQL and grant permissions.
 * Run once: node fix-permissions.js
 */

const PROJECT_REF = 'oobjrxniwxkanroumxzv';
// Service role key
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYmpyeG5pd3hrYW5yb3VteHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU3OTMyNCwiZXhwIjoyMTA2MTU1MzI0fQ.0Vuh7UvAzZA2oxp-YlIJzZKgH6ftOeul1qC76xQKe_4';

const SQL = `
-- Grant permissions
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- Ensure companies table exists
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

-- Ensure jobs table exists
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

-- Ensure placement_drives table exists
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

-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
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

-- Ensure applications table exists
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

-- Ensure notifications table exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant service_role full access to all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
`;

async function runSQL() {
  console.log('🔧 Running SQL via Supabase Management API...\n');

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: SQL }),
    }
  );

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text.substring(0, 1000));

  if (res.ok) {
    console.log('\n✅ Permissions granted! Now run: node seed.js');
  } else {
    console.log('\n⚠️  Management API not available with service key.');
    console.log('👉 Please run the SQL manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/oobjrxniwxkanroumxzv/sql/new');
  }
}

runSQL().catch(console.error);
