import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Insert Companies
  const companies = [
    { name: 'Google', industry: 'Technology', description: 'Search and advertising giant.', location: 'Bangalore', website: 'https://google.com', size: '10000+', logo: 'G', rating: 4.8, openings: 15 },
    { name: 'Microsoft', industry: 'Technology', description: 'Empowering every person and organization.', location: 'Hyderabad', website: 'https://microsoft.com', size: '10000+', logo: 'M', rating: 4.7, openings: 12 },
    { name: 'Amazon', industry: 'E-commerce', description: 'Earths most customer-centric company.', location: 'Chennai', website: 'https://amazon.com', size: '10000+', logo: 'A', rating: 4.5, openings: 30 }
  ];

  const { data: insertedCompanies, error: compError } = await supabase
    .from('companies')
    .insert(companies)
    .select();

  if (compError) {
    console.error("❌ Error inserting companies:", compError.message);
    return;
  }
  console.log(`✅ Inserted ${insertedCompanies.length} companies.`);

  // 2. Insert Jobs
  const jobs = [
    { company_id: insertedCompanies[0].id, title: 'Software Engineer Intern', description: 'Work on Google Search infrastructure.', category: 'Engineering', type: 'Internship', location: 'Bangalore', stipend: '₹1,00,000/mo', duration: '6 months', deadline: '2027-01-01', skills: ['C++', 'Python', 'Go'] },
    { company_id: insertedCompanies[1].id, title: 'Data Scientist', description: 'Analyze large datasets for Azure.', category: 'Data Science', type: 'Full-Time', location: 'Hyderabad', salary: '₹20,00,000/yr', deadline: '2027-02-15', skills: ['Python', 'SQL', 'Machine Learning'] },
    { company_id: insertedCompanies[2].id, title: 'Product Manager Intern', description: 'Manage AWS cloud product roadmap.', category: 'Product', type: 'Internship', location: 'Chennai', stipend: '₹80,000/mo', duration: '3 months', deadline: '2027-03-10', skills: ['Product Strategy', 'Agile', 'Communication'] }
  ];

  const { data: insertedJobs, error: jobError } = await supabase
    .from('jobs')
    .insert(jobs)
    .select();

  if (jobError) {
    console.error("❌ Error inserting jobs:", jobError.message);
    return;
  }
  console.log(`✅ Inserted ${insertedJobs.length} jobs.`);

  // 3. Insert Drives
  const drives = [
    { company_id: insertedCompanies[0].id, title: 'Google Campus Hiring 2027', description: 'Hiring for multiple engineering roles.', drive_date: '2027-04-10', drive_time: '10:00 AM', location: 'Main Auditorium', eligibility: 'B.Tech CS/IT with 8.0+ CGPA', registration_deadline: '2027-04-01' },
    { company_id: insertedCompanies[1].id, title: 'Microsoft Idea-thon', description: 'Solve real world problems.', drive_date: '2027-05-15', drive_time: '09:00 AM', location: 'Virtual', eligibility: 'Open to all', registration_deadline: '2027-05-10' }
  ];

  const { data: insertedDrives, error: driveError } = await supabase
    .from('placement_drives')
    .insert(drives)
    .select();

  if (driveError) {
    console.error("❌ Error inserting drives:", driveError.message);
    return;
  }
  console.log(`✅ Inserted ${insertedDrives.length} placement drives.`);

  console.log("🎉 Seeding complete! You can now view the data on your frontend.");
}

seed();
