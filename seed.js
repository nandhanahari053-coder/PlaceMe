import { createClient } from '@supabase/supabase-js';

// ── Service Role credentials for seeding (NEVER commit this to git!) ──
const supabaseUrl = 'https://oobjrxniwxkanroumxzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYmpyeG5pd3hrYW5yb3VteHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU3OTMyNCwiZXhwIjoyMTA2MTU1MzI0fQ.0Vuh7UvAzZA2oxp-YlIJzZKgH6ftOeul1qC76xQKe_4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting PlaceMe Database Seeding...\n');

  // ── 1. Insert Companies ──────────────────────────────────────────
  console.log('📦 Inserting companies...');
  const { data: insertedCompanies, error: compError } = await supabase
    .from('companies')
    .insert([
      {
        name: 'Google',
        industry: 'Technology',
        description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
        location: 'Bangalore, Karnataka',
        website: 'https://careers.google.com',
        size: '10,000+',
        logo: 'G',
        rating: 4.8,
        openings: 15,
      },
      {
        name: 'Microsoft',
        industry: 'Technology',
        description: 'Microsoft Corporation is an American multinational technology corporation empowering every person and organization on the planet to achieve more.',
        location: 'Hyderabad, Telangana',
        website: 'https://careers.microsoft.com',
        size: '10,000+',
        logo: 'M',
        rating: 4.7,
        openings: 12,
      },
      {
        name: 'Amazon',
        industry: 'E-Commerce & Cloud',
        description: "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, and digital streaming.",
        location: 'Chennai, Tamil Nadu',
        website: 'https://amazon.jobs',
        size: '10,000+',
        logo: 'A',
        rating: 4.5,
        openings: 30,
      },
      {
        name: 'Infosys',
        industry: 'IT Services',
        description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, IT and outsourcing services.',
        location: 'Pune, Maharashtra',
        website: 'https://www.infosys.com/careers',
        size: '10,000+',
        logo: 'I',
        rating: 4.2,
        openings: 50,
      },
      {
        name: 'Flipkart',
        industry: 'E-Commerce',
        description: 'Flipkart Private Limited is an Indian e-commerce company, headquartered in Bangalore, and incorporated in Singapore.',
        location: 'Bangalore, Karnataka',
        website: 'https://www.flipkartcareers.com',
        size: '5,000-10,000',
        logo: 'F',
        rating: 4.3,
        openings: 25,
      },
      {
        name: 'Tata Consultancy Services',
        industry: 'IT Services',
        description: 'TCS is an Indian multinational information technology services and consulting company.',
        location: 'Mumbai, Maharashtra',
        website: 'https://www.tcs.com/careers',
        size: '10,000+',
        logo: 'T',
        rating: 4.1,
        openings: 100,
      },
    ])
    .select();

  if (compError) {
    console.error('❌ Error inserting companies:', compError.message);
    console.error('Details:', compError.details);
    return;
  }
  console.log(`✅ Inserted ${insertedCompanies.length} companies.\n`);

  // Helper to get company id by name
  const cid = (name) => insertedCompanies.find((c) => c.name === name)?.id;

  // ── 2. Insert Jobs ───────────────────────────────────────────────
  console.log('💼 Inserting jobs...');
  const { data: insertedJobs, error: jobError } = await supabase
    .from('jobs')
    .insert([
      {
        company_id: cid('Google'),
        title: 'Software Engineer Intern',
        description: 'Join Google Search infrastructure team and work on large-scale distributed systems. You will be involved in designing, building, testing, and deploying complex software systems.',
        category: 'Engineering',
        type: 'Internship',
        location: 'Bangalore, Karnataka',
        stipend: '₹1,00,000/mo',
        duration: '6 months',
        deadline: '2027-01-15',
        skills: ['C++', 'Python', 'Go', 'Distributed Systems'],
        is_active: true,
        is_remote: false,
        applicants_count: 340,
      },
      {
        company_id: cid('Google'),
        title: 'UX Research Intern',
        description: 'Work with the Google Workspace team to understand user needs and inform product decisions through qualitative and quantitative research.',
        category: 'Design',
        type: 'Internship',
        location: 'Bangalore, Karnataka',
        stipend: '₹80,000/mo',
        duration: '3 months',
        deadline: '2027-02-01',
        skills: ['User Research', 'Figma', 'Data Analysis', 'Communication'],
        is_active: true,
        is_remote: false,
        applicants_count: 120,
      },
      {
        company_id: cid('Microsoft'),
        title: 'Data Scientist',
        description: 'Work with the Azure AI team to analyze large datasets, build machine learning models, and drive data-informed decisions for Azure cloud products.',
        category: 'Data Science',
        type: 'Full-Time',
        location: 'Hyderabad, Telangana',
        salary: '₹22,00,000/yr',
        deadline: '2027-02-15',
        skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Azure'],
        is_active: true,
        is_remote: true,
        applicants_count: 210,
      },
      {
        company_id: cid('Microsoft'),
        title: 'Software Development Engineer',
        description: 'Join the Microsoft Teams engineering team to build features used by millions of users worldwide. Contribute to backend services and APIs.',
        category: 'Engineering',
        type: 'Full-Time',
        location: 'Hyderabad, Telangana',
        salary: '₹25,00,000/yr',
        deadline: '2027-03-01',
        skills: ['C#', '.NET', 'Azure', 'SQL', 'TypeScript'],
        is_active: true,
        is_remote: false,
        applicants_count: 450,
      },
      {
        company_id: cid('Amazon'),
        title: 'Product Manager Intern',
        description: 'Manage AWS cloud product roadmap and work with engineering and design teams to deliver high-impact features for enterprise customers.',
        category: 'Product',
        type: 'Internship',
        location: 'Chennai, Tamil Nadu',
        stipend: '₹85,000/mo',
        duration: '3 months',
        deadline: '2027-03-10',
        skills: ['Product Strategy', 'Agile', 'SQL', 'Communication', 'AWS'],
        is_active: true,
        is_remote: false,
        applicants_count: 180,
      },
      {
        company_id: cid('Amazon'),
        title: 'SDE-1 Full Stack Engineer',
        description: 'Build and scale the Amazon Marketplace platform serving millions of sellers. Work with React, Node.js, and AWS to ship new features.',
        category: 'Engineering',
        type: 'Full-Time',
        location: 'Chennai, Tamil Nadu',
        salary: '₹20,00,000/yr',
        deadline: '2027-04-05',
        skills: ['React', 'Node.js', 'AWS', 'DynamoDB', 'TypeScript'],
        is_active: true,
        is_remote: true,
        applicants_count: 520,
      },
      {
        company_id: cid('Infosys'),
        title: 'Systems Engineer',
        description: 'Work as a systems engineer supporting enterprise clients across industries including banking, retail, and healthcare.',
        category: 'Engineering',
        type: 'Full-Time',
        location: 'Pune, Maharashtra',
        salary: '₹4,50,000/yr',
        deadline: '2027-04-20',
        skills: ['Java', 'Spring Boot', 'SQL', 'REST APIs'],
        is_active: true,
        is_remote: false,
        applicants_count: 900,
      },
      {
        company_id: cid('Flipkart'),
        title: 'ML Engineer Intern',
        description: "Build recommendation systems and improve search relevance for Flipkart's catalog of 100+ million products using cutting-edge ML.",
        category: 'Data Science',
        type: 'Internship',
        location: 'Bangalore, Karnataka',
        stipend: '₹70,000/mo',
        duration: '6 months',
        deadline: '2027-05-01',
        skills: ['Python', 'PyTorch', 'Recommendation Systems', 'NLP', 'Spark'],
        is_active: true,
        is_remote: false,
        applicants_count: 230,
      },
      {
        company_id: cid('Tata Consultancy Services'),
        title: 'IT Analyst Trainee',
        description: 'Join TCS as a fresher and go through a comprehensive training program before being placed on client projects globally.',
        category: 'Engineering',
        type: 'Full-Time',
        location: 'Mumbai, Maharashtra',
        salary: '₹3,80,000/yr',
        deadline: '2027-06-01',
        skills: ['Java', 'Python', 'Problem Solving', 'Communication'],
        is_active: true,
        is_remote: false,
        applicants_count: 1200,
      },
    ])
    .select();

  if (jobError) {
    console.error('❌ Error inserting jobs:', jobError.message);
    console.error('Details:', jobError.details);
    return;
  }
  console.log(`✅ Inserted ${insertedJobs.length} jobs.\n`);

  // ── 3. Insert Placement Drives ───────────────────────────────────
  console.log('📅 Inserting placement drives...');
  const { data: insertedDrives, error: driveError } = await supabase
    .from('placement_drives')
    .insert([
      {
        company_id: cid('Google'),
        title: 'Google Campus Hiring Drive 2027',
        description: 'Google is conducting a campus hiring drive for Software Engineering and UX roles. Students will go through coding rounds, technical interviews, and a final HR interview.',
        drive_date: '2027-04-10',
        drive_time: '10:00 AM',
        location: 'Main Auditorium, Block A',
        eligibility: 'B.Tech / B.E. in CS, IT, or ECE with 8.0+ CGPA. No active backlogs.',
        registration_deadline: '2027-04-01',
        is_active: true,
      },
      {
        company_id: cid('Microsoft'),
        title: 'Microsoft Idea-thon 2027',
        description: 'Microsoft is hosting a 24-hour virtual hackathon. Top teams will be offered pre-placement interviews for SDE and PM roles.',
        drive_date: '2027-05-15',
        drive_time: '09:00 AM',
        location: 'Virtual (Microsoft Teams)',
        eligibility: 'Open to all branches. Team of 2-4 members.',
        registration_deadline: '2027-05-10',
        is_active: true,
      },
      {
        company_id: cid('Amazon'),
        title: 'Amazon SDE Recruitment Drive',
        description: 'Amazon will conduct an online coding test followed by technical and behavioral interviews for SDE and PM positions.',
        drive_date: '2027-06-05',
        drive_time: '11:00 AM',
        location: 'CS Department Seminar Hall',
        eligibility: 'B.Tech / M.Tech in any branch with 7.5+ CGPA.',
        registration_deadline: '2027-05-25',
        is_active: true,
      },
      {
        company_id: cid('Infosys'),
        title: 'Infosys InfyTQ Mass Recruitment',
        description: 'Infosys is conducting mass recruitment for Systems Engineer roles. Students who have completed the InfyTQ certification are preferred.',
        drive_date: '2027-06-20',
        drive_time: '09:30 AM',
        location: 'Placement Cell, Ground Floor',
        eligibility: 'Open to all B.Tech branches. Min 60% throughout academics.',
        registration_deadline: '2027-06-10',
        is_active: true,
      },
      {
        company_id: cid('Flipkart'),
        title: 'Flipkart Runway Program',
        description: 'Flipkart Runway is a premium on-campus internship program for students passionate about e-commerce and technology.',
        drive_date: '2027-07-12',
        drive_time: '10:00 AM',
        location: 'Innovation Lab, Block C',
        eligibility: 'Pre-final year students. B.Tech CS/IT with 8.5+ CGPA.',
        registration_deadline: '2027-07-01',
        is_active: true,
      },
    ])
    .select();

  if (driveError) {
    console.error('❌ Error inserting placement drives:', driveError.message);
    console.error('Details:', driveError.details);
    return;
  }
  console.log(`✅ Inserted ${insertedDrives.length} placement drives.\n`);

  console.log('─'.repeat(50));
  console.log('🎉 Seeding complete! Your PlaceMe database is ready.');
  console.log('─'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   🏢 Companies:        ${insertedCompanies.length}`);
  console.log(`   💼 Jobs:             ${insertedJobs.length}`);
  console.log(`   📅 Placement Drives: ${insertedDrives.length}`);
  console.log('\n🚀 Now run: npm run dev');
}

seed().catch(console.error);
