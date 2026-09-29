import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, Mail, Phone, Building, Book, GraduationCap, 
  Award, FileText, ExternalLink, CheckCircle, Clock, 
  XCircle, Check, Briefcase 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CandidateModal({ isOpen, onClose, application, onStatusChange }) {
  if (!isOpen || !application) return null;

  const candidate = application.candidate || application.profiles || {};
  const job = application.job || application.jobs || {};
  const [currentStatus, setCurrentStatus] = useState(application.status || 'Applied');
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    if (updating || newStatus === currentStatus) return;
    setUpdating(true);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;

      // Try sending notification to student
      if (candidate.id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: candidate.id,
            title: `Application Update: ${job.title || 'Job'}`,
            message: `Your application status has been updated to "${newStatus}".`,
            type: newStatus === 'Rejected' ? 'error' : (newStatus === 'Offered' ? 'success' : 'info'),
            is_read: false
          }])
          .catch(() => {});
      }

      setCurrentStatus(newStatus);
      toast.success(`Application marked as ${newStatus}!`, { id: toastId });
      if (onStatusChange) {
        onStatusChange(application.id, newStatus);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(`Failed to update status: ${err.message}`, { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return 'badge-info';
      case 'Shortlisted': return 'badge-success';
      case 'Interviewing': return 'badge-warning';
      case 'Offered': return 'badge-purple';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--gradient-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>
              {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h2 className="modal-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                {candidate.name || 'Candidate Profile'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Applied for <strong style={{ color: 'var(--blue-400)' }}>{job.title || 'Job Opening'}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Status & Applied Info Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status:</span>
              <span className={`badge ${getStatusBadge(currentStatus)}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {currentStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Applied on {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Recent'}
            </div>
          </div>

          {/* Quick Contact & Academic Cards */}
          <div className="grid-2">
            {/* Contact Card */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--blue-400)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} /> Contact Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--text-muted)" />
                  <a href={`mailto:${candidate.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                    {candidate.email || 'Email not provided'}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="var(--text-muted)" />
                  <span>{candidate.phone || 'Phone not provided'}</span>
                </div>
                {candidate.linkedin_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExternalLink size={14} color="var(--text-muted)" />
                    <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue-400)' }}>
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {candidate.github_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExternalLink size={14} color="var(--text-muted)" />
                    <a href={candidate.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue-400)' }}>
                      GitHub Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Card */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--blue-400)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={15} /> Academic Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={14} color="var(--text-muted)" />
                  <span>{candidate.college || 'College not specified'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Book size={14} color="var(--text-muted)" />
                  <span>{candidate.degree || 'Degree'} {candidate.branch ? `in ${candidate.branch}` : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>Graduation Year: {candidate.graduation_year || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={14} color="var(--text-muted)" />
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    CGPA: {candidate.cgpa ? `${candidate.cgpa} / 10` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Technical Skills & Expertise
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {candidate.skills.map((skill, i) => (
                  <span key={i} className="tag" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio / Summary */}
          {candidate.bio && (
            <div className="glass-card" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Candidate Summary / Bio
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {candidate.bio}
              </p>
            </div>
          )}

          {/* Cover Letter / Note */}
          {application.cover_letter && (
            <div className="glass-card" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Cover Letter / Applicant Note
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {application.cover_letter}
              </p>
            </div>
          )}

          {/* Resume Download / Link */}
          {(application.resume_url || candidate.resume_url) ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid var(--border-blue)',
              borderRadius: 'var(--r-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={24} color="var(--blue-400)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Candidate Resume / CV</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attached with application</div>
                </div>
              </div>
              <a
                href={application.resume_url || candidate.resume_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
              >
                <ExternalLink size={14} /> Open Resume
              </a>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No direct resume URL attached. Candidate details above provided via registered profile.
            </div>
          )}

          {/* Application Status Actions */}
          <div style={{
            marginTop: '8px',
            padding: '16px',
            background: 'rgba(15,23,42,0.6)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
              Update Application Status:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                className={`btn btn-sm ${currentStatus === 'Shortlisted' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => handleUpdateStatus('Shortlisted')}
                disabled={updating}
              >
                <CheckCircle size={14} /> Shortlist
              </button>

              <button
                type="button"
                className={`btn btn-sm ${currentStatus === 'Interviewing' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleUpdateStatus('Interviewing')}
                disabled={updating}
              >
                <Clock size={14} /> Schedule Interview
              </button>

              <button
                type="button"
                className={`btn btn-sm ${currentStatus === 'Offered' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleUpdateStatus('Offered')}
                disabled={updating}
                style={currentStatus === 'Offered' ? { background: 'var(--info)', borderColor: 'var(--info)' } : {}}
              >
                <Award size={14} /> Make Offer
              </button>

              <button
                type="button"
                className={`btn btn-sm ${currentStatus === 'Rejected' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => handleUpdateStatus('Rejected')}
                disabled={updating}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
