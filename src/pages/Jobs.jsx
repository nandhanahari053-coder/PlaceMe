import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockJobs, mockApplications } from '../lib/mockDb';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  const CATEGORIES = ['All', 'Engineering', 'Data Science', 'Product', 'Design', 'Business'];
  const TYPES = ['All', 'Full-Time', 'Internship'];

  useEffect(() => {
    fetchJobs();
    if (user && user.role === 'student') {
      const apps = mockApplications.getByStudent(user.id);
      setAppliedJobIds(apps.map(a => a.job_id));
    }
  }, [user]);

  const fetchJobs = () => {
    const res = mockJobs.getAll({ search, category, type: jobType });
    setJobs(res);
  };

  const handleApply = (jobId) => {
    if (!user) {
      alert("Please login to apply.");
      return;
    }
    if (user.role !== 'student') {
      alert("Only students can apply to jobs.");
      return;
    }
    const res = mockApplications.apply({ job_id: jobId, student_id: user.id });
    if (res.error) {
      alert(res.error.message);
    } else {
      setAppliedJobIds([...appliedJobIds, jobId]);
      alert("Successfully applied!");
    }
  };

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">Explore Jobs</h1>
          <p className="section-subtitle">Find the best jobs and internships tailored to your skills.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search jobs by title, company, or skill..."
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
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.company?.name}</div>
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
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>{job.stipend || job.salary}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadline: {job.deadline}</div>
              </div>
              {appliedJobIds.includes(job.id) ? (
                <span className="badge badge-success">Applied ✓</span>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => handleApply(job.id)}>
                  Apply Now
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
    </div>
  );
}
