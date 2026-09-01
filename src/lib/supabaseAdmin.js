import { createClient } from '@supabase/supabase-js';

// PENTING: file ini HANYA boleh diimport dari server (Route Handlers/API routes),
// TIDAK BOLEH diimport dari komponen client ('use client'), karena
// SUPABASE_SERVICE_ROLE_KEY memiliki akses penuh (bypass RLS).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn(
    '[SUPABASE ADMIN WARNING] SUPABASE_SERVICE_ROLE_KEY belum diset di .env.local atau environment variable server. Operasi admin (bypassing RLS) tidak akan berfungsi!'
  );
}

if (!supabaseUrl) {
  console.warn(
    '[SUPABASE ADMIN WARNING] NEXT_PUBLIC_SUPABASE_URL belum diset.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { autoRefreshToken: false, persistSession: false },
});

import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || serviceRoleKey || 'hmti-cikarang-secure-admin-secret-2026';

export function createSessionToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verifikasi sesi admin aman.
 * Memverifikasi cryptographic token dari HttpOnly Cookie ('admin_session')
 * atau Authorization header (Bearer token).
 */
export async function verifyAdminSession(request) {
  let token = request.cookies?.get?.('admin_session')?.value;
  if (!token) {
    const authHeader = request.headers?.get?.('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !payload.email) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('email', payload.email)
    .single();

  if (error || !data || data.role !== 'admin') return null;
  return data;
}

/**
 * Ekstrak relative path file dari public URL Supabase Storage.
 * Contoh URL: https://xxx.supabase.co/storage/v1/object/public/himpunan-media/projects/123.jpg?t=1725...
 * Output: 'projects/123.jpg'
 */
export function getStoragePathFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // Hapus query string & hash (misal ?t=123 atau ?token=...)
  let cleanUrl = url.split('?')[0].split('#')[0];

  // Cari marker '/himpunan-media/' dalam URL
  const bucketMarker = '/himpunan-media/';
  const index = cleanUrl.indexOf(bucketMarker);

  if (index !== -1) {
    cleanUrl = cleanUrl.substring(index + bucketMarker.length);
  }

  // Handle URL encoding (contoh: %20 -> spasi)
  try {
    cleanUrl = decodeURIComponent(cleanUrl);
  } catch {
    // Jika decodeURIComponent gagal, gunakan cleanUrl apa adanya
  }

  // Jika URL berupa full http(s) URL yang tidak cocok dengan marker bucket
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return null;
  }

  return cleanUrl.trim() || null;
}

/**
 * Hapus file dari Supabase Storage (bucket 'himpunan-media') berdasarkan URL / list of URL.
 */
export async function deleteStorageFilesFromUrls(urls) {
  if (!urls) return;
  const urlList = (Array.isArray(urls) ? urls : [urls]).flat();
  const filePaths = urlList
    .map((url) => getStoragePathFromUrl(url))
    .filter(Boolean);

  if (filePaths.length === 0) return;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('himpunan-media')
      .remove(filePaths);

    if (error) {
      console.error('Error deleting storage files:', error.message, filePaths);
    } else {
      console.log('Berhasil menghapus file storage:', filePaths);
    }
  } catch (err) {
    console.error('Error executing storage remove:', err);
  }
}

