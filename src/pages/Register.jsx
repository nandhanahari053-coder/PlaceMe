import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'student', 
    college: '', branch: '', company_name: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    await new Promise(res => setTimeout(res, 800)); // Simulate API call
    
    const result = await register(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      navigate(formData.role === 'student' ? '/dashboard' : '/dashboard');
    }
  };

  return (
    <main className="auth-page" id="register-page">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb--1"></div>
        <div className="auth-orb auth-orb--2"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card glass-card" id="register-card" style={{ maxWidth: '600px' }}>
          <div className="auth-header">
            <Link to="/" className="auth-logo" id="register-logo">
              <span className="auth-logo-icon">🎓</span>
              <span>PlaceMe</span>
            </Link>
            <h1 className="auth-title" id="register-title">Create Account</h1>
            <p className="auth-subtitle">Join India's top placement platform.</p>
          </div>

          <div className="tabs" id="register-role-toggle" style={{ marginBottom: '24px' }}>
            <button
              className={`tab-btn ${formData.role === 'student' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
              type="button"
            >
              👨‍🎓 Student
            </button>
            <button
              className={`tab-btn ${formData.role === 'company' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'company' }))}
              type="button"
            >
              🏢 Company / Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <div className="grid-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Name *</label>
                <input name="name" type="text" className="form-input" placeholder="e.g. John Doe" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input name="email" type="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input name="password" type="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>

              {formData.role === 'student' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">College / University</label>
                    <input name="college" type="text" className="form-input" placeholder="e.g. IIT Delhi" value={formData.college} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch / Department</label>
                    <input name="branch" type="text" className="form-input" placeholder="e.g. Computer Science" value={formData.branch} onChange={handleChange} />
                  </div>
                </>
              ) : (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Company Name *</label>
                  <input name="company_name" type="text" className="form-input" placeholder="e.g. TechCorp Inc." value={formData.company_name} onChange={handleChange} required={formData.role === 'company'} />
                </div>
              )}
            </div>

            {error && <div className="auth-error" id="register-error" style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '16px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
