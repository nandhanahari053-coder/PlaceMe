import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { X, Briefcase, PlusCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JobModal({ isOpen, onClose, onSuccess, initialJob = null }) {
  const { user, profile } = useAuth();
  const isEditing = Boolean(initialJob?.id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering',
    type: 'Full-Time',
    location: '',
    is_remote: false,
    salary: '',
    stipend: '',
    duration: '',
    deadline: '',
    skills: '',
    requirements: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialJob) {
      setFormData({
        title: initialJob.title || '',
        category: initialJob.category || 'Engineering',
        type: initialJob.type || 'Full-Time',
        location: initialJob.location || '',
        is_remote: Boolean(initialJob.is_remote),
        salary: initialJob.salary || '',
        stipend: initialJob.stipend || '',
        duration: initialJob.duration || '',
        deadline: initialJob.deadline ? initialJob.deadline.split('T')[0] : '',
        skills: Array.isArray(initialJob.skills) ? initialJob.skills.join(', ') : (initialJob.skills || ''),
        requirements: Array.isArray(initialJob.requirements) ? initialJob.requirements.join('\n') : (initialJob.requirements || ''),
        description: initialJob.description || '',
      });
    } else {
      setFormData({
        title: '',
        category: 'Engineering',
        type: 'Full-Time',
        location: profile?.company_location || '',
        is_remote: false,
        salary: '',
        stipend: '',
        duration: '',
        deadline: '',
        skills: '',
        requirements: '',
        description: '',
      });
    }
  }, [initialJob, profile, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getOrCreateCompanyId = async () => {
    const compName = profile?.company_name?.trim() || profile?.name?.trim() || 'Hiring Company';
    try {
      const { data: existingComp, error: searchErr } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', compName)
        .limit(1)
        .maybeSingle();

      if (existingComp?.id) {
        return existingComp.id;
      }

      // If no matching company found, create one
      const { data: newComp, error: insertCompErr } = await supabase
        .from('companies')
        .insert([{
          name: compName,
          industry: profile?.company_industry || 'Technology',
          location: profile?.company_location || formData.location || 'India',
          size: profile?.company_size || '50-200 employees',
          logo: compName.charAt(0).toUpperCase() || '🏢',
          description: profile?.bio || `${compName} is actively hiring talented graduates.`,
          rating: 4.5,
          openings: 1
        }])
        .select('id')
        .single();

      if (newComp?.id) {
        return newComp.id;
      }
      return null;
    } catch (e) {
      console.warn('Company lookup note:', e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isEditing ? 'Updating job posting...' : 'Posting new job...');

    try {
      const companyId = await getOrCreateCompanyId();

      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const requirementsArray = formData.requirements
        ? formData.requirements.split('\n').map(r => r.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        type: formData.type,
        location: formData.location.trim() || (formData.is_remote ? 'Remote' : 'On-Site'),
        is_remote: formData.is_remote,
        salary: formData.salary.trim() || null,
        stipend: formData.stipend.trim() || null,
        duration: formData.duration.trim() || null,
        deadline: formData.deadline || null,
        skills: skillsArray,
        requirements: requirementsArray,
        description: formData.description.trim() || null,
        is_active: true,
      };

      if (companyId) {
        payload.company_id = companyId;
      }

      if (isEditing) {
        const { error } = await supabase
          .from('jobs')
          .update(payload)
          .eq('id', initialJob.id)
          .eq('posted_by', user.id);

        if (error) throw error;
        toast.success('Job posting updated successfully!', { id: toastId });
      } else {
        payload.posted_by = user.id;
        payload.applicants_count = 0;

        const { error } = await supabase
          .from('jobs')
          .insert([payload]);

        if (error) throw error;
        toast.success('Job posted successfully!', { id: toastId });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving job:', err);
      toast.error(`Failed to save job: ${err.message || 'Unknown error'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Briefcase size={22} color="var(--blue-400)" />
            {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title & Category */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  name="title"
                  className="form-input"
                  placeholder="e.g. Software Engineer, Frontend Intern"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-input form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            {/* Type & Location */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  name="type"
                  className="form-input form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  name="location"
                  className="form-input"
                  placeholder="e.g. Bangalore, Mumbai or Hybrid"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Remote Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="is_remote"
                name="is_remote"
                checked={formData.is_remote}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="is_remote" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                This is a 100% Remote position
              </label>
            </div>

            {/* Compensation & Duration */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  {formData.type === 'Internship' ? 'Stipend' : 'Annual Salary / CTC'}
                </label>
                <input
                  name={formData.type === 'Internship' ? 'stipend' : 'salary'}
                  className="form-input"
                  placeholder={formData.type === 'Internship' ? 'e.g. ₹25,000 / month' : 'e.g. ₹8,00,000 - ₹12,00,000 / year'}
                  value={formData.type === 'Internship' ? formData.stipend : formData.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration / Commitment</label>
                <input
                  name="duration"
                  className="form-input"
                  placeholder="e.g. 6 Months, Permanent"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Deadline & Skills */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (comma-separated)</label>
                <input
                  name="skills"
                  className="form-input"
                  placeholder="e.g. React, Node.js, Python, SQL"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="form-group">
              <label className="form-label">Eligibility / Requirements (one per line)</label>
              <textarea
                name="requirements"
                className="form-input form-textarea"
                rows={3}
                placeholder="e.g.&#10;B.Tech/BE in CS/IT or related field&#10;Minimum 7.0 CGPA with no active backlogs&#10;Strong problem solving and communication skills"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Job Description & Responsibilities</label>
              <textarea
                name="description"
                className="form-input form-textarea"
                rows={4}
                placeholder="Describe the role, day-to-day responsibilities, perks, and hiring process..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <>
                  <Check size={16} />
                  {isEditing ? 'Save Changes' : 'Publish Job'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
