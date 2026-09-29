import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Search, MapPin, Briefcase, Filter, PlusCircle, 
  Users, Edit3, Trash2, CheckCircle2, XCircle, Clock 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import JobModal from '../components/JobModal';

export default function Jobs() {
  const { user, profile } = useAuth();
  const isCompany = user?.role === 'company' || profile?.role === 'company';

  if (isCompany) {
    return <RecruiterJobsView />;
  }

  return <StudentJobsView />;
}

// ─────────────────────────────────────────────────────────────
// RECRUITER / COMPANY JOBS VIEW
// ─────────────────────────────────────────────────────────────
function RecruiterJobsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyJobs();
    }
  }, [user]);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      // 1. Fetch company's posted jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // 2. Fetch live applicant counts for each job
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id);
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('job_id')
          .in('job_id', jobIds);

        const countMap = {};
        if (!appsError && appsData) {
          appsData.forEach(app => {
            countMap[app.job_id] = (countMap[app.job_id] || 0) + 1;
          });
        }

        const enriched = jobsData.map(j => ({
          ...j,
          liveApplicants: countMap[j.id] || 0
        }));
        setJobs(enriched);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching company jobs:', err);
      toast.error('Failed to load your posted jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const updatedStatus = !job.is_active;
    const toastId = toast.loading(updatedStatus ? 'Activating job posting...' : 'Closing job posting...');

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: updatedStatus })
        .eq('id', job.id)
        .eq('posted_by', user.id);

      if (error) throw error;

      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: updatedStatus } : j));
      toast.success(updatedStatus ? 'Job is now Active and accepting applicants.' : 'Job has been Closed.', { id: toastId });
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Could not update job status.', { id: toastId });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    const toastId = toast.loading('Deleting job posting...');
    try {
      // First delete associated applications if any
      await supabase.from('applications').delete().eq('job_id', jobId);

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('posted_by', user.id);

      if (error) throw error;

      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast.success('Job posting deleted successfully!', { id: toastId });
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error(`Delete failed: ${err.message}`, { id: toastId });
    }
  };

  const openCreateModal = () => {
    setSelectedJob(null);
    setModalOpen(true);
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = search === '' || 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(search.toLowerCase())) ||
      (job.skills && job.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));

    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && job.is_active) ||
      (statusFilter === 'Closed' && !job.is_active);

    const matchesCategory = categoryFilter === 'All' || job.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.liveApplicants || 0), 0);
  const activeCount = jobs.filter(j => j.is_active).length;

  return (
    <div className="page container">
      {/* Header */}
      <div className="section-header" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="section-label">🏢 Recruiter Portal</div>
          <h1 className="section-title">Manage Job Postings</h1>
          <p className="section-subtitle">
            Create new openings, manage active listings, and track candidate applications.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ boxShadow: 'var(--shadow-blue)' }}>
          <PlusCircle size={18} /> Post New Job
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-value">{jobs.length}</div>
          <div className="stat-label">Total Jobs Posted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{activeCount}</div>
          <div className="stat-label">Active Openings</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/applications')}>
          <div className="stat-value" style={{ color: 'var(--blue-400)' }}>{totalApplicants}</div>
          <div className="stat-label">Applications Received →</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '13px', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search your jobs by title, skills, or location..."
            style={{ paddingLeft: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="form-select form-input" 
            style={{ width: '150px' }} 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Closed">Closed Only</option>
          </select>

          <select 
            className="form-select form-input" 
            style={{ width: '170px' }} 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Engineering">Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Job Postings List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {job.title}
                    </h3>
                    <span className={`badge ${job.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {job.is_active ? 'Active' : 'Closed'}
                    </span>
                    <span className={`badge ${job.type === 'Internship' ? 'badge-info' : 'badge-primary'}`}>
                      {job.type}
                    </span>
                    {job.is_remote && (
                      <span className="badge badge-purple">Remote</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={14} /> {job.category || 'General'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {job.location || 'Not specified'}
                    </span>
                    {job.deadline && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Compensation & Applicants Highlight */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                      {job.stipend || job.salary || 'Negotiable'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Link 
                    to={`/applications?jobId=${job.id}`} 
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'var(--border-blue)' }}
                    title="View candidate applications for this position"
                  >
                    <Users size={15} color="var(--blue-400)" />
                    <strong style={{ color: 'var(--blue-400)' }}>{job.liveApplicants}</strong> Applicants
                  </Link>
                </div>
              </div>

              {/* Description preview */}
              {job.description && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
              )}

              {/* Skills tags */}
              {job.skills && job.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {job.skills.map((s, idx) => (
                    <span key={idx} className="tag">{s}</span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button" 
                    className={`btn btn-sm ${job.is_active ? 'btn-outline' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(job)}
                  >
                    {job.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    {job.is_active ? 'Close Applications' : 'Activate Posting'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to={`/applications?jobId=${job.id}`} className="btn btn-primary btn-sm">
                    Review Applications ({job.liveApplicants})
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(job)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card" style={{ padding: '60px 20px', borderRadius: 'var(--r-lg)' }}>
          <div className="empty-state__icon">📋</div>
          <h3 className="empty-state__title">
            {jobs.length === 0 ? 'No job postings yet' : 'No matching jobs found'}
          </h3>
          <p className="empty-state__desc" style={{ marginBottom: '24px' }}>
            {jobs.length === 0 
              ? 'Publish your first job or internship opening to start connecting with top student talent.'
              : 'Try clearing your filters or search keywords.'}
          </p>
          {jobs.length === 0 && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <PlusCircle size={16} /> Post Your First Job
            </button>
          )}
        </div>
      )}

      {/* Job Create/Edit Modal */}
      <JobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchMyJobs}
        initialJob={selectedJob}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT / PUBLIC EXPLORE JOBS VIEW
// ─────────────────────────────────────────────────────────────
function StudentJobsView() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  const CATEGORIES = ['All', 'Engineering', 'Data Science', 'Product', 'Design', 'Business', 'Marketing'];
  const TYPES = ['All', 'Full-Time', 'Internship', 'Part-Time', 'Contract'];

  useEffect(() => {
    fetchJobs();
    if (user && user.role === 'student') {
      fetchAppliedJobs();
    }
  }, [user]);

  const fetchAppliedJobs = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('job_id')
      .eq('student_id', user.id);
    if (!error && data) {
      setAppliedJobIds(data.map(a => a.job_id));
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('*, companies(name, logo)')
      .eq('is_active', true);

    if (category !== 'All') {
      query = query.eq('category', category);
    }
    if (jobType !== 'All') {
      query = query.eq('type', jobType);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      setJobs(data.map(job => ({ ...job, company: job.companies })));
    }
    setLoading(false);
  };

  const handleApply = async (jobId) => {
    if (!user) {
      toast.error('Please sign in as a student to apply.');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply to job openings.');
      return;
    }

    setApplyingId(jobId);
    const toastId = toast.loading('Submitting application...');

    try {
      const { error } = await supabase
        .from('applications')
        .insert([{ job_id: jobId, student_id: user.id, status: 'Applied' }]);

      if (error) throw error;

      setAppliedJobIds(prev => [...prev, jobId]);
      toast.success('Successfully applied! Track status in My Applications.', { id: toastId });
    } catch (err) {
      console.error('Error applying to job:', err);
      toast.error(`Application failed: ${err.message}`, { id: toastId });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">Explore Jobs & Internships</h1>
          <p className="section-subtitle">Find top job openings curated for students and new graduates.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search jobs by title or keyword..."
            style={{ paddingLeft: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select className="form-select form-input" style={{ width: '180px' }} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select className="form-select form-input" style={{ width: '160px' }} value={jobType} onChange={e => setJobType(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <button className="btn btn-primary" onClick={fetchJobs}>
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : (
        <div className="grid-3">
          {jobs.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem', width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  {job.company?.logo || '🏢'}
                </div>
                <span className={`badge ${job.type === 'Internship' ? 'badge-info' : 'badge-success'}`}>{job.type}</span>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.company?.name || 'Company'}</div>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={12} /> {job.category}</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {job.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
                {job.skills?.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>{job.stipend || job.salary || 'Best in Industry'}</div>
                  {job.deadline && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {appliedJobIds.includes(job.id) ? (
                  <span className="badge badge-success">Applied ✓</span>
                ) : (
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => handleApply(job.id)}
                    disabled={applyingId === job.id}
                  >
                    {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state__icon">🔍</div>
              <h3 className="empty-state__title">No jobs found</h3>
              <p className="empty-state__desc">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
