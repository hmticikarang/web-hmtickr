import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, createSessionToken } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user ke Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    // 1st attempt: Standard bcrypt compare
    let isValid = await bcrypt.compare(password, user.password_hash);

    // 2nd attempt: If hash starts with $2y$ (PHP format), try converting $2y$ to $2a$ for bcryptjs compatibility
    if (!isValid && user.password_hash && user.password_hash.startsWith('$2y$')) {
      const normalizedHash = user.password_hash.replace(/^\$2y\$/, '$2a$');
      isValid = await bcrypt.compare(password, normalizedHash);
    }

    if (!isValid || user.role !== 'admin') {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    // Buat token sesi terenkripsi (berlaku 8 jam)
    const token = createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 8 * 3600 * 1000,
    });

    const response = NextResponse.json({
      email: user.email,
      role: user.role,
      token,
    });

    // Set HttpOnly Cookie untuk keamanan maksimal
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err.message);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
