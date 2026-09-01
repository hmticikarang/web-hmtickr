import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    console.log('=== [DEBUG LOGIN ADMIN] START ===');
    console.log('1. Email dari frontend:', email);
    console.log('2. Password diterima (length):', password ? password.length : 0);
    console.log('3. SUPABASE_SERVICE_ROLE_KEY ada?:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));
    console.log('4. NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    if (!email || !password) {
      console.log('[DEBUG LOGIN] Bad Request: Email atau password kosong');
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log('5. Searching user with clean email:', cleanEmail);

    // Query user ke Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    console.log('6. Supabase query error:', error ? error.message : null);
    console.log('7. Supabase query result user:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      password_hash_length: user.password_hash?.length,
      password_hash_prefix: user.password_hash?.substring(0, 7)
    } : 'USER NOT FOUND');

    if (error) {
      console.error('[DEBUG LOGIN ERROR] Gagal query Supabase:', error.message);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 401 });
    }

    if (!user) {
      console.log(`[DEBUG LOGIN] User dengan email "${cleanEmail}" tidak ditemukan di database.`);
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    // 1st attempt: Standard bcrypt compare
    let isValid = await bcrypt.compare(password, user.password_hash);
    console.log('8. bcrypt.compare standard result:', isValid);

    // 2nd attempt: If hash starts with $2y$ (PHP format), try converting $2y$ to $2a$ for bcryptjs compatibility
    if (!isValid && user.password_hash && user.password_hash.startsWith('$2y$')) {
      const normalizedHash = user.password_hash.replace(/^\$2y\$/, '$2a$');
      isValid = await bcrypt.compare(password, normalizedHash);
      console.log('9. bcrypt.compare normalized ($2a$) result:', isValid);
    }

    console.log('10. Final login authorization status:', isValid ? 'SUCCESS' : 'FAILED');
    console.log('=== [DEBUG LOGIN ADMIN] END ===');

    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    return NextResponse.json({
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('[DEBUG LOGIN EXCEPTION] Catch block error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
