import { supabase } from '../lib/supabase';

const BUCKET = 'resumes';
const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FALLBACK_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function isAllowedFile(file) {
  const lower = (file.name || '').toLowerCase();
  return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext)) || ALLOWED_MIME_TYPES.includes(file.type);
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a student's resume file to Supabase Storage (`resumes` bucket).
 * Falls back to a data URL (<= 2 MB) if Storage RLS policies are not configured yet.
 */
export async function uploadResumeFile(file, userId) {
  if (!file) throw new Error('No file selected.');
  if (!userId) throw new Error('User not authenticated.');

  if (!isAllowedFile(file)) {
    throw new Error('Please upload a PDF, DOC, or DOCX file.');
  }
  if (file.size > MAX_STORAGE_BYTES) {
    throw new Error('Resume file size must be 5 MB or less.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

  if (!uploadError) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    if (pub?.publicUrl) {
      return { url: pub.publicUrl, fileName: file.name };
    }
  }

  // Fallback if storage bucket RLS policy blocks client upload
  const msg = (uploadError?.message || '').toLowerCase();
  const isRlsOrAuth =
    uploadError?.statusCode === '403' ||
    msg.includes('row-level security') ||
    msg.includes('accessdenied') ||
    msg.includes('policy');

  if (isRlsOrAuth) {
    if (file.size > MAX_FALLBACK_BYTES) {
      throw new Error('Storage upload blocked by RLS policy and file exceeds 2 MB fallback limit.');
    }
    const dataUrl = await readAsDataUrl(file);
    return { url: dataUrl, fileName: file.name };
  }

  throw new Error(uploadError?.message || 'Failed to upload resume.');
}

/**
 * Extract a displayable filename from a stored resume URL.
 */
export function getResumeFileName(url) {
  if (!url) return '';
  if (url.startsWith('data:')) {
    if (url.includes('application/pdf')) return 'Uploaded_Resume.pdf';
    if (url.includes('wordprocessingml')) return 'Uploaded_Resume.docx';
    if (url.includes('msword')) return 'Uploaded_Resume.doc';
    return 'Uploaded_Resume';
  }
  try {
    const lastPart = decodeURIComponent(url.split('/').pop().split('?')[0]);
    return lastPart.replace(/^\d+_/, '') || 'Resume';
  } catch {
    return 'Resume';
  }
}

/**
 * Open a resume URL (supports both HTTP/Supabase Storage URLs and base64 data URLs).
 */
export function openResume(url) {
  if (!url) return;

  if (url.startsWith('data:')) {
    try {
      const [header, base64] = url.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
