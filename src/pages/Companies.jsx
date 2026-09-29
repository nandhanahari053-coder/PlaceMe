import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Building, Star, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Companies() {
  const { user, profile } = useAuth();
  const isCompany = user?.role === 'company' || profile?.role === 'company';

  if (isCompany) {
    return <Navigate to="/dashboard" replace />;
  }

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    let query = supabase.from('companies').select('*');
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    const { data, error } = await query;
    if (!error && data) {
      setCompanies(data);
    }
  };

  return (
    <div className="page container">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <div>
          <h1 className="section-title">Partner Companies</h1>
          <p className="section-subtitle">Discover top companies hiring students and recent graduates.</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search companies by name or industry..."
            style={{ paddingLeft: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid-3">
        {companies.map(company => (
          <div key={company.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '2.5rem', width: '64px', height: '64px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                {company.logo}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{company.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>
                  <Star size={14} fill="currentColor" /> {company.rating} Rating
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
              {company.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Building size={14} /> {company.industry}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <MapPin size={14} /> {company.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Users size={14} /> {company.size}
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-400)' }}>
                {company.openings} Open Roles
              </div>
              <Link to="/jobs" className="btn btn-outline btn-sm">
                View Jobs
              </Link>
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state__icon">🏢</div>
            <h3 className="empty-state__title">No companies found</h3>
            <p className="empty-state__desc">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
