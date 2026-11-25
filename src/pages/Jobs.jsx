import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Search, MapPin, Briefcase, PlusCircle,
  Users, Edit3, Trash2, CheckCircle2, XCircle, Clock, Building2, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import JobModal from '../components/JobModal';

export default function Jobs() {
  const { user, profile } = useAuth();
  const isCompany = user?.role === 'company' || profile?.role === 'company';
  return isCompany ? <RecruiterJobsView /> : <StudentJobsView />;
}

// ─────────────────────────────────────────────────────────────
// RECRUITER VIEW
// ─────────────────────────────────────────────────────────────
function RecruiterJobsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => { if (user) fetchMyJobs(); }, [user]);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (jobsData?.length > 0) {
        const jobIds = jobsData.map(j => j.id);
        const { data: appsData } = await supabase
          .from('applications').select('job_id').in('job_id', jobIds);
        const countMap = {};
        appsData?.forEach(a => { countMap[a.job_id] = (countMap[a.job_id] || 0) + 1; });
        setJobs(jobsData.map(j => ({
          ...j,
          liveApplicants: countMap[j.id] ?? j.applicants_count ?? 0
        })));
      } else {
        setJobs([]);
      }
    } catch (err) {
      toast.error('Failed to load your posted jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const next = !job.is_active;
    const tid = toast.loading(next ? 'Activating...' : 'Closing...');
    try {
      const { error } = await supabase.from('jobs').update({ is_active: next })
        .eq('id', job.id).eq('posted_by', user.id);
      if (error) throw error;
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: next } : j));
      toast.success(next ? 'Job is now Active.' : 'Job has been Closed.', { id: tid });
    } catch { toast.error('Could not update job status.', { id: tid }); }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    const tid = toast.loading('Deleting...');
    try {
      await supabase.from('applications').delete().eq('job_id', jobId);
      const { error } = await supabase.from('jobs').delete().eq('id', jobId).eq('posted_by', user.id);
      if (error) throw error;
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast.success('Job deleted.', { id: tid });
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`, { id: tid });
    }
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company_name?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' ? j.is_active : !j.is_active);
    return matchSearch && matchStatus;
  });

  const totalApplicants = jobs.reduce((s, j) => s + (j.liveApplicants || 0), 0);

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="section-label">🏢 Recruiter Portal</div>
          <h1 className="section-title">Manage Job Postings</h1>
          <p className="section-subtitle">Create openings, manage listings, and track candidate applications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedJob(null); setModalOpen(true); }}>
          <PlusCircle size={18} /> Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-value">{jobs.length}</div>
          <div className="stat-label">Total Jobs Posted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{jobs.filter(j => j.is_active).length}</div>
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
          <input type="text" className="form-input" placeholder="Search by title, company or location..."
            style={{ paddingLeft: '44px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select form-input" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active Only</option>
          <option value="Closed">Closed Only</option>
        </select>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  {/* Company name + badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <Building2 size={15} color="var(--blue-400)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--blue-400)' }}>
                      {job.company_name || '—'}
                    </span>
                    <span className={`badge ${job.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {job.is_active ? 'Active' : 'Closed'}
                    </span>
                    <span className={`badge ${job.type === 'Internship' || job.type === 'Internship to Placement' ? 'badge-info' : 'badge-primary'}`}>
                      {job.type}
                    </span>
                    {job.is_remote && <span className="badge badge-purple">Remote</span>}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {job.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={13} /> {job.category || 'General'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {job.location || 'Not specified'}</span>
                    {job.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--success)' }}>
                      {job.stipend || job.salary || 'Negotiable'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Link to={`/applications?jobId=${job.id}`} className="btn btn-secondary btn-sm"
                    style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'var(--border-blue)' }}>
                    <Users size={14} color="var(--blue-400)" />
                    <strong style={{ color: 'var(--blue-400)' }}>{job.liveApplicants}</strong> Applicants
                  </Link>
                </div>
              </div>

              {job.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
              )}

              {job.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {job.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '10px' }}>
                <button className={`btn btn-sm ${job.is_active ? 'btn-outline' : 'btn-success'}`} onClick={() => handleToggleStatus(job)}>
                  {job.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {job.is_active ? 'Close Applications' : 'Activate Posting'}
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/applications?jobId=${job.id}`} className="btn btn-primary btn-sm">
                    Review Applications ({job.liveApplicants})
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedJob(job); setModalOpen(true); }}>
                    <Edit3 size={13} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card" style={{ padding: '60px 20px' }}>
          <div className="empty-state__icon">📋</div>
          <h3 className="empty-state__title">{jobs.length === 0 ? 'No job postings yet' : 'No matching jobs'}</h3>
          <p className="empty-state__desc" style={{ marginBottom: '24px' }}>
            {jobs.length === 0 ? 'Publish your first job to start receiving applications.' : 'Try clearing your search filters.'}
          </p>
          {jobs.length === 0 && (
            <button className="btn btn-primary" onClick={() => { setSelectedJob(null); setModalOpen(true); }}>
              <PlusCircle size={16} /> Post Your First Job
            </button>
          )}
        </div>
      )}

      <JobModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchMyJobs} initialJob={selectedJob} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT VIEW
// ─────────────────────────────────────────────────────────────
function StudentJobsView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyParam = searchParams.get('company') || 'All';

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  const CATEGORIES = ['All', 'General', 'Engineering', 'Data Science', 'Product', 'Design', 'Business', 'Marketing'];
  const TYPES = ['All', 'Full-Time', 'Internship', 'Internship to Placement', 'Part-Time', 'Contract'];

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'student' || (!user?.role && user)) fetchAppliedJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAppliedJobs = async () => {
    const { data } = await supabase.from('applications').select('job_id').eq('student_id', user.id);
    if (data) setAppliedJobIds(data.map(a => a.job_id));
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  // Filtered jobs based on search, category, type, and URL companyParam
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        j.title?.toLowerCase().includes(q) ||
        j.company_name?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q);

      const matchCat = category === 'All' || j.category === category;
      const matchType = jobType === 'All' || j.type === jobType;
      const matchCompany = companyParam === 'All' ||
        j.company_name?.toLowerCase() === companyParam.toLowerCase();

      return matchSearch && matchCat && matchType && matchCompany;
    });
  }, [jobs, search, category, jobType, companyParam]);

  const handleApply = async (jobId) => {
    if (!user) { toast.error('Please sign in to apply.'); return; }
    if (user.role !== 'student') { toast.error('Only students can apply.'); return; }

    setApplyingId(jobId);
    const tid = toast.loading('Submitting application...');
    try {
      const { error } = await supabase.from('applications')
        .insert([{ job_id: jobId, student_id: user.id, status: 'Applied' }]);
      if (error) throw error;

      // Increment applicants_count
      const { data: cur } = await supabase.from('jobs').select('applicants_count').eq('id', jobId).maybeSingle();
      await supabase.from('jobs').update({ applicants_count: (cur?.applicants_count || 0) + 1 }).eq('id', jobId);

      setAppliedJobIds(prev => [...prev, jobId]);
      toast.success('Applied successfully! Track in My Applications.', { id: tid });
    } catch (err) {
      toast.error(`Application failed: ${err.message}`, { id: tid });
    } finally {
      setApplyingId(null);
    }
  };

  const clearCompanyFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('company');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('All');
    setJobType('All');
    clearCompanyFilter();
  };

  const hasActiveFilters = companyParam !== 'All' || category !== 'All' || jobType !== 'All' || search;

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <h1 className="section-title">Explore Jobs & Internships</h1>
        <p className="section-subtitle">Find top job openings curated for students and new graduates.</p>
      </div>

      {/* Active Company Filter Banner if opened from Company Screen */}
      {companyParam !== 'All' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid var(--border-blue)',
            borderRadius: 'var(--r-md)',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--gradient-blue)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {companyParam.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Showing jobs at <span style={{ color: 'var(--primary)' }}>{companyParam}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {filteredJobs.length} {filteredJobs.length === 1 ? 'opening available' : 'openings available'}
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={clearCompanyFilter}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <X size={14} /> View All Companies
          </button>
        </div>
      )}

      {/* Search + Category & Type Filters */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', top: '13px', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by job title or keyword..."
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select form-input" style={{ width: '170px' }} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select className="form-select form-input" style={{ width: '200px' }} value={jobType} onChange={e => setJobType(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={clearAllFilters}>
              <X size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results summary */}
      {!loading && (
        <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Found <strong style={{ color: 'var(--blue-400)' }}>{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? 's' : ''}
          {companyParam !== 'All' ? ` at ${companyParam}` : ''}
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : (
        <div className="grid-3">
          {filteredJobs.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Logo letter + type badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: '46px', height: '46px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid var(--border-blue)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 700, color: 'var(--blue-400)',
                }}>
                  {job.company_name ? job.company_name.charAt(0).toUpperCase() : '🏢'}
                </div>
                <span className={`badge ${job.type === 'Internship' || job.type === 'Internship to Placement' ? 'badge-info' : 'badge-success'}`}>
                  {job.type}
                </span>
              </div>

              {/* Title + company */}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {job.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSearchParams({ company: job.company_name })}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontSize: '0.88rem', color: 'var(--blue-400)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                  title={`Filter by ${job.company_name}`}
                >
                  <Building2 size={13} />
                  {job.company_name || 'Hiring Company'}
                </button>
              </div>

              {/* Location & category */}
              <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {job.location || 'India'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Briefcase size={12} /> {job.category || 'General'}</span>
              </div>

              {/* Description snippet */}
              {job.description && (
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                  {job.description}
                </p>
              )}

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {job.skills.slice(0, 3).map((s, i) => <span key={i} className="tag">{s}</span>)}
                  {job.skills.length > 3 && <span className="tag">+{job.skills.length - 3}</span>}
                </div>
              )}

              {/* Salary + Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--success)' }}>
                    {job.stipend || job.salary || 'Best in Industry'}
                  </div>
                  {job.deadline && (
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {appliedJobIds.includes(job.id) ? (
                  <span className="badge badge-success">Applied ✓</span>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => handleApply(job.id)} disabled={applyingId === job.id}>
                    {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state__icon">🔍</div>
              <h3 className="empty-state__title">No jobs found</h3>
              <p className="empty-state__desc">Try adjusting your filters or search query.</p>
              {hasActiveFilters && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
