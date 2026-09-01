import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession, deleteStorageFilesFromUrls } from '@/lib/supabaseAdmin';

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

  // 1. Ambil data pengurus untuk mendapatkan photo_url
  const { data: officer } = await supabaseAdmin
    .from('officers')
    .select('photo_url')
    .eq('id', id)
    .single();

  // 2. Hapus foto dari Supabase Storage jika ada
  if (officer?.photo_url) {
    await deleteStorageFilesFromUrls(officer.photo_url);
  }

  // 3. Hapus baris data pengurus di database
  const { error } = await supabaseAdmin.from('officers').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/struktur');

  return NextResponse.json({ success: true });
}

export async function PUT(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const body = await request.json();
  const { id, full_name, position, division_id, photo_url, linkedin_url, instagram_url } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID pengurus wajib disertakan.' }, { status: 400 });
  }

  if (!full_name || !position) {
    return NextResponse.json({ error: 'Nama dan jabatan wajib diisi.' }, { status: 400 });
  }

  // Jika foto diganti, hapus foto lama dari Storage
  if (photo_url !== undefined) {
    const { data: oldOfficer } = await supabaseAdmin
      .from('officers')
      .select('photo_url')
      .eq('id', id)
      .single();

    if (oldOfficer?.photo_url && oldOfficer.photo_url !== photo_url) {
      await deleteStorageFilesFromUrls(oldOfficer.photo_url);
    }
  }

  const updateData = {
    full_name,
    position,
    division_id: division_id || null,
    linkedin_url: linkedin_url || null,
    instagram_url: instagram_url || null,
  };

  if (photo_url !== undefined) {
    updateData.photo_url = photo_url;
  }

  const { data, error } = await supabaseAdmin
    .from('officers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/struktur');

  return NextResponse.json({ officer: data });
}

