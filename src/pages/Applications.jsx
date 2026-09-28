import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, Building, Clock, MapPin, Search } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchApps();
    }
  }, [user]);

  const fetchApps = async () => {
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
  };

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'student') return <Navigate to="/dashboard" />;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'badge-info';
      case 'Shortlisted': return 'badge-success';
      case 'Interviewing': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      case 'Offered': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">My Applications</h1>
          <p className="section-subtitle">Track the status of your job and internship applications.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app.id} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '2.5rem', width: '64px', height: '64px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                {app.job?.company?.logo || '🏢'}
              </div>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{app.job?.title}</h3>
                  <span className={`badge ${getStatusColor(app.status)}`}>{app.status}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--blue-400)', marginBottom: '12px' }}>
                  {app.job?.company?.name}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {app.job?.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {app.job?.type}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                 <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>
                  {app.job?.stipend || app.job?.salary}
                 </div>
                 <Link to="/jobs" className="btn btn-secondary btn-sm">View Job</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state glass-card" style={{ padding: '60px 20px', borderRadius: 'var(--r-lg)' }}>
            <div className="empty-state__icon">📄</div>
            <h3 className="empty-state__title">No applications yet</h3>
            <p className="empty-state__desc" style={{ marginBottom: '24px' }}>You haven't applied to any jobs or internships yet.</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        )}
      </div>
    </div>
  );
}
