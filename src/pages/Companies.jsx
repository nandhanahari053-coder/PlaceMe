import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Building, Briefcase } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Companies() {
  const { user, profile } = useAuth();
  const isCompany = user?.role === 'company' || profile?.role === 'company';

  // All hooks MUST be declared before any early return (React rules of hooks)
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isCompany) fetchCompaniesFromJobs();
  }, [isCompany]);

  if (isCompany) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchCompaniesFromJobs = async () => {
    setLoading(true);
    try {
      // Query companies directly from the active jobs in the jobs table
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, category, location, type, is_active')
        .eq('is_active', true);

      if (error) throw error;

      if (data) {
        // Group by distinct company_name
        const companyMap = {};
        data.forEach(job => {
          const name = job.company_name?.trim();
          if (!name) return;

          if (!companyMap[name]) {
            companyMap[name] = {
              name,
              logo: name.charAt(0).toUpperCase() || '🏢',
              openings: 0,
              categories: new Set(),
              locations: new Set(),
            };
          }
          companyMap[name].openings += 1;
          if (job.category) companyMap[name].categories.add(job.category);
          if (job.location) companyMap[name].locations.add(job.location);
        });

        // Convert to array and sort by number of openings descending
        const list = Object.values(companyMap).map(c => ({
          ...c,
          categoryList: Array.from(c.categories).slice(0, 2).join(', ') || 'General',
          locationList: Array.from(c.locations).slice(0, 2).join(', ') || 'India',
        })).sort((a, b) => b.openings - a.openings);

        setCompanies(list);
      }
    } catch (err) {
      console.error('Error fetching companies from jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.categoryList.toLowerCase().includes(q) ||
      c.locationList.toLowerCase().includes(q)
    );
  }, [companies, search]);

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">Hiring Companies</h1>
          <p className="section-subtitle">
            Explore companies with active job and internship openings on PlaceMe.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search companies by name, category, or location..."
            style={{ paddingLeft: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : (
        <div className="grid-3">
          {filteredCompanies.map(company => (
            <div
              key={company.name}
              className="glass-card"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    width: '56px',
                    height: '56px',
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid var(--border-blue)',
                    color: 'var(--blue-400)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {company.logo}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {company.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {company.categoryList}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={14} color="var(--blue-400)" />
                  <span>Roles in: {company.categoryList}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{company.locationList}</span>
                </div>
              </div>

              <div
                style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                }}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--success)' }}>
                  {company.openings} {company.openings === 1 ? 'Open Role' : 'Open Roles'}
                </div>
                <Link
                  to={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="btn btn-outline btn-sm"
                >
                  View Jobs →
                </Link>
              </div>
            </div>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state__icon">🏢</div>
              <h3 className="empty-state__title">No companies found</h3>
              <p className="empty-state__desc">Try a different search term or clear the filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
