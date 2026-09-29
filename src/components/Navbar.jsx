import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, GraduationCap, ChevronDown, LogOut, User, LayoutDashboard, Briefcase, FileText } from 'lucide-react';

import './Navbar.css';

const Navbar = () => {
  const { user, profile, logout, unreadCount } = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdown(false); }, [location]);

  const isActive = (p) => location.pathname === p;

  const handleLogout = () => { logout(); navigate('/'); };

  const isCompany = user?.role === 'company' || profile?.role === 'company';

  const navLinks = isCompany
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/jobs', label: 'Job Postings' },
        { to: '/applications', label: 'Applications' },
        { to: '/profile', label: 'Company Profile' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/jobs', label: 'Jobs' },
        { to: '/companies', label: 'Companies' },
        ...(user ? [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/applications', label: 'My Applications' },
        ] : []),
      ];

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner container">

        {/* Logo */}
        <Link to={isCompany ? '/dashboard' : '/'} className="navbar__logo" id="nav-logo">
          <div className="navbar__logo-icon">
            <GraduationCap size={20} strokeWidth={2.2} />
          </div>
          <span className="navbar__logo-text">PlaceMe</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links" aria-label="Main navigation">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`navbar__link ${isActive(to) ? 'navbar__link--active' : ''}`} id={`nav-${label.toLowerCase()}`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              {/* Notification Bell */}
              <Link to="/dashboard" className="navbar__icon-btn" id="nav-notifications" title="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="navbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>

              {/* User Dropdown */}
              <div className="navbar__user-wrap" id="nav-user-menu">
                <button
                  className="navbar__user-btn"
                  onClick={() => setDropdown(o => !o)}
                  id="nav-user-toggle"
                  aria-expanded={dropdownOpen}
                >
                  <div className="navbar__avatar">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="navbar__user-name">{profile?.name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown size={14} className={`navbar__chevron ${dropdownOpen ? 'open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="navbar__dropdown" id="nav-dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__dropdown-name">{profile?.name}</div>
                      <div className="navbar__dropdown-role">{profile?.role === 'student' ? '🎓 Student' : '🏢 Company'}</div>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link to="/dashboard" className="navbar__dropdown-item" id="dropdown-dashboard">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {isCompany ? (
                      <>
                        <Link to="/jobs" className="navbar__dropdown-item" id="dropdown-jobs">
                          <Briefcase size={15} /> Job Postings
                        </Link>
                        <Link to="/applications" className="navbar__dropdown-item" id="dropdown-applications">
                          <FileText size={15} /> Applications
                        </Link>
                      </>
                    ) : (
                      <Link to="/applications" className="navbar__dropdown-item" id="dropdown-applications">
                        <FileText size={15} /> My Applications
                      </Link>
                    )}
                    <Link to="/profile" className="navbar__dropdown-item" id="dropdown-profile">
                      <User size={15} /> {isCompany ? 'Company Profile' : 'My Profile'}
                    </Link>
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout} id="dropdown-logout">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-secondary btn-sm" id="nav-login">Sign In</Link>
              <Link to="/register" className="btn btn-primary  btn-sm" id="nav-register">Register</Link>
            </>
          )}

          {/* Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(o => !o)}
            id="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile anim-fade" id="mobile-menu">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`navbar__mobile-link ${isActive(to) ? 'active' : ''}`} id={`mobile-nav-${label.toLowerCase()}`}>
              {label}
            </Link>
          ))}
          <div className="navbar__mobile-actions">
            {user ? (
              <button className="btn btn-danger btn-sm btn-full" onClick={handleLogout} id="mobile-logout">
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <>
                <Link to="/login"    className="btn btn-secondary btn-sm btn-full" id="mobile-login">Sign In</Link>
                <Link to="/register" className="btn btn-primary  btn-sm btn-full" id="mobile-register">Register Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
