import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="main-footer">
      <div className="footer__glow"></div>
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo" id="footer-logo">
              <div className="footer__logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#fGrad1)" />
                  <path d="M2 17l10 5 10-5" stroke="url(#fGrad2)" strokeWidth="2" fill="none" />
                  <path d="M2 12l10 5 10-5" stroke="url(#fGrad3)" strokeWidth="2" fill="none" />
                  <defs>
                    <linearGradient id="fGrad1" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="fGrad2" x1="0" y1="0" x2="1" y2="0">
                      <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="fGrad3" x1="0" y1="0" x2="1" y2="0">
                      <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span>PlaceMe</span>
            </Link>
            <p className="footer__tagline">
              Connecting talented students with their dream careers. Your placement journey starts here.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social" id="footer-linkedin" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="#" className="footer__social" id="footer-twitter" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" className="footer__social" id="footer-github" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__heading">For Students</h4>
            <ul className="footer__links">
              <li><Link to="/jobs" id="footer-browse-jobs">Browse Jobs</Link></li>
              <li><Link to="/register" id="footer-create-profile">Create Profile</Link></li>
              <li><Link to="/student-dashboard" id="footer-track-apps">Track Applications</Link></li>
              <li><Link to="/companies" id="footer-companies">View Companies</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">For Companies</h4>
            <ul className="footer__links">
              <li><Link to="/register" id="footer-post-job">Post a Job</Link></li>
              <li><Link to="/company-dashboard" id="footer-manage-postings">Manage Postings</Link></li>
              <li><Link to="/company-dashboard" id="footer-review-apps">Review Applications</Link></li>
              <li><Link to="/register" id="footer-company-register">Register Company</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">Platform</h4>
            <ul className="footer__links">
              <li><a href="#" id="footer-about">About Us</a></li>
              <li><a href="#" id="footer-blog">Blog</a></li>
              <li><a href="#" id="footer-privacy">Privacy Policy</a></li>
              <li><a href="#" id="footer-terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} PlaceMe. All rights reserved. Built with ❤️ for students.</p>
          <div className="footer__bottom-links">
            <a href="#" id="footer-privacy-link">Privacy</a>
            <a href="#" id="footer-terms-link">Terms</a>
            <a href="#" id="footer-contact-link">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
