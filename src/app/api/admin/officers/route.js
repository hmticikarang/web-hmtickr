import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('officers')
    .select('id, full_name, position, photo_url, linkedin_url, instagram_url, is_active, division_id, divisions(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ officers: data });
}

export async function POST(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, position, division_id, photo_url, linkedin_url, instagram_url } = body;

  if (!full_name || !position) {
    return NextResponse.json({ error: 'Nama dan jabatan wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('officers')
    .insert({
      full_name,
      position,
      division_id: division_id || null,
      photo_url: photo_url || null,
      linkedin_url: linkedin_url || null,
      instagram_url: instagram_url || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Halaman publik /struktur di-cache (ISR) — invalidate supaya pengurus baru
  // langsung muncul tanpa perlu menunggu jeda revalidate otomatis.
  revalidatePath('/struktur');

  return NextResponse.json({ officer: data });
}

export async function DELETE(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID pengurus wajib disertakan.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('officers').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/struktur');

  return NextResponse.json({ success: true });
}
