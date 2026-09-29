import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigate, Link } from 'react-router-dom';
import { 
  Briefcase, Bell, CheckCircle, Clock, Award, 
  Building, FileText, PlusCircle, Users, ChevronRight, 
  ExternalLink, UserCheck, XCircle 
} from 'lucide-react';
import JobModal from '../components/JobModal';
import CandidateModal from '../components/CandidateModal';

export default function Dashboard() {
  const { user, profile } = useAuth();
  
  if (!user) return <Navigate to="/login" />;

  const isCompany = user?.role === 'company' || profile?.role === 'company';

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <div className="section-label">
            {isCompany ? '🏢 Recruiter Console' : '🎓 Student Portal'}
          </div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Welcome back, {profile?.name?.split(' ')[0] || (isCompany ? 'Partner' : 'Student')}!
          </p>
        </div>
      </div>
      
      {isCompany ? <CompanyDashboard /> : <StudentDashboard />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [drives, setDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Applications
      const { data: appsData } = await supabase
        .from('applications')
        .select('*, jobs(*, companies(name, logo))')
        .eq('student_id', user.id)
        .order('applied_at', { ascending: false });

      if (appsData) {
        setApplications(appsData.map(app => ({
          ...app,
          job: app.jobs ? { ...app.jobs, company: app.jobs.companies } : null
        })));
      }

      // 2. Fetch Recommended Jobs (3 latest)
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, companies(name, logo)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (jobsData) {
        setRecommended(jobsData.map(j => ({ ...j, company: j.companies })));
      }

      // 3. Fetch Upcoming Drives
      const { data: drivesData } = await supabase
        .from('placement_drives')
        .select('*, companies(name, logo)')
        .eq('is_active', true)
        .order('drive_date', { ascending: true })
        .limit(2);
        
      if (drivesData) {
        setDrives(drivesData.map(d => ({ ...d, company: d.companies })));
      }

      // 4. Fetch Notifications
      const { data: notifsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifsData) setNotifications(notifsData);

    } catch (err) {
      console.error('Error fetching student dashboard data', err);
    }
  };

  const stats = [
    { label: 'Applications', value: applications.length, icon: <Briefcase /> },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, icon: <CheckCircle /> },
    { label: 'Interviews', value: applications.filter(a => a.status === 'Interviewing').length, icon: <Clock /> },
    { label: 'Offers', value: applications.filter(a => a.status === 'Offered').length, icon: <Award /> },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Stats Grid */}
        <div className="grid-4" style={{ gap: '16px' }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '20px' }}>
              <div style={{ color: 'var(--blue-400)', marginBottom: '8px' }}>{s.icon}</div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Applications</h3>
            <Link to="/applications" style={{ fontSize: '0.85rem', color: 'var(--blue-400)' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.slice(0, 3).map(app => (
              <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '1.5rem', width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {app.job?.company?.logo || '🏢'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{app.job?.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.job?.company?.name}</div>
                  </div>
                </div>
                <span className={`badge ${app.status === 'Applied' ? 'badge-info' : 'badge-success'}`}>{app.status}</span>
              </div>
            ))}
            {applications.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No applications yet.</div>}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recommended Jobs</h3>
            <Link to="/jobs" style={{ fontSize: '0.85rem', color: 'var(--blue-400)' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommended.map(job => (
              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                 <div>
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.company?.name}</div>
                 </div>
                 <Link to="/jobs" className="btn btn-outline btn-sm">Apply</Link>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Completion */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Profile Status</h3>
          <div className="progress-bar" style={{ height: '8px', marginBottom: '8px' }}>
            <div className="progress-fill" style={{ width: `${profile?.profile_completion || 0}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Completion</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{profile?.profile_completion || 0}%</span>
          </div>
          <Link to="/profile" className="btn btn-secondary btn-full" style={{ marginTop: '16px' }}>Edit Profile</Link>
        </div>

        {/* Notifications */}
        <div className="glass-card" style={{ padding: '24px' }}>
           <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Bell size={16} /> Notifications
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {notifications.map(n => (
               <div key={n.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-sm)', borderLeft: `3px solid var(--${n.type === 'success' ? 'success' : 'primary'})` }}>
                 <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{n.title}</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</div>
               </div>
             ))}
             {notifications.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No new notifications</div>}
           </div>
        </div>

        {/* Upcoming Drives */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Building size={16} /> Upcoming Drives
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {drives.map(d => (
               <div key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.title}</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.drive_date} @ {d.location}</div>
               </div>
             ))}
             {drives.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No upcoming drives</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RECRUITER / COMPANY DASHBOARD
// ─────────────────────────────────────────────────────────────
function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeCandidateApp, setActiveCandidateApp] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      // 1. Fetch company's posted jobs
      const { data: jobsData, error: jobsErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });

      if (jobsErr) throw jobsErr;
      const jobList = jobsData || [];
      const jobIds = jobList.map(j => j.id);

      // 2. Fetch applications for those jobs
      let appsList = [];
      if (jobIds.length > 0) {
        const { data: appsData, error: appsErr } = await supabase
          .from('applications')
          .select('*')
          .in('job_id', jobIds)
          .order('applied_at', { ascending: false });

        if (!appsErr && appsData) {
          appsList = appsData;

          // Fetch student profiles for the applications
          const studentIds = [...new Set(appsData.map(a => a.student_id).filter(Boolean))];
          let profileMap = {};
          if (studentIds.length > 0) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('*')
              .in('id', studentIds);

            if (profData) {
              profData.forEach(p => { profileMap[p.id] = p; });
            }
          }

          const jobMap = {};
          jobList.forEach(j => { jobMap[j.id] = j; });

          appsList = appsData.map(app => ({
            ...app,
            job: jobMap[app.job_id] || {},
            candidate: profileMap[app.student_id] || { name: 'Applicant' }
          }));

          // Attach applicant count to jobs
          const counts = {};
          appsData.forEach(a => {
            counts[a.job_id] = (counts[a.job_id] || 0) + 1;
          });
          jobList.forEach(j => {
            j.applicants_count = counts[j.id] || 0;
          });
        }
      }

      setJobs(jobList);
      setApplications(appsList);
    } catch (err) {
      console.error('Error fetching recruiter dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeJobsCount = jobs.filter(j => j.is_active).length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const hiredCount = applications.filter(a => a.status === 'Offered').length;

  const stats = [
    { label: 'Active Openings', value: activeJobsCount, icon: <Briefcase /> },
    { label: 'Applications Received', value: totalAppsCount, icon: <Users /> },
    { label: 'Shortlisted', value: shortlistedCount, icon: <UserCheck /> },
    { label: 'Job Offers Made', value: hiredCount, icon: <Award /> },
  ];

  const handleOpenPostJob = () => {
    setEditingJob(null);
    setJobModalOpen(true);
  };

  const handleOpenEditJob = (job) => {
    setEditingJob(job);
    setJobModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Stats Grid */}
      <div className="grid-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '22px' }}>
            <div style={{ color: 'var(--blue-400)', marginBottom: '8px' }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        {/* Left Column: Your Job Postings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Your Job Openings</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Manage listings and monitor candidate applicants.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/jobs" className="btn btn-secondary btn-sm">
                  Manage All Jobs
                </Link>
                <button className="btn btn-primary btn-sm" onClick={handleOpenPostJob}>
                  <PlusCircle size={15} /> Post New Job
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="spinner" style={{ width: '28px', height: '28px' }} />
              </div>
            ) : jobs.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <th style={{ padding: '12px 8px' }}>Job Title</th>
                      <th style={{ padding: '12px 8px' }}>Status</th>
                      <th style={{ padding: '12px 8px' }}>Applicants</th>
                      <th style={{ padding: '12px 8px' }}>Posted On</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.slice(0, 5).map(job => (
                      <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.type} • {job.location || 'Remote'}</div>
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <span className={`badge ${job.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {job.is_active ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <Link 
                            to={`/applications?jobId=${job.id}`}
                            style={{ color: 'var(--blue-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Users size={14} /> {job.applicants_count || 0}
                          </Link>
                        </td>
                        <td style={{ padding: '14px 8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Link to={`/applications?jobId=${job.id}`} className="btn btn-outline btn-sm" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                              Applicants
                            </Link>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => handleOpenEditJob(job)}>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state__icon">📄</div>
                <h3 className="empty-state__title">No Jobs Posted Yet</h3>
                <p className="empty-state__desc" style={{ marginBottom: '16px' }}>
                  Create your first job listing to start receiving student applications.
                </p>
                <button className="btn btn-primary btn-sm" onClick={handleOpenPostJob}>
                  <PlusCircle size={15} /> Create Job Posting
                </button>
              </div>
            )}
          </div>

          {/* Recent Candidate Applications */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Recent Candidate Applications</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Latest candidates who applied for your openings.
                </p>
              </div>
              <Link to="/applications" style={{ fontSize: '0.85rem', color: 'var(--blue-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All ({applications.length}) <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {applications.slice(0, 4).map(app => (
                <div 
                  key={app.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--gradient-blue)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}>
                      {app.candidate?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {app.candidate?.name || 'Applicant'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Applied for <strong style={{ color: 'var(--blue-400)' }}>{app.job?.title || 'Job Opening'}</strong>
                        {app.candidate?.college ? ` • ${app.candidate.college}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${app.status === 'Shortlisted' ? 'badge-success' : (app.status === 'Applied' ? 'badge-info' : 'badge-primary')}`}>
                      {app.status}
                    </span>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => setActiveCandidateApp(app)}
                    >
                      Review Profile
                    </button>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  No candidate applications received yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Company Info & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Company Profile Quick Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Company Profile</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid var(--border-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                🏢
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {profile?.company_name || profile?.name || 'Your Company'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {profile?.company_industry || 'Recruiting Partner'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              <div>📍 {profile?.company_location || 'Location not added'}</div>
              <div>👥 {profile?.company_size || 'Size not added'}</div>
              <div>✉️ {profile?.email}</div>
            </div>

            <Link to="/profile" className="btn btn-secondary btn-full btn-sm">
              Edit Company Profile
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Recruiter Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-primary btn-full btn-sm"
                onClick={handleOpenPostJob}
              >
                <PlusCircle size={15} /> Create New Job Listing
              </button>
              <Link to="/jobs" className="btn btn-secondary btn-full btn-sm">
                <Briefcase size={15} /> Manage All Postings
              </Link>
              <Link to="/applications" className="btn btn-secondary btn-full btn-sm">
                <Users size={15} /> Candidate Applications
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Post/Edit Job Modal */}
      <JobModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        onSuccess={fetchCompanyData}
        initialJob={editingJob}
      />

      {/* Candidate Profile Details Modal */}
      <CandidateModal
        isOpen={Boolean(activeCandidateApp)}
        onClose={() => setActiveCandidateApp(null)}
        application={activeCandidateApp}
        onStatusChange={(appId, newStatus) => {
          setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
          if (activeCandidateApp && activeCandidateApp.id === appId) {
            setActiveCandidateApp(prev => ({ ...prev, status: newStatus }));
          }
        }}
      />
    </div>
  );
}
