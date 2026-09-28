import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockProfiles } from '../lib/mockDb';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, Book, GraduationCap, Code, MapPin, Building, Briefcase } from 'lucide-react';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const [msg, setMsg] = useState('');

  if (!user) return <Navigate to="/login" />;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillsChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, skills: val.split(',').map(s => s.trim()) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = mockProfiles.update(user.id, formData);
    if (!res.error) {
      updateProfile(res.data);
      setIsEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const isStudent = user.role === 'student';

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="section-subtitle">Manage your personal and professional details.</p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>

      {msg && <div className="alert alert-success" style={{ marginBottom: '24px' }}>{msg}</div>}

      <div className="glass-card" style={{ padding: '32px' }}>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" value={formData.name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" className="form-input" value={formData.phone || ''} onChange={handleChange} />
              </div>
              
              {isStudent ? (
                <>
                  <div className="form-group">
                    <label className="form-label">College / University</label>
                    <input name="college" className="form-input" value={formData.college || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch / Department</label>
                    <input name="branch" className="form-input" value={formData.branch || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input name="degree" className="form-input" value={formData.degree || ''} onChange={handleChange} placeholder="e.g. B.Tech" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <input type="number" name="graduation_year" className="form-input" value={formData.graduation_year || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CGPA</label>
                    <input type="number" step="0.01" name="cgpa" className="form-input" value={formData.cgpa || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skills (comma separated)</label>
                    <input name="skills" className="form-input" value={formData.skills?.join(', ') || ''} onChange={handleSkillsChange} placeholder="e.g. React, Node.js, Python" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Resume Link (URL)</label>
                    <input name="resume_url" className="form-input" value={formData.resume_url || ''} onChange={handleChange} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input name="company_name" className="form-input" value={formData.company_name || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input name="company_industry" className="form-input" value={formData.company_industry || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input name="company_location" className="form-input" value={formData.company_location || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Size</label>
                    <input name="company_size" className="form-input" value={formData.company_size || ''} onChange={handleChange} />
                  </div>
                </>
              )}

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bio / About</label>
                <textarea name="bio" className="form-input form-textarea" value={formData.bio || ''} onChange={handleChange}></textarea>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
                {profile?.name?.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{profile?.name}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
                  {profile?.email} {profile?.role === 'student' ? '🎓 Student' : '🏢 Company'}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Profile Completion</div>
                <div className="progress-bar" style={{ width: '150px' }}>
                  <div className="progress-fill" style={{ width: `${profile?.profile_completion || 0}%` }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{profile?.profile_completion || 0}%</div>
              </div>
            </div>

            <div className="divider" style={{ margin: 0 }}></div>

            <div className="grid-2">
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--blue-400)' }}>Contact Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> {profile?.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> {profile?.phone || 'Not provided'}</div>
                </div>
              </div>

              {isStudent ? (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--blue-400)' }}>Academic Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={16} /> {profile?.college || 'Not provided'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Book size={16} /> {profile?.branch || 'Not provided'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={16} /> {profile?.degree} - {profile?.graduation_year}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Code size={16} /> CGPA: {profile?.cgpa || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--blue-400)' }}>Company Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={16} /> {profile?.company_name || 'Not provided'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={16} /> {profile?.company_industry || 'Not provided'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {profile?.company_location || 'Not provided'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> {profile?.company_size || 'Not provided'}</div>
                  </div>
                </div>
              )}
            </div>

            {isStudent && profile?.skills?.length > 0 && (
              <>
                <div className="divider" style={{ margin: 0 }}></div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--blue-400)' }}>Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
              </>
            )}

            {profile?.bio && (
              <>
                <div className="divider" style={{ margin: 0 }}></div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--blue-400)' }}>About</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{profile.bio}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
