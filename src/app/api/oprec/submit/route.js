import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    // 1. Cek status oprec global
    const { data: settingData } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'oprec_status')
      .single();

    if (settingData?.value !== 'open') {
      return NextResponse.json(
        { error: 'Pendaftaran Oprec saat ini sedang ditutup.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      nim,
      email,
      phone_wa,
      cohort,
      choice_div_1,
      choice_div_2,
      motivation,
    } = body || {};

    // 2. Validasi input server-side
    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }
    if (!nim || !nim.trim()) {
      return NextResponse.json({ error: 'NIM wajib diisi.' }, { status: 400 });
    }
    if (!phone_wa || !phone_wa.trim()) {
      return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi.' }, { status: 400 });
    }
    if (!cohort) {
      return NextResponse.json({ error: 'Angkatan wajib dipilih.' }, { status: 400 });
    }
    if (!choice_div_1) {
      return NextResponse.json({ error: 'Divisi utama (Pilihan 1) wajib dipilih.' }, { status: 400 });
    }
    if (!motivation || !motivation.trim()) {
      return NextResponse.json({ error: 'Motivasi wajib diisi.' }, { status: 400 });
    }

    // 3. Generasi nomor pendaftar (app_number) secara aman di server side (bypass RLS)
    const year = new Date().getFullYear();
    const { count, error: countError } = await supabaseAdmin
      .from('applicants')
      .select('id', { count: 'exact', head: true })
      .like('app_number', `OPREC-${year}-%`);

    if (countError) {
      console.error('Error counting applicants:', countError.message);
    }

    const nextNumber = (count || 0) + 1;
    const padded = String(nextNumber).padStart(3, '0');
    const app_number = `OPREC-${year}-${padded}`;

    const payload = {
      app_number,
      full_name: full_name.trim(),
      nim: nim.trim(),
      email: email ? email.trim() : '-',
      phone_wa: phone_wa.trim(),
      major: 'Teknologi Informasi',
      cohort,
      choice_div_1: choice_div_1 && !choice_div_1.startsWith('fallback') ? choice_div_1 : null,
      choice_div_2: choice_div_2 && !choice_div_2.startsWith('fallback') ? choice_div_2 : null,
      motivation: motivation.trim(),
      status: 'Pending',
    };

    // 4. Insert data pendaftar ke database Supabase
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('applicants')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting applicant:', insertError.message);
      return NextResponse.json(
        { error: `Gagal menyimpan pendaftaran: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ applicant: insertedData || payload });
  } catch (err) {
    console.error('Oprec submit server error:', err.message);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
