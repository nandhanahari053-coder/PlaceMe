import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Briefcase, Building, Clock, MapPin, Search,
  User, CheckCircle, XCircle, Award, FileText,
  ExternalLink, Filter, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CandidateModal from '../components/CandidateModal';

export default function Applications() {
  const { user, profile } = useAuth();

  if (!user) return <Navigate to="/login" />;

  const isCompany = user?.role === 'company' || profile?.role === 'company';

  if (isCompany) {
    return <RecruiterApplicationsView />;
  }

  return <StudentApplicationsView />;
}

// ─────────────────────────────────────────────────────────────
// RECRUITER / COMPANY APPLICATIONS VIEW
// ─────────────────────────────────────────────────────────────
function RecruiterApplicationsView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'All';

  const [companyJobs, setCompanyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeModalApp, setActiveModalApp] = useState(null);

  useEffect(() => {
    if (user) {
      loadRecruiterData();
    }
  }, [user]);

  // Synchronize when query parameter changes
  useEffect(() => {
    const qJobId = searchParams.get('jobId');
    if (qJobId) {
      setSelectedJobId(qJobId);
    }
  }, [searchParams]);

  const loadRecruiterData = async () => {
    setLoading(true);
    try {
      // STEP 1: Fetch recruiter's own job postings
      const { data: jobsData, error: jobsErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });

      if (jobsErr) {
        console.error('Jobs fetch error:', jobsErr);
        throw jobsErr;
      }

      const jobList = jobsData || [];
      setCompanyJobs(jobList);

      if (jobList.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const jobIds = jobList.map(j => j.id);
      const jobMap = {};
      jobList.forEach(j => { jobMap[j.id] = j; });

      // STEP 2: Use a single joined query to fetch ALL applications for recruiter's jobs
      // This single query is more reliable than separate .in() filter which may fail with RLS
      const { data: appsRaw, error: appsErr } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          student_id,
          status,
          cover_letter,
          resume_url,
          applied_at,
          updated_at,
          jobs:job_id ( id, title, type, location, salary, stipend, category, posted_by ),
          profiles:student_id ( id, name, email, phone, college, degree, branch, graduation_year, cgpa, skills, bio, resume_url, linkedin_url, github_url, profile_completion )
        `)
        .order('applied_at', { ascending: false });

      if (appsErr) {
        console.error('Applications fetch error:', appsErr);
        throw appsErr;
      }

      if (!appsRaw || appsRaw.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // STEP 3: Filter only those that belong to this recruiter's jobs
      const enrichedApps = appsRaw
        .filter(app => {
          // Keep if job_id is in this recruiter's job list
          if (jobIds.includes(app.job_id)) return true;
          // Or if the joined job record says this recruiter posted it
          if (app.jobs && app.jobs.posted_by === user.id) return true;
          return false;
        })
        .map(app => ({
          ...app,
          job: app.jobs || jobMap[app.job_id] || {},
          candidate: app.profiles || { name: 'Student Applicant', email: 'N/A' }
        }));

      setApplications(enrichedApps);
    } catch (err) {
      console.error('Error loading recruiter applications:', err);
      toast.error(`Could not load candidate applications: ${err.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeLocally = (appId, newStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    if (activeModalApp && activeModalApp.id === appId) {
      setActiveModalApp(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleQuickStatus = async (e, app, newStatus) => {
    e.stopPropagation();
    const toastId = toast.loading(`Marking candidate as ${newStatus}...`);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', app.id);

      if (error) throw error;

      // Try sending notification to student
      if (app.candidate?.id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: app.candidate.id,
            title: `Application Update: ${app.job?.title || 'Job'}`,
            message: `Your application status has been updated to "${newStatus}".`,
            type: newStatus === 'Rejected' ? 'error' : (newStatus === 'Offered' ? 'success' : 'info'),
            is_read: false
          }])
          .catch(() => { });
      }

      handleStatusChangeLocally(app.id, newStatus);
      toast.success(`Application marked as ${newStatus}!`, { id: toastId });
    } catch (err) {
      console.error('Error changing status:', err);
      toast.error('Status update failed.', { id: toastId });
    }
  };

  const handleJobFilterChange = (newJobId) => {
    setSelectedJobId(newJobId);
    if (newJobId === 'All') {
      searchParams.delete('jobId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ jobId: newJobId });
    }
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesJob = selectedJobId === 'All' || app.job_id === selectedJobId;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    const candidate = app.candidate || {};
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (candidate.name && candidate.name.toLowerCase().includes(q)) ||
      (candidate.email && candidate.email.toLowerCase().includes(q)) ||
      (candidate.college && candidate.college.toLowerCase().includes(q)) ||
      (candidate.branch && candidate.branch.toLowerCase().includes(q)) ||
      (candidate.skills && candidate.skills.some(s => s.toLowerCase().includes(q))) ||
      (app.job?.title && app.job.title.toLowerCase().includes(q));

    return matchesJob && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return 'badge-info';
      case 'Shortlisted': return 'badge-success';
      case 'Interviewing': return 'badge-warning';
      case 'Offered': return 'badge-purple';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  // Metrics
  const totalCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewingCount = applications.filter(a => a.status === 'Interviewing').length;
  const offeredCount = applications.filter(a => a.status === 'Offered').length;

  return (
    <div className="page container">
      {/* Header */}
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <div className="section-label">📋 Candidate Management</div>
          <h1 className="section-title">Applications Received</h1>
          <p className="section-subtitle">
            Review student candidates, view full academic profiles, resumes, and manage applicant statuses.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{shortlistedCount}</div>
          <div className="stat-label">Shortlisted Candidates</div>
        </div>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{interviewingCount}</div>
          <div className="stat-label">In Interview Round</div>
        </div>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{offeredCount}</div>
          <div className="stat-label">Job Offers Extended</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '13px', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search candidate by name, college, CGPA, or skills..."
            style={{ paddingLeft: '44px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Job Filter Dropdown */}
          <select
            className="form-select form-input"
            style={{ width: '220px' }}
            value={selectedJobId}
            onChange={(e) => handleJobFilterChange(e.target.value)}
          >
            <option value="All">All Job Postings ({companyJobs.length})</option>
            {companyJobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} {j.is_active ? '' : '(Closed)'}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-select form-input"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidate Applications List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : filteredApps.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredApps.map(app => {
            const candidate = app.candidate || {};
            const job = app.job || {};

            return (
              <div
                key={app.id}
                className="glass-card"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
                onClick={() => setActiveModalApp(app)}
              >
                {/* Top Row: Candidate + Job applied info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'var(--gradient-blue)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      flexShrink: 0
                    }}>
                      {candidate.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {candidate.name || 'Candidate'}
                        </h3>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--blue-400)', fontWeight: 600, marginBottom: '4px' }}>
                        Applied for: {job.title || 'Opening'} ({job.type || 'Full-Time'})
                      </div>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        {candidate.college && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={13} /> {candidate.college}
                          </span>
                        )}
                        {candidate.branch && (
                          <span>{candidate.degree || 'Degree'} ({candidate.branch})</span>
                        )}
                        {candidate.cgpa && (
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            CGPA: {candidate.cgpa}
                          </span>
                        )}
                        {candidate.graduation_year && (
                          <span>Batch: {candidate.graduation_year}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Application Date & Quick Actions */}
                  <div style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {(app.resume_url || candidate.resume_url) && (
                        <a
                          href={app.resume_url || candidate.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open Resume"
                          style={{ padding: '6px 12px' }}
                        >
                          <FileText size={14} /> Resume
                        </a>
                      )}

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveModalApp(app)}
                        style={{ padding: '6px 14px' }}
                      >
                        Review Profile <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Candidate Skills preview */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {candidate.skills.slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="tag" style={{ fontSize: '0.75rem' }}>{skill}</span>
                    ))}
                    {candidate.skills.length > 6 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        +{candidate.skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Quick Status Updates */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {candidate.email} • {candidate.phone || 'No phone'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '4px' }}>
                      Quick Status:
                    </span>
                    <button
                      className={`btn btn-sm ${app.status === 'Shortlisted' ? 'btn-success' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => handleQuickStatus(e, app, 'Shortlisted')}
                    >
                      <CheckCircle size={12} /> Shortlist
                    </button>
                    <button
                      className={`btn btn-sm ${app.status === 'Interviewing' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => handleQuickStatus(e, app, 'Interviewing')}
                    >
                      <Clock size={12} /> Interview
                    </button>
                    <button
                      className={`btn btn-sm ${app.status === 'Offered' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => handleQuickStatus(e, app, 'Offered')}
                    >
                      <Award size={12} /> Offer
                    </button>
                    <button
                      className={`btn btn-sm ${app.status === 'Rejected' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => handleQuickStatus(e, app, 'Rejected')}
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-card" style={{ padding: '60px 20px', borderRadius: 'var(--r-lg)' }}>
          <div className="empty-state__icon">👥</div>
          <h3 className="empty-state__title">
            {applications.length === 0 ? 'No applications received yet' : 'No applications match your filter'}
          </h3>
          <p className="empty-state__desc" style={{ marginBottom: '24px' }}>
            {companyJobs.length === 0
              ? "You haven't posted any jobs yet. Create a job listing to start receiving candidate applications."
              : "When students apply to your job postings, their full profiles, contact details, and resumes will appear here."}
          </p>
          {companyJobs.length === 0 && (
            <Link to="/jobs" className="btn btn-primary">
              <Briefcase size={16} /> Post a Job
            </Link>
          )}
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      <CandidateModal
        isOpen={Boolean(activeModalApp)}
        onClose={() => setActiveModalApp(null)}
        application={activeModalApp}
        onStatusChange={handleStatusChangeLocally}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT APPLICATIONS VIEW
// ─────────────────────────────────────────────────────────────
function StudentApplicationsView() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchApps();
    }
  }, [user]);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*, jobs(*, companies(name, logo))')
      .eq('student_id', user.id)
      .order('applied_at', { ascending: false });

    if (!error && data) {
      setApplications(data.map(app => ({
        ...app,
        job: app.jobs ? { ...app.jobs, company: app.jobs.companies } : null
      })));
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'badge-info';
      case 'Shortlisted': return 'badge-success';
      case 'Interviewing': return 'badge-warning';
      case 'Offered': return 'badge-purple';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">My Applications</h1>
          <p className="section-subtitle">Track the status of your job and internship applications in real time.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : applications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map(app => (
            <div key={app.id} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '2.5rem', width: '64px', height: '64px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                {app.job?.company?.logo || '🏢'}
              </div>

              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{app.job?.title || 'Job Opening'}</h3>
                  <span className={`badge ${getStatusColor(app.status)}`}>{app.status}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--blue-400)', marginBottom: '12px' }}>
                  {app.job?.company?.name || 'Company'}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  {app.job?.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {app.job.location}</span>
                  )}
                  {app.job?.type && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {app.job.type}</span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>
                  {app.job?.stipend || app.job?.salary || 'Negotiable'}
                </div>
                <Link to="/jobs" className="btn btn-secondary btn-sm">Explore More</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card" style={{ padding: '60px 20px', borderRadius: 'var(--r-lg)' }}>
          <div className="empty-state__icon">📄</div>
          <h3 className="empty-state__title">No applications yet</h3>
          <p className="empty-state__desc" style={{ marginBottom: '24px' }}>You haven't applied to any jobs or internships yet.</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      )}
    </div>
  );
}
