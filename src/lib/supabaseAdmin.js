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

/**
 * Verifikasi sesi admin sederhana.
 * Client mengirim header 'x-admin-email' setelah login berhasil.
 * Kita re-verifikasi bahwa email tsb benar-benar ada di tabel users dengan role admin.
 * (Simple session, cocok untuk skala organisasi mahasiswa — bukan pengganti auth production-grade.)
 */
export async function verifyAdminSession(request) {
  const email = request.headers.get('x-admin-email');
  if (!email) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Ekstrak relative path file dari public URL Supabase Storage.
 * Contoh URL: https://xxx.supabase.co/storage/v1/object/public/himpunan-media/projects/123.jpg
 * Output: 'projects/123.jpg'
 */
export function getStoragePathFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/storage/v1/object/public/himpunan-media/';
  const index = url.indexOf(marker);
  if (index !== -1) {
    return url.substring(index + marker.length);
  }
  return null;
}

/**
 * Hapus file dari Supabase Storage (bucket 'himpunan-media') berdasarkan URL / list of URL.
 */
export async function deleteStorageFilesFromUrls(urls) {
  if (!urls) return;
  const urlList = Array.isArray(urls) ? urls : [urls];
  const filePaths = urlList
    .map((url) => getStoragePathFromUrl(url))
    .filter(Boolean);

  if (filePaths.length === 0) return;

  try {
    const { error } = await supabaseAdmin.storage
      .from('himpunan-media')
      .remove(filePaths);

    if (error) {
      console.error('Error deleting storage files:', error.message);
    }
  } catch (err) {
    console.error('Error executing storage remove:', err);
  }
}

