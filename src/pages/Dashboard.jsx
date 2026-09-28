import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigate, Link } from 'react-router-dom';
import { Briefcase, Bell, CheckCircle, Clock, Award, Building, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Welcome back, {profile?.name?.split(' ')[0] || 'User'}!</p>
        </div>
      </div>
      
      {profile?.role === 'student' ? <StudentDashboard /> : <CompanyDashboard />}
    </div>
  );
}

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

      // 2. Fetch Recommended Jobs (Mock: just getting 3 latest)
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
      console.error('Error fetching dashboard data', err);
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

function CompanyDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCompanyJobs();
    }
  }, [user]);

  const fetchCompanyJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
  };

  const stats = [
    { label: 'Active Jobs', value: jobs.filter(j => j.is_active).length, icon: <Briefcase /> },
    { label: 'Total Applications', value: jobs.reduce((sum, j) => sum + (j.applicants_count || 0), 0), icon: <FileText /> },
    { label: 'Hires', value: 0, icon: <CheckCircle /> }, // Dummy for now
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
       {/* Stats Grid */}
       <div className="grid-3">
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--blue-400)', marginBottom: '12px' }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
       </div>

       <div className="glass-card" style={{ padding: '32px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Job Postings</h3>
            <button className="btn btn-primary">Post New Job</button>
         </div>
         {jobs.length > 0 ? (
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                 <th style={{ padding: '12px 0' }}>Job Title</th>
                 <th style={{ padding: '12px 0' }}>Status</th>
                 <th style={{ padding: '12px 0' }}>Applicants</th>
                 <th style={{ padding: '12px 0' }}>Posted On</th>
                 <th style={{ padding: '12px 0' }}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {jobs.map(job => (
                 <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <td style={{ padding: '16px 0', fontWeight: 600 }}>{job.title}</td>
                   <td style={{ padding: '16px 0' }}>
                     <span className={`badge ${job.is_active ? 'badge-success' : 'badge-danger'}`}>
                       {job.is_active ? 'Active' : 'Closed'}
                     </span>
                   </td>
                   <td style={{ padding: '16px 0' }}>{job.applicants_count || 0}</td>
                   <td style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                     {new Date(job.created_at).toLocaleDateString()}
                   </td>
                   <td style={{ padding: '16px 0' }}>
                     <button className="btn btn-outline btn-sm">View Details</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <div className="empty-state">
             <div className="empty-state__icon">📄</div>
             <h3 className="empty-state__title">No Jobs Posted</h3>
             <p className="empty-state__desc">You haven't posted any jobs yet. Create a job listing to start receiving applications.</p>
           </div>
         )}
       </div>
    </div>
  );
}
