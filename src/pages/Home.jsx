import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, Briefcase, Calendar, MapPin, Clock } from 'lucide-react';
import './Home.css';

const HOW_IT_WORKS = [
  { step: '01', title: 'Register & Login', desc: 'Create your student account and log into the portal in seconds.' },
  { step: '02', title: 'Complete Your Profile', desc: 'Add your academic details, skills, and upload your resume.' },
  { step: '03', title: 'Browse Opportunities', desc: 'Explore jobs and internships from top hiring companies.' },
  { step: '04', title: 'Apply & Track', desc: 'Apply to suitable positions and track your application status in real-time.' },
];

const FEATURES = [
  { icon: '👤', title: 'Student Profile', desc: 'Showcase your academic background, skills, projects, and resume to recruiters.' },
  { icon: '💼', title: 'Job Listings', desc: 'Browse curated jobs and internships from companies across India.' },
  { icon: '🏢', title: 'Company Profiles', desc: 'Explore company culture, eligibility criteria, roles, and compensation details.' },
  { icon: '📊', title: 'Application Tracker', desc: 'Track every application from submitted to selected — all in one dashboard.' },
  { icon: '🔔', title: 'Placement Drives', desc: 'Stay updated about campus drives, registration deadlines, and announcements.' },
  { icon: '📄', title: 'Resume Builder', desc: 'Build and download a professional resume with guided templates.' },
  { icon: '🧠', title: 'Interview Prep', desc: 'Access aptitude tests, mock interviews, coding challenges, and study resources.' },
  { icon: '📱', title: 'Instant Alerts', desc: 'Get notified when you are shortlisted or when new matching jobs are posted.' },
];

