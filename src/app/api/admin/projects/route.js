import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession, deleteStorageFilesFromUrls } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('id, title, event_date, background, achievements, photos_urls, division_id, divisions(id, name), created_at')
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

export async function POST(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const body = await request.json();
  const { title, event_date, background, achievements, division_id, photos_urls } = body;

  if (!title || !background) {
    return NextResponse.json(
      { error: 'Nama proker dan deskripsi proker wajib diisi.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      title,
      event_date: event_date || null,
      background,
      achievements: achievements || '',
      division_id: division_id || null,
      photos_urls: photos_urls || [],
    })
    .select('id, title, event_date, background, achievements, photos_urls, division_id, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/proker');

  return NextResponse.json({ project: data });
}

export async function PUT(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, event_date, background, achievements, division_id, photos_urls } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID proker wajib disertakan.' }, { status: 400 });
  }

  if (!title || !background) {
    return NextResponse.json(
      { error: 'Nama proker dan deskripsi proker wajib diisi.' },
      { status: 400 }
    );
  }

  // Hapus foto lama yang dihilangkan saat edit dari Supabase Storage
  const { data: oldProject } = await supabaseAdmin
    .from('projects')
    .select('photos_urls')
    .eq('id', id)
    .single();

  if (oldProject?.photos_urls) {
    const removedPhotos = oldProject.photos_urls.filter(
      (url) => !(photos_urls || []).includes(url)
    );
    if (removedPhotos.length > 0) {
      await deleteStorageFilesFromUrls(removedPhotos);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({
      title,
      event_date: event_date || null,
      background,
      achievements: achievements || '',
      division_id: division_id || null,
      photos_urls: photos_urls || [],
    })
    .eq('id', id)
    .select('id, title, event_date, background, achievements, photos_urls, division_id, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/proker');
  revalidatePath(`/proker/${id}`);
  revalidatePath('/proker/[id]', 'page');

  return NextResponse.json({ project: data });
}

export async function DELETE(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID proker wajib disertakan.' }, { status: 400 });
  }

  // 1. Ambil data proker untuk mendapatkan photos_urls
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('photos_urls')
    .eq('id', id)
    .single();

  // 2. Hapus file foto dari Supabase Storage (himpunan-media) jika ada
  if (project?.photos_urls && project.photos_urls.length > 0) {
    await deleteStorageFilesFromUrls(project.photos_urls);
  }

  // 3. Hapus baris data proker di database
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/proker');
  revalidatePath(`/proker/${id}`);
  revalidatePath('/proker/[id]', 'page');

  return NextResponse.json({ success: true });
}

