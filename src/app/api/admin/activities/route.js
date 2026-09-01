import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession, deleteStorageFilesFromUrls } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('id, title, description, event_date, photos_urls, created_at')
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities: data });
}

export async function POST(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, event_date, photos_urls } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: 'Judul dan deskripsi wajib diisi.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('activities')
    .insert({
      title,
      description,
      event_date: event_date || null,
      photos_urls: photos_urls || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/kegiatan');

  return NextResponse.json({ activity: data });
}

export async function PUT(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, description, event_date, photos_urls } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID kegiatan wajib disertakan.' }, { status: 400 });
  }

  if (!title || !description) {
    return NextResponse.json(
      { error: 'Judul dan deskripsi wajib diisi.' },
      { status: 400 }
    );
  }

  // Hapus foto lama yang dihilangkan saat edit dari Supabase Storage
  const { data: oldActivity } = await supabaseAdmin
    .from('activities')
    .select('photos_urls')
    .eq('id', id)
    .single();

  if (oldActivity?.photos_urls) {
    const removedPhotos = oldActivity.photos_urls.filter(
      (url) => !(photos_urls || []).includes(url)
    );
    if (removedPhotos.length > 0) {
      await deleteStorageFilesFromUrls(removedPhotos);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('activities')
    .update({
      title,
      description,
      event_date: event_date || null,
      photos_urls: photos_urls || [],
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/kegiatan');

  return NextResponse.json({ activity: data });
}

export async function DELETE(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID kegiatan wajib disertakan.' }, { status: 400 });
  }

  // 1. Ambil data kegiatan untuk mendapatkan photos_urls
  const { data: activity } = await supabaseAdmin
    .from('activities')
    .select('photos_urls')
    .eq('id', id)
    .single();

  // 2. Hapus file foto dari Supabase Storage (himpunan-media) jika ada
  if (activity?.photos_urls && activity.photos_urls.length > 0) {
    await deleteStorageFilesFromUrls(activity.photos_urls);
  }

  // 3. Hapus baris data kegiatan di database
  const { error } = await supabaseAdmin.from('activities').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/kegiatan');

  return NextResponse.json({ success: true });
}
