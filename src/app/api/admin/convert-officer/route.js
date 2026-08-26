import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession } from '@/lib/supabaseAdmin';

export async function POST(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { applicant_id, position } = await request.json();

  if (!applicant_id) {
    return NextResponse.json({ error: 'ID pendaftar wajib disertakan.' }, { status: 400 });
  }

  // 1. Ambil data pendaftar
  const { data: applicant, error: fetchError } = await supabaseAdmin
    .from('applicants')
    .select('id, full_name, choice_div_1, status')
    .eq('id', applicant_id)
    .single();

  if (fetchError || !applicant) {
    return NextResponse.json({ error: 'Data pendaftar tidak ditemukan.' }, { status: 404 });
  }

  // 2. Insert ke tabel officers
  const { data: officer, error: insertError } = await supabaseAdmin
    .from('officers')
    .insert({
      full_name: applicant.full_name,
      position: position || 'Anggota',
      division_id: applicant.choice_div_1,
      is_active: true,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 3. Update status pendaftar menjadi 'Lolos' (jika belum)
  if (applicant.status !== 'Lolos') {
    await supabaseAdmin.from('applicants').update({ status: 'Lolos' }).eq('id', applicant_id);
  }

  revalidatePath('/struktur');

  return NextResponse.json({ officer });
}
