import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    await new Promise(res => setTimeout(res, 800)); // Simulate API call
    // Demo login - in production connect to backend
    const user = {
      id: 1,
      name: formData.role === 'student' ? 'Arjun Sharma' : 'TechCorp HR',
      email: formData.email,
      role: formData.role,
      college: formData.role === 'student' ? 'IIT Bombay' : null,
      company: formData.role === 'company' ? 'TechCorp Pvt. Ltd.' : null,
    };
    onLogin(user);
    setLoading(false);
    navigate(formData.role === 'student' ? '/student-dashboard' : '/company-dashboard');
  };

  return (
    <main className="auth-page" id="login-page">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb--1"></div>
        <div className="auth-orb auth-orb--2"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card glass-card" id="login-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo" id="login-logo">
              <span className="auth-logo-icon">🎓</span>
              <span>PlaceMe</span>
            </Link>
            <h1 className="auth-title" id="login-title">Welcome Back!</h1>
            <p className="auth-subtitle">Sign in to continue your placement journey</p>
          </div>

          {/* Role Toggle */}
          <div className="tabs" id="login-role-toggle">
            <button
              className={`tab-btn ${formData.role === 'student' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
              id="login-student-tab"
              type="button"
            >
              👨‍🎓 Student
            </button>
            <button
              className={`tab-btn ${formData.role === 'company' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'company' }))}
              id="login-company-tab"
              type="button"
            >
              🏢 Company
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-forgot">
              <a href="#" id="forgot-password-link">Forgot password?</a>
            </div>

            {error && (
              <div className="auth-error" id="login-error">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-demo-hint" id="login-demo-hint">
            <div className="auth-demo-hint__icon">💡</div>
            <div>
              <strong>Demo:</strong> Enter any email & password to login as {formData.role}
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link" id="login-register-link">Create one free →</Link>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side" id="login-side-panel">
          <div className="auth-side__content">
            <h2 className="auth-side__title">
              Your <span className="gradient-text">Dream Career</span> Awaits
            </h2>
            <div className="auth-side__stats">
              <div className="auth-side__stat">
                <div className="auth-side__stat-value">50K+</div>
                <div className="auth-side__stat-label">Students Placed</div>
              </div>
              <div className="auth-side__stat">
                <div className="auth-side__stat-value">1200+</div>
                <div className="auth-side__stat-label">Partner Companies</div>
              </div>
              <div className="auth-side__stat">
                <div className="auth-side__stat-value">₹12 LPA</div>
                <div className="auth-side__stat-label">Avg. Package</div>
              </div>
            </div>
            <div className="auth-side__badges">
              {['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Razorpay', 'Infosys'].map(c => (
                <span key={c} className="tag">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
