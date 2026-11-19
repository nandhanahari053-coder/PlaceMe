/**
 * import-jobs.js
 * Imports job postings from jobs_data.xlsx into Supabase under lakshmi@gmail.com (recruiter)
 * Run: node import-jobs.js
 */
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Service role key (for admin writes)
const supabaseUrl = 'https://oobjrxniwxkanroumxzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYmpyeG5pd3hrYW5yb3VteHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU3OTMyNCwiZXhwIjoyMTA2MTU1MzI0fQ.0Vuh7UvAzZA2oxp-YlIJzZKgH6ftOeul1qC76xQKe_4';

const supabase = createClient(supabaseUrl, supabaseKey);

// lakshmi@gmail.com profile ID (recruiter)
const RECRUITER_ID = '383ce54e-bbf0-4225-8f88-32478243ac39';

function parseType(raw) {
  if (!raw) return 'Full-Time';
  const v = String(raw).toLowerCase();
  if (v.includes('intern') && v.includes('placement')) return 'Internship to Placement';
  if (v.includes('intern')) return 'Internship';
  if (v.includes('part')) return 'Part-Time';
  if (v.includes('contract')) return 'Contract';
  return 'Full-Time';
}

function parseSalary(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  return s;
}

function parseDate(raw) {
  if (!raw || String(raw).toLowerCase() === 'open' || String(raw).trim() === '') return null;
  // Try parsing as Excel serial number
  if (typeof raw === 'number') {
    const d = xlsx.SSF.parse_date_code(raw);
    if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
  }
  // Try parsing as string
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

async function getOrCreateCompany(name) {
  if (!name || !name.trim()) return null;
  const cleanName = name.trim();
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .ilike('name', cleanName)
    .maybeSingle();
  
  if (existing) return existing.id;
  
  // Create new company
  const { data: created, error } = await supabase
    .from('companies')
    .insert({ name: cleanName, industry: 'General', location: 'India' })
    .select('id')
    .maybeSingle();
  
  if (error) {
    console.error(`Failed to create company "${cleanName}":`, error.message);
    return null;
  }
  return created?.id;
}

async function main() {
  console.log('📂 Reading Excel file...');
  const wb = xlsx.readFile(join(__dirname, 'jobs_data.xlsx'));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
  console.log(`✅ Found ${rows.length} rows in Excel\n`);

  // Column name mapping (Excel headers have newlines)
  const COL = {
    oppId:      'Opportunity ID',
    company:    'Company Name',
    title:      'Role / Title',
    type:       'Type of \r\nOpportunity',
    salary:     'CTC Package (LPA)\r\n/ Stipend (₹/mo)',
    minCgpa:    'Min CGPA\r\nRequired',
    schools:    'Schools\r\nEligible',
    datePosted: 'Date Posted',
    deadline:   'Deadline',
    status:     'Status',
    positions:  'NO of positions available',
    applied:    'Total\r\nApplied',
  };

  const companyCache = {};
  const jobsToInsert = [];
  let skipped = 0;

  for (const row of rows) {
    const title = String(row[COL.title] || '').trim();
    const companyName = String(row[COL.company] || '').trim();
    
    if (!title) { skipped++; continue; }

    // Get/create company (cached)
    if (companyName && !companyCache[companyName]) {
      companyCache[companyName] = await getOrCreateCompany(companyName);
    }
    const companyId = companyName ? companyCache[companyName] : null;

    const salaryRaw = parseSalary(row[COL.salary]);
    const typeRaw = String(row[COL.type] || '').trim();
    const isInternship = typeRaw.toLowerCase().includes('intern');
    
    const deadlineRaw = row[COL.deadline];
    const deadline = parseDate(deadlineRaw);
    
    const isActive = String(row[COL.status] || '').toLowerCase() !== 'closed';
    
    const eligibility = String(row[COL.schools] || '').trim();
    const minCgpa = row[COL.minCgpa] ? String(row[COL.minCgpa]).trim() : null;
    
    const requirements = [];
    if (eligibility) requirements.push(`Eligible: ${eligibility}`);
    if (minCgpa) requirements.push(`Min CGPA: ${minCgpa}`);

    const positions = parseInt(row[COL.positions]) || 0;

    jobsToInsert.push({
      posted_by: RECRUITER_ID,
      company_id: companyId,
      title: title,
      description: `${title} opportunity at ${companyName}.${eligibility ? ' Eligible schools: ' + eligibility + '.' : ''}`,
      type: parseType(typeRaw),
      salary: !isInternship ? salaryRaw : null,
      stipend: isInternship ? salaryRaw : null,
      location: 'India',
      category: 'General',
      requirements: requirements.length ? requirements : null,
      skills: [],
      deadline: deadline,
      is_active: isActive,
      is_remote: false,
      applicants_count: parseInt(row[COL.applied]) || 0,
    });
  }

  console.log(`📝 ${jobsToInsert.length} jobs ready to insert, ${skipped} rows skipped (no title)\n`);

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < jobsToInsert.length; i += BATCH) {
    const batch = jobsToInsert.slice(i, i + BATCH);
    const { data, error } = await supabase.from('jobs').insert(batch).select('id');
    if (error) {
      console.error(`❌ Batch ${Math.floor(i/BATCH)+1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += data.length;
      console.log(`✅ Batch ${Math.floor(i/BATCH)+1}: inserted ${data.length} jobs (total: ${inserted})`);
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`🎉 Done! Inserted: ${inserted} | Errors: ${errors} | Skipped: ${skipped}`);
  console.log('─'.repeat(50));
}

main().catch(console.error);
