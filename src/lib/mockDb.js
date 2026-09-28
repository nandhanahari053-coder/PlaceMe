// ─────────────────────────────────────────────────────────────────────────────
// Mock Database — simulates Supabase using localStorage
// Automatically seeds realistic data on first load
// ─────────────────────────────────────────────────────────────────────────────

const SEED_KEY = 'spp_seeded_v2';
const USERS_KEY = 'spp_users';
const PROFILES_KEY = 'spp_profiles';
const JOBS_KEY = 'spp_jobs';
const COMPANIES_KEY = 'spp_companies';
const APPLICATIONS_KEY = 'spp_applications';
const DRIVES_KEY = 'spp_drives';
const NOTIFICATIONS_KEY = 'spp_notifications';

const uuid = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_COMPANIES = [
  { id: 'c1', name: 'Google', industry: 'Technology', location: 'Bengaluru, India', size: '100,000+', rating: 4.8, openings: 12, logo: '🔵', description: 'Google LLC is a global leader in online advertising, search engine technology, cloud computing, and artificial intelligence.' },
  { id: 'c2', name: 'Microsoft', industry: 'Technology', location: 'Hyderabad, India', size: '220,000+', rating: 4.7, openings: 9, logo: '🟦', description: 'Microsoft develops software, services, and devices that empower every person and organization on the planet.' },
  { id: 'c3', name: 'Amazon', industry: 'E-Commerce & Cloud', location: 'Pune, India', size: '1,500,000+', rating: 4.3, openings: 18, logo: '🟠', description: 'Amazon is a multinational technology company focused on e-commerce, cloud computing, and AI.' },
  { id: 'c4', name: 'Flipkart', industry: 'E-Commerce', location: 'Bengaluru, India', size: '30,000+', rating: 4.2, openings: 7, logo: '🛍️', description: "India's leading e-commerce marketplace connecting millions of buyers and sellers." },
  { id: 'c5', name: 'Infosys', industry: 'IT Services', location: 'Mysuru, India', size: '300,000+', rating: 4.0, openings: 25, logo: '💎', description: 'Infosys is a global leader in next-generation digital services and consulting.' },
  { id: 'c6', name: 'Razorpay', industry: 'Fintech', location: 'Bengaluru, India', size: '3,000+', rating: 4.6, openings: 5, logo: '💳', description: "India's leading payment gateway and financial infrastructure for internet businesses." },
  { id: 'c7', name: 'Wipro', industry: 'IT Services', location: 'Bengaluru, India', size: '200,000+', rating: 3.9, openings: 30, logo: '🌐', description: 'Wipro is a leading global information technology, consulting and business process services company.' },
  { id: 'c8', name: 'Zomato', industry: 'Food Technology', location: 'Gurugram, India', size: '5,000+', rating: 4.1, openings: 8, logo: '🍕', description: 'Zomato is India\'s leading food delivery and restaurant discovery platform.' },
];