export default function Home() {
  const { user } = useAuth();

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState([
    { value: '—', label: 'Students Registered', icon: '🎓' },
    { value: '—', label: 'Hiring Companies', icon: '🏢' },
    { value: '—', label: 'Active Job Openings', icon: '💼' },
    { value: '—', label: 'Placement Drives', icon: '🎯' },
  ]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
          { data: jobsData },
          { data: allActiveJobs },
          { data: drivesData },
          { data: studentProfiles },
          { count: drivesCount },
        ] = await Promise.all([
          supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
          supabase.from('jobs').select('id, company_name').eq('is_active', true),
          supabase.from('placement_drives').select('*').eq('is_active', true).order('drive_date', { ascending: true }).limit(3),
          supabase.from('profiles').select('id').eq('role', 'student'),
          supabase.from('placement_drives').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ]);

        if (jobsData) setFeaturedJobs(jobsData);
        if (drivesData) setDrives(drivesData);

        if (allActiveJobs) {
          const totalCount = allActiveJobs.length;
          setTotalJobs(totalCount);

          const counts = {};
          allActiveJobs.forEach(j => {
            const name = j.company_name?.trim();
            if (name) counts[name] = (counts[name] || 0) + 1;
          });
          const distinctCompanies = Object.keys(counts).length;
          const topList = Object.entries(counts)
            .map(([name, openings]) => ({ id: name, name, openings, logo: name.charAt(0).toUpperCase() }))
            .sort((a, b) => b.openings - a.openings)
            .slice(0, 6);
          setCompanies(topList);

          setStats([
            { value: studentProfiles?.length ? `${studentProfiles.length}+` : '—', label: 'Students Registered', icon: '🎓' },
            { value: distinctCompanies ? `${distinctCompanies}+` : '—', label: 'Hiring Companies', icon: '🏢' },
            { value: totalCount ? `${totalCount}+` : '—', label: 'Active Job Openings', icon: '💼' },
            { value: drivesCount != null ? `${drivesCount}` : '—', label: 'Placement Drives', icon: '🎯' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <main className="home page" id="home-page">

      {/* ════════════════ HERO ════════════════ */}
      <section className="hero" id="hero-section">
        <div className="hero__orbs">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>
        <div className="container">
          <div className="hero__content hero__content--centered anim-fade-up">
            <div className="hero__label" id="hero-label">
              <span className="hero__dot" />
              Chanakya University Placement Portal
            </div>
            <h1 className="hero__title" id="hero-title">
              Your Career <span className="gradient-text">Starts Here</span>
            </h1>
            <p className="hero__desc" id="hero-desc">
              Access job opportunities, internships, and placement resources in one place.
              Connect with top hiring companies and launch your career.
            </p>
            <div className="hero__cta" id="hero-cta">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-xl" id="hero-dashboard">
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                  <Link to="/jobs" className="btn btn-secondary btn-xl" id="hero-jobs">
                    Explore Jobs
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-xl" id="hero-register">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-xl" id="hero-login">
                    Login
                  </Link>
                </>
              )}
            </div>
            <div className="hero__skills" id="hero-skills">
              {['Python', 'React', 'Data Science', 'Java', 'Cloud', 'ML', 'DevOps', 'Product'].map(s => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="home-stats" id="stats-section">
        <div className="container">
          <div className="grid-4" id="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card anim-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="stat-card__icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CORE FEATURES ════════════════ */}
      <section className="home-features" id="features-section">
        <div className="container">
          <div className="home-section-head center">
            <div className="section-label">✨ Core Features</div>
            <h2 className="section-title">
              Everything You Need to <span className="gradient-text">Get Placed</span>
            </h2>
            <p className="section-subtitle">
              From job discovery to offer acceptance, PlaceMe supports you at every step.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card glass-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="home-how" id="how-it-works-section">
        <div className="container">
          <div className="home-section-head center">
            <div className="section-label">📋 How It Works</div>
            <h2 className="section-title">
              Simple Steps to Your <span className="gradient-text">Dream Job</span>
            </h2>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} className="how-card">
                <div className="how-card__step">{h.step}</div>
                <h3 className="how-card__title">{h.title}</h3>
                <p className="how-card__desc">{h.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="how-card__arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED JOBS ════════════════ */}
      <section className="home-jobs" id="featured-jobs-section">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="section-label">⚡ Featured Opportunities</div>
              <h2 className="section-title">
                Top Jobs <span className="gradient-text">This Week</span>
              </h2>
            </div>
            <Link to="/jobs" className="btn btn-secondary">
              View All Jobs <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid-3">
            {featuredJobs.length > 0 ? (
              featuredJobs.map(job => <JobPreviewCard key={job.id} job={job} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                No active jobs right now. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ PLACEMENT DRIVES ════════════════ */}
      {drives.length > 0 && (
        <section className="home-drives" id="drives-section">
          <div className="container">
            <div className="home-section-head">
              <div>
                <div className="section-label">🎯 Upcoming</div>
                <h2 className="section-title">
                  Placement <span className="gradient-text">Drives</span>
                </h2>
              </div>
              <Link to="/dashboard" className="btn btn-secondary">
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="drives-list">
              {drives.map(drive => <DriveCard key={drive.id} drive={drive} />)}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════ TOP COMPANIES ════════════════ */}
      {companies.length > 0 && (
        <section className="home-companies" id="companies-section">
          <div className="container">
            <div className="home-section-head center">
              <div className="section-label">🏢 Hiring Partners</div>
              <h2 className="section-title">
                Top Companies <span className="gradient-text">Hiring Now</span>
              </h2>
            </div>
            <div className="company-logos-grid">
              {companies.map(c => (
                <Link to={`/jobs?company=${encodeURIComponent(c.name)}`} key={c.id} className="company-logo-chip glass-card">
                  <span className="company-logo-chip__icon">{c.logo}</span>
                  <span className="company-logo-chip__name">{c.name}</span>
                  <span className="badge badge-info">{c.openings} {c.openings === 1 ? 'job' : 'jobs'}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="home-cta" id="final-cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__glow" />
            <div className="cta-banner__body">
              <h2 className="cta-banner__title">Start Your Placement Journey Today</h2>
              <p className="cta-banner__desc">
                {totalJobs > 0
                  ? `${totalJobs}+ active openings from top companies are waiting for you.`
                  : 'Discover opportunities, apply to jobs, and launch your career.'}
              </p>
              <div className="cta-banner__actions">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn btn-primary btn-xl">Go to Dashboard</Link>
                    <Link to="/jobs" className="btn btn-secondary btn-xl">Apply Now</Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-xl">Create Free Account</Link>
                    <Link to="/jobs" className="btn btn-secondary btn-xl">Explore Jobs</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function JobPreviewCard({ job }) {
  const compName = job.company_name || job.company?.name || 'Hiring Company';
  return (
    <Link to="/jobs" className="job-preview glass-card">
      <div className="job-preview__top">
        <span className="job-preview__logo">{compName.charAt(0).toUpperCase()}</span>
        <span className={`badge ${job.type === 'Internship' || job.type === 'Internship to Placement' ? 'badge-info' : 'badge-success'}`}>
          {job.type}
        </span>
      </div>
      <h3 className="job-preview__title">{job.title}</h3>
      <div className="job-preview__company">{compName}</div>
      <div className="job-preview__meta">
        {job.location && <span><MapPin size={12} /> {job.location}</span>}
        {job.deadline && <span><Clock size={12} /> {job.deadline}</span>}
      </div>
      <div className="job-preview__skills">
        {(job.skills || []).slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
      </div>
      <div className="job-preview__footer">
        <span className="job-preview__pay">{job.stipend || job.salary || 'Competitive'}</span>
        <span className="job-preview__apply">Apply →</span>
      </div>
    </Link>
  );
}

function DriveCard({ drive }) {
  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };
  return (
    <div className="drive-card glass-card">
      <div className="drive-card__left">
        <div className="drive-card__logo">🎯</div>
      </div>
      <div className="drive-card__body">
        <div className="drive-card__company" style={{ color: 'var(--blue-400)', fontWeight: 600 }}>Placement Drive</div>
        <h3 className="drive-card__title">{drive.title}</h3>
        <div className="drive-card__meta">
          <span><Calendar size={13} /> {formatDate(drive.drive_date)}</span>
          {drive.location && <span><MapPin size={13} /> {drive.location}</span>}
        </div>
        {drive.eligibility && <div className="drive-card__eligibility">{drive.eligibility}</div>}
      </div>
      <div className="drive-card__right">
        <div className="drive-card__deadline-label">Deadline</div>
        <div className="drive-card__deadline">{formatDate(drive.registration_deadline)}</div>
        <Link to="/dashboard" className="btn btn-primary btn-sm">Register</Link>
      </div>
    </div>
  );
}
