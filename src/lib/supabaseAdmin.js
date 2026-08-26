import { createClient } from '@supabase/supabase-js';

// PENTING: file ini HANYA boleh diimport dari server (Route Handlers/API routes),
// TIDAK BOLEH diimport dari komponen client ('use client'), karena
// SUPABASE_SERVICE_ROLE_KEY memiliki akses penuh (bypass RLS).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY belum diset di .env.local. Semua operasi admin (login, toggle oprec, convert officer, dsb) akan gagal.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
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
