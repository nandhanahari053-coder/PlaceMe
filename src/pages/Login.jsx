import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      const msg = 'Please enter your email address.';
      setError(msg);
      toast.error(msg);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Please enter a valid email address format (e.g. user@domain.com).';
      setError(msg);
      toast.error(msg);
      return false;
    }

    if (!password) {
      const msg = 'Please enter your password.';
      setError(msg);
      toast.error(msg);
      return false;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      toast.error(msg);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    const toastId = toast.loading('Signing in to your account...');

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result?.error) {
        const errorMsg = typeof result.error === 'string' ? result.error : (result.error.message || 'Login failed.');
        setError(errorMsg);
        toast.error(`Login failed: ${errorMsg}`, { id: toastId });
        setLoading(false);
      } else {
        toast.success('Signed in successfully! Redirecting...', { id: toastId });
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred during login.';
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`, { id: toastId });
      setLoading(false);
    }
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
              <strong>Note:</strong> Sign in with your registered account credentials.
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