const SEED_JOBS = [
  { id: 'j1', company_id: 'c1', title: 'Software Engineer Intern', location: 'Bengaluru, India', type: 'Internship', duration: '6 months', stipend: '₹80,000/month', salary: null, skills: ['Python', 'JavaScript', 'Data Structures', 'Algorithms'], description: 'Join the Google team as a Software Engineer intern and work on cutting-edge products used by billions worldwide.', requirements: ['Pursuing B.Tech/M.Tech in CS or related field', 'Proficiency in at least one programming language', 'Strong problem-solving skills', 'CGPA of 7.5+'], deadline: '2026-10-15', category: 'Engineering', is_remote: false, is_active: true, applicants_count: 342, created_at: '2026-09-10T00:00:00Z' },
  { id: 'j2', company_id: 'c6', title: 'Full Stack Developer', location: 'Remote', type: 'Full-Time', duration: 'Permanent', stipend: null, salary: '₹18-24 LPA', skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'], description: "Build and scale Razorpay's core payment infrastructure serving millions of transactions daily.", requirements: ['B.Tech in CS or equivalent', '0-2 years experience', 'Strong knowledge of React and Node.js', 'Understanding of system design'], deadline: '2026-10-30', category: 'Engineering', is_remote: true, is_active: true, applicants_count: 189, created_at: '2026-09-15T00:00:00Z' },
  { id: 'j3', company_id: 'c3', title: 'Data Science Intern', location: 'Pune, India', type: 'Internship', duration: '3 months', stipend: '₹60,000/month', salary: null, skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'], description: "Work with Amazon's data science team to develop ML models that power recommendations and logistics.", requirements: ['Pursuing B.Tech/M.Tech or MBA', 'Knowledge of Python and ML frameworks', 'Experience with data analysis', 'CGPA 8.0+'], deadline: '2026-10-10', category: 'Data Science', is_remote: false, is_active: true, applicants_count: 278, created_at: '2026-09-12T00:00:00Z' },
  { id: 'j4', company_id: 'c4', title: 'Product Manager', location: 'Bengaluru, India', type: 'Full-Time', duration: 'Permanent', stipend: null, salary: '₹20-30 LPA', skills: ['Product Strategy', 'Analytics', 'SQL', 'Agile'], description: 'Define product roadmaps and work with cross-functional teams to deliver features that delight millions of customers.', requirements: ['MBA or B.Tech + 1-2 years experience', 'Strong analytical mindset', 'Experience with product analytics tools', 'Excellent communication skills'], deadline: '2026-11-05', category: 'Product', is_remote: false, is_active: true, applicants_count: 156, created_at: '2026-09-18T00:00:00Z' },
  { id: 'j5', company_id: 'c2', title: 'Cloud Solutions Architect', location: 'Hyderabad, India', type: 'Full-Time', duration: 'Permanent', stipend: null, salary: '₹25-35 LPA', skills: ['Azure', 'Cloud Architecture', 'DevOps', 'Kubernetes'], description: "Design and implement cloud solutions for Microsoft's enterprise customers leveraging Azure.", requirements: ['B.Tech/M.Tech in CS or IT', '0-3 years experience', 'Azure or AWS certification preferred', 'Knowledge of DevOps practices'], deadline: '2026-11-20', category: 'Cloud', is_remote: false, is_active: true, applicants_count: 95, created_at: '2026-09-20T00:00:00Z' },
  { id: 'j6', company_id: 'c5', title: 'UI/UX Design Intern', location: 'Bengaluru, India', type: 'Internship', duration: '6 months', stipend: '₹25,000/month', salary: null, skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'], description: 'Create intuitive and beautiful user interfaces for Infosys enterprise applications.', requirements: ['Pursuing B.Des or B.Tech', 'Proficient in Figma or Adobe XD', 'Portfolio of design work', 'Understanding of design principles'], deadline: '2026-10-25', category: 'Design', is_remote: false, is_active: true, applicants_count: 203, created_at: '2026-09-14T00:00:00Z' },
  { id: 'j7', company_id: 'c6', title: 'Backend Engineer', location: 'Remote', type: 'Full-Time', duration: 'Permanent', stipend: null, salary: '₹20-28 LPA', skills: ['Go', 'Java', 'Kafka', 'Microservices'], description: 'Build highly scalable backend services handling millions of financial transactions.', requirements: ['B.Tech in CS', 'Strong in Java or Go', 'Experience with distributed systems', '0-2 years experience'], deadline: '2026-11-01', category: 'Engineering', is_remote: true, is_active: true, applicants_count: 134, created_at: '2026-09-22T00:00:00Z' },
  { id: 'j8', company_id: 'c1', title: 'Machine Learning Engineer', location: 'Bengaluru, India', type: 'Full-Time', duration: 'Permanent', stipend: null, salary: '₹30-50 LPA', skills: ['TensorFlow', 'PyTorch', 'Python', 'MLOps'], description: "Develop and deploy ML models at scale that power Google's AI products.", requirements: ['M.Tech/PhD in CS or ML', 'Strong publication record preferred', 'Experience with deep learning', '1-3 years experience'], deadline: '2026-12-01', category: 'Data Science', is_remote: false, is_active: true, applicants_count: 421, created_at: '2026-09-21T00:00:00Z' },
  { id: 'j9', company_id: 'c7', title: 'Business Analyst Intern', location: 'Bengaluru, India', type: 'Internship', duration: '6 months', stipend: '₹30,000/month', salary: null, skills: ['Excel', 'SQL', 'Tableau', 'Communication'], description: 'Analyse business requirements and translate them into technical solutions for global clients.', requirements: ['Pursuing MBA or B.Tech', 'Proficiency in Excel and SQL', 'Good communication skills', 'Analytical mindset'], deadline: '2026-10-20', category: 'Business', is_remote: false, is_active: true, applicants_count: 167, created_at: '2026-09-16T00:00:00Z' },
  { id: 'j10', company_id: 'c8', title: 'Android Developer', location: 'Gurugram, India', type: 'Full-Time', duration: 'Permanent', stipend: null, salary: '₹15-22 LPA', skills: ['Kotlin', 'Java', 'Android SDK', 'REST APIs'], description: "Build and maintain Zomato's Android app used by millions of food lovers across India.", requirements: ['B.Tech in CS or IT', 'Strong in Kotlin or Java', 'Experience with Android development', '0-2 years experience'], deadline: '2026-11-10', category: 'Engineering', is_remote: false, is_active: true, applicants_count: 211, created_at: '2026-09-19T00:00:00Z' },
];

const SEED_DRIVES = [
  { id: 'd1', company_id: 'c1', title: 'Google Campus Drive 2026', description: 'Google is visiting campus for Software Engineer and Data Analyst roles. Eligible students from CS, IT, and ECE branches can apply.', drive_date: '2026-10-20', drive_time: '09:00 AM', location: 'Main Auditorium, Block A', eligibility: 'B.Tech/M.Tech CS/IT/ECE | CGPA ≥ 7.5 | No active backlogs', registration_deadline: '2026-10-12', is_active: true, created_at: '2026-09-15T00:00:00Z' },
  { id: 'd2', company_id: 'c2', title: 'Microsoft Hiring Challenge', description: 'Microsoft is conducting an online hiring challenge followed by technical interviews for freshers.', drive_date: '2026-10-25', drive_time: '10:00 AM', location: 'Online (Microsoft Teams)', eligibility: 'B.Tech CS/IT | CGPA ≥ 8.0 | 2026 Batch', registration_deadline: '2026-10-15', is_active: true, created_at: '2026-09-18T00:00:00Z' },
  { id: 'd3', company_id: 'c5', title: 'Infosys Mass Recruitment Drive', description: 'Infosys is conducting a mass recruitment for Systems Engineer and Digital Specialist Engineer roles for 2026 batch.', drive_date: '2026-11-05', drive_time: '08:30 AM', location: 'Seminar Hall, CSE Department', eligibility: 'B.Tech/BCA/MCA | All Branches | CGPA ≥ 6.5', registration_deadline: '2026-10-28', is_active: true, created_at: '2026-09-20T00:00:00Z' },
  { id: 'd4', company_id: 'c8', title: 'Zomato Product & Tech Hiring', description: 'Zomato is hiring for SDE, Data Analyst, and Product Manager roles. Exciting opportunity to work on India\'s largest food-tech platform.', drive_date: '2026-11-15', drive_time: '11:00 AM', location: 'Online', eligibility: 'B.Tech/MBA | CS/IT/Management | CGPA ≥ 7.0', registration_deadline: '2026-11-05', is_active: true, created_at: '2026-09-22T00:00:00Z' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const get = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};
const set = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const getOne = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

export const seedDatabase = () => {
  if (localStorage.getItem(SEED_KEY)) return;
  set(COMPANIES_KEY, SEED_COMPANIES);
  set(JOBS_KEY, SEED_JOBS);
  set(DRIVES_KEY, SEED_DRIVES);
  set(USERS_KEY, []);
  set(PROFILES_KEY, []);
  set(APPLICATIONS_KEY, []);
  set(NOTIFICATIONS_KEY, []);
  localStorage.setItem(SEED_KEY, 'true');
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const mockAuth = {
  signUp: ({ email, password, name, role, college, branch, company_name }) => {
    const users = get(USERS_KEY);
    if (users.find(u => u.email === email)) {
      return { error: { message: 'User with this email already exists.' } };
    }
    const id = uuid();
    const user = { id, email, password, role };
    users.push(user);
    set(USERS_KEY, users);

    const profiles = get(PROFILES_KEY);
    const profile = {
      id, name, email, role,
      college: college || '',
      branch: branch || '',
      degree: '',
      graduation_year: null,
      cgpa: null,
      phone: '',
      skills: [],
      bio: '',
      resume_url: '',
      profile_pic: '',
      linkedin_url: '',
      github_url: '',
      company_name: company_name || '',
      company_industry: '',
      company_size: '',
      company_location: '',
      profile_completion: role === 'student' ? 20 : 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles.push(profile);
    set(PROFILES_KEY, profiles);

    // Welcome notification
    const notifs = get(NOTIFICATIONS_KEY);
    notifs.push({
      id: uuid(), user_id: id,
      title: '🎉 Welcome to PlaceMe!',
      message: `Hi ${name}! Your account has been created successfully. Complete your profile to get started.`,
      type: 'success', is_read: false,
      created_at: new Date().toISOString(),
    });
    if (role === 'student') {
      notifs.push({
        id: uuid(), user_id: id,
        title: '📋 Complete Your Profile',
        message: 'Add your skills, CGPA, and upload a resume to improve your visibility to recruiters.',
        type: 'info', is_read: false,
        created_at: new Date().toISOString(),
      });
      notifs.push({
        id: uuid(), user_id: id,
        title: '🏢 Google Campus Drive 2026',
        message: 'Google is visiting campus on Oct 20. Register before Oct 12!',
        type: 'drive', is_read: false,
        created_at: new Date().toISOString(),
      });
    }
    set(NOTIFICATIONS_KEY, notifs);

    localStorage.setItem('spp_session', JSON.stringify({ user, profile }));
    return { data: { user, profile }, error: null };
  },

  signIn: ({ email, password }) => {
    const users = get(USERS_KEY);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { error: { message: 'Invalid email or password.' } };
    const profiles = get(PROFILES_KEY);
    const profile = profiles.find(p => p.id === user.id);
    localStorage.setItem('spp_session', JSON.stringify({ user, profile }));
    return { data: { user, profile }, error: null };
  },

  signOut: () => {
    localStorage.removeItem('spp_session');
    return { error: null };
  },

  getSession: () => {
    const session = getOne('spp_session');
    return session || null;
  },
};

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const mockProfiles = {
  get: (id) => {
    const profiles = get(PROFILES_KEY);
    return profiles.find(p => p.id === id) || null;
  },
  update: (id, updates) => {
    const profiles = get(PROFILES_KEY);
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return { error: { message: 'Profile not found' } };
    profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
    // Recalculate completion
    const p = profiles[idx];
    let score = 0;
    if (p.name) score += 10;
    if (p.email) score += 10;
    if (p.phone) score += 10;
    if (p.college) score += 10;
    if (p.branch) score += 10;
    if (p.cgpa) score += 10;
    if (p.skills?.length > 0) score += 15;
    if (p.bio) score += 10;
    if (p.resume_url) score += 15;
    profiles[idx].profile_completion = score;
    set(PROFILES_KEY, profiles);
    // Update session
    const session = getOne('spp_session');
    if (session) {
      session.profile = profiles[idx];
      localStorage.setItem('spp_session', JSON.stringify(session));
    }
    return { data: profiles[idx], error: null };
  },
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const mockJobs = {
  getAll: ({ category, type, search, remote } = {}) => {
    let jobs = get(JOBS_KEY);
    const companies = get(COMPANIES_KEY);
    jobs = jobs.map(j => ({
      ...j,
      company: companies.find(c => c.id === j.company_id) || {},
    }));
    if (category && category !== 'All') jobs = jobs.filter(j => j.category === category);
    if (type && type !== 'All') jobs = jobs.filter(j => j.type === type);
    if (remote === true) jobs = jobs.filter(j => j.is_remote);
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company?.name?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.skills?.some(s => s.toLowerCase().includes(q))
      );
    }
    return jobs;
  },
  getById: (id) => {
    const jobs = get(JOBS_KEY);
    const companies = get(COMPANIES_KEY);
    const job = jobs.find(j => j.id === id);
    if (!job) return null;
    return { ...job, company: companies.find(c => c.id === job.company_id) || {} };
  },
  create: (jobData) => {
    const jobs = get(JOBS_KEY);
    const newJob = { id: uuid(), ...jobData, applicants_count: 0, is_active: true, created_at: new Date().toISOString() };
    jobs.push(newJob);
    set(JOBS_KEY, jobs);
    return { data: newJob, error: null };
  },
  getByCompany: (companyId) => {
    const jobs = get(JOBS_KEY);
    return jobs.filter(j => j.company_id === companyId);
  },
};

// ─── Companies ────────────────────────────────────────────────────────────────

export const mockCompanies = {
  getAll: ({ search } = {}) => {
    let companies = get(COMPANIES_KEY);
    if (search) {
      const q = search.toLowerCase();
      companies = companies.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
      );
    }
    return companies;
  },
  getById: (id) => {
    const companies = get(COMPANIES_KEY);
    return companies.find(c => c.id === id) || null;
  },
};

// ─── Applications ─────────────────────────────────────────────────────────────

export const mockApplications = {
  apply: ({ job_id, student_id, cover_letter, resume_url }) => {
    const apps = get(APPLICATIONS_KEY);
    if (apps.find(a => a.job_id === job_id && a.student_id === student_id)) {
      return { error: { message: 'You have already applied for this job.' } };
    }
    const newApp = {
      id: uuid(), job_id, student_id, cover_letter, resume_url,
      status: 'Applied',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    apps.push(newApp);
    set(APPLICATIONS_KEY, apps);

    // Increment job applicants count
    const jobs = get(JOBS_KEY);
    const jIdx = jobs.findIndex(j => j.id === job_id);
    if (jIdx !== -1) { jobs[jIdx].applicants_count += 1; set(JOBS_KEY, jobs); }

    // Notification
    const job = mockJobs.getById(job_id);
    const notifs = get(NOTIFICATIONS_KEY);
    notifs.push({
      id: uuid(), user_id: student_id,
      title: `✅ Application Submitted – ${job?.title}`,
      message: `Your application for ${job?.title} at ${job?.company?.name} has been submitted successfully!`,
      type: 'success', is_read: false,
      created_at: new Date().toISOString(),
    });
    set(NOTIFICATIONS_KEY, notifs);

    return { data: newApp, error: null };
  },

  getByStudent: (student_id) => {
    const apps = get(APPLICATIONS_KEY);
    const jobs = get(JOBS_KEY);
    const companies = get(COMPANIES_KEY);
    return apps
      .filter(a => a.student_id === student_id)
      .map(a => {
        const job = jobs.find(j => j.id === a.job_id) || {};
        const company = companies.find(c => c.id === job.company_id) || {};
        return { ...a, job: { ...job, company } };
      })
      .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
  },

  hasApplied: (job_id, student_id) => {
    const apps = get(APPLICATIONS_KEY);
    return apps.some(a => a.job_id === job_id && a.student_id === student_id);
  },

  withdraw: (app_id, student_id) => {
    let apps = get(APPLICATIONS_KEY);
    apps = apps.filter(a => !(a.id === app_id && a.student_id === student_id));
    set(APPLICATIONS_KEY, apps);
    return { error: null };
  },
};

// ─── Placement Drives ─────────────────────────────────────────────────────────

export const mockDrives = {
  getAll: () => {
    const drives = get(DRIVES_KEY);
    const companies = get(COMPANIES_KEY);
    return drives
      .filter(d => d.is_active)
      .map(d => ({ ...d, company: companies.find(c => c.id === d.company_id) || {} }))
      .sort((a, b) => new Date(a.drive_date) - new Date(b.drive_date));
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications = {
  getByUser: (user_id) => {
    const notifs = get(NOTIFICATIONS_KEY);
    return notifs
      .filter(n => n.user_id === user_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  markRead: (id) => {
    const notifs = get(NOTIFICATIONS_KEY);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) { notifs[idx].is_read = true; set(NOTIFICATIONS_KEY, notifs); }
  },
  markAllRead: (user_id) => {
    const notifs = get(NOTIFICATIONS_KEY);
    notifs.forEach(n => { if (n.user_id === user_id) n.is_read = true; });
    set(NOTIFICATIONS_KEY, notifs);
  },
  unreadCount: (user_id) => {
    const notifs = get(NOTIFICATIONS_KEY);
    return notifs.filter(n => n.user_id === user_id && !n.is_read).length;
  },
};
