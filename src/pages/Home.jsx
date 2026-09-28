import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, Briefcase, Users, TrendingUp, Award, CheckCircle, Calendar, MapPin, Clock } from 'lucide-react';
import './Home.css';

const STATS = [
  { value: '50,000+', label: 'Students Placed', icon: '🎓' },
  { value: '1,200+',  label: 'Partner Companies', icon: '🏢' },
  { value: '95%',     label: 'Placement Rate', icon: '📈' },
  { value: '₹12 LPA', label: 'Average Package', icon: '💰' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register & Login', desc: 'Create your account as a student or recruiter and log into the portal.' },
  { step: '02', title: 'Complete Your Profile', desc: 'Add your academic details, skills, and upload your resume.' },
  { step: '03', title: 'Browse Opportunities', desc: 'Explore jobs and internships from 1,200+ top companies.' },
  { step: '04', title: 'Apply & Track', desc: 'Apply to suitable positions and track your application status in real-time.' },
];

const FEATURES = [
  { icon: '👤', title: 'Student Profile', desc: 'Showcase your academic background, skills, projects, and resume to recruiters.' },
  { icon: '💼', title: 'Job Listings', desc: 'Browse 1,000+ curated jobs and internships from companies across India.' },
  { icon: '🏢', title: 'Company Profiles', desc: 'Explore company culture, eligibility criteria, roles, and compensation details.' },
  { icon: '📊', title: 'Application Tracker', desc: 'Track every application from submitted to selected — all in one dashboard.' },
  { icon: '🔔', title: 'Placement Drives', desc: 'Stay updated about campus drives, registration deadlines, and announcements.' },
  { icon: '📄', title: 'Resume Builder', desc: 'Build and download a professional resume with guided templates.' },
  { icon: '🧠', title: 'Interview Prep', desc: 'Access aptitude tests, mock interviews, coding challenges, and study resources.' },
  { icon: '📱', title: 'Instant Alerts', desc: 'Get notified when you are shortlisted or when new matching jobs are posted.' },
];

export default function Home() {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs]   = useState([]);
  const [companies, setCompanies]         = useState([]);
  const [drives, setDrives]               = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
          { data: jobsData },
          { data: companiesData },
          { data: drivesData }
        ] = await Promise.all([
          supabase.from('jobs').select(`*, companies(name, logo)`).order('created_at', { ascending: false }).limit(3),
          supabase.from('companies').select('*').limit(6),
          supabase.from('placement_drives').select(`*, companies(name, logo)`).order('created_at', { ascending: false }).limit(3)
        ]);

        if (jobsData) setFeaturedJobs(jobsData.map(j => ({ ...j, company: j.companies })));
        if (companiesData) setCompanies(companiesData);
        if (drivesData) setDrives(drivesData.map(d => ({ ...d, company: d.companies })));
      } catch (err) {
        console.error("Error fetching home data:", err);
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
        <div className="container hero__inner">
          <div className="hero__content anim-fade-up">
            <div className="hero__label" id="hero-label">
              <span className="hero__dot" />
              India's #1 Student Placement Portal
            </div>
            <h1 className="hero__title" id="hero-title">
              Your Career<br />
              <span className="gradient-text">Starts Here</span>
            </h1>
            <p className="hero__desc" id="hero-desc">
              Access job opportunities, internships, company updates, and placement resources in one place.
              Connect with 1,200+ top companies and launch your career.
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

          {/* Dashboard preview card */}
          <div className="hero__preview anim-float" id="hero-preview">
            <div className="hero__preview-card" id="hero-preview-card">
              <div className="hero__preview-header">
                <div className="hero__preview-avatar">A</div>
                <div>
                  <div className="hero__preview-name">Arjun Sharma</div>
                  <div className="hero__preview-college">IIT Bombay · CS 2026</div>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="hero__preview-stats">
                <div className="hero__preview-stat">
                  <div className="hero__preview-stat-val">12</div>
                  <div className="hero__preview-stat-lbl">Applied</div>
                </div>
                <div className="hero__preview-stat">
                  <div className="hero__preview-stat-val">5</div>
                  <div className="hero__preview-stat-lbl">Shortlisted</div>
                </div>
                <div className="hero__preview-stat">
                  <div className="hero__preview-stat-val">2</div>
                  <div className="hero__preview-stat-lbl">Interviews</div>
                </div>
              </div>
              <div className="hero__preview-progress">
                <div className="hero__preview-progress-label">
                  <span>Profile Completion</span><span>85%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="hero__preview-drive">
                <Calendar size={13} />
                <span>Google Drive – Oct 20 | 2 days to register</span>
              </div>
            </div>

            {/* Floating bubbles */}
            <div className="hero__bubble hero__bubble--1">
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              <span>Offer from Amazon!</span>
            </div>
            <div className="hero__bubble hero__bubble--2">
              <Briefcase size={14} style={{ color: '#3b82f6' }} />
              <span>500+ new jobs today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="home-stats" id="stats-section">
        <div className="container">
          <div className="grid-4" id="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card anim-fade-up" style={{ animationDelay: `${i * 0.08}s` }} id={`stat-${i}`}>
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
            <div className="section-label" id="features-label">✨ Core Features</div>
            <h2 className="section-title" id="features-title">
              Everything You Need to <span className="gradient-text">Get Placed</span>
            </h2>
            <p className="section-subtitle">
              From job discovery to offer acceptance, PlaceMe supports you at every step.
            </p>
          </div>
          <div className="features-grid" id="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card glass-card" id={`feature-${i}`}>
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
            <div className="section-label" id="how-label">📋 How It Works</div>
            <h2 className="section-title" id="how-title">
              Simple Steps to Your <span className="gradient-text">Dream Job</span>
            </h2>
          </div>
          <div className="how-grid" id="how-grid">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} className="how-card" id={`how-step-${i}`}>
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
              <div className="section-label" id="featured-jobs-label">⚡ Featured Opportunities</div>
              <h2 className="section-title" id="featured-jobs-title">
                Top Jobs <span className="gradient-text">This Week</span>
              </h2>
            </div>
            <Link to="/jobs" className="btn btn-secondary" id="view-all-jobs">
              View All Jobs <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid-3" id="featured-jobs-grid">
            {featuredJobs.map(job => (
              <JobPreviewCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PLACEMENT DRIVES ════════════════ */}
      <section className="home-drives" id="drives-section">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="section-label" id="drives-label">🎯 Upcoming</div>
              <h2 className="section-title" id="drives-title">
                Placement <span className="gradient-text">Drives</span>
              </h2>
            </div>
            <Link to="/dashboard" className="btn btn-secondary" id="view-all-drives">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="drives-list" id="drives-list">
            {drives.map(drive => (
              <DriveCard key={drive.id} drive={drive} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TOP COMPANIES ════════════════ */}
      <section className="home-companies" id="companies-section">
        <div className="container">
          <div className="home-section-head center">
            <div className="section-label" id="companies-label">🏢 Our Partners</div>
            <h2 className="section-title" id="companies-title">
              Top Companies <span className="gradient-text">Hiring Now</span>
            </h2>
          </div>
          <div className="company-logos-grid" id="company-logos">
            {companies.map(c => (
              <Link to="/companies" key={c.id} className="company-logo-chip glass-card" id={`company-chip-${c.id}`}>
                <span className="company-logo-chip__icon">{c.logo}</span>
                <span className="company-logo-chip__name">{c.name}</span>
                <span className="badge badge-info">{c.openings} jobs</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="home-cta" id="final-cta-section">
        <div className="container">
          <div className="cta-banner" id="cta-banner">
            <div className="cta-banner__glow" />
            <div className="cta-banner__body">
              <h2 className="cta-banner__title" id="cta-title">
                Start Your Placement Journey Today
              </h2>
              <p className="cta-banner__desc">
                Join 50,000+ students who found their dream career through PlaceMe.
              </p>
              <div className="cta-banner__actions">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn btn-primary btn-xl" id="cta-dashboard">
                      Go to Dashboard
                    </Link>
                    <Link to="/jobs" className="btn btn-secondary btn-xl" id="cta-apply">
                      Apply Now
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-xl" id="cta-register">
                      Create Free Account
                    </Link>
                    <Link to="/jobs" className="btn btn-secondary btn-xl" id="cta-explore">
                      Explore Jobs
                    </Link>
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
  return (
    <Link to="/jobs" className="job-preview glass-card" id={`job-preview-${job.id}`}>
      <div className="job-preview__top">
        <span className="job-preview__logo">{job.company?.logo || '🏢'}</span>
        <span className={`badge ${job.type === 'Internship' ? 'badge-info' : 'badge-success'}`}>{job.type}</span>
      </div>
      <h3 className="job-preview__title">{job.title}</h3>
      <div className="job-preview__company">{job.company?.name}</div>
      <div className="job-preview__meta">
        <span><MapPin size={12} /> {job.location}</span>
        <span><Clock size={12} /> {job.deadline}</span>
      </div>
      <div className="job-preview__skills">
        {job.skills?.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
      </div>
      <div className="job-preview__footer">
        <span className="job-preview__pay">{job.stipend || job.salary}</span>
        <span className="job-preview__apply">Apply →</span>
      </div>
    </Link>
  );
}

function DriveCard({ drive }) {
  return (
    <div className="drive-card glass-card" id={`drive-card-${drive.id}`}>
      <div className="drive-card__left">
        <div className="drive-card__logo">{drive.company?.logo || '🏢'}</div>
      </div>
      <div className="drive-card__body">
        <div className="drive-card__company">{drive.company?.name}</div>
        <h3 className="drive-card__title">{drive.title}</h3>
        <div className="drive-card__meta">
          <span><Calendar size={13} /> {drive.drive_date}</span>
          <span><MapPin size={13} /> {drive.location}</span>
        </div>
        <div className="drive-card__eligibility">{drive.eligibility}</div>
      </div>
      <div className="drive-card__right">
        <div className="drive-card__deadline-label">Deadline</div>
        <div className="drive-card__deadline">{drive.registration_deadline}</div>
        <Link to="/dashboard" className="btn btn-primary btn-sm">Register</Link>
      </div>
    </div>
  );
}
