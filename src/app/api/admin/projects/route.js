import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('id, title, background, achievements, photos_urls, division_id, divisions(id, name), created_at')
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
  const { title, background, achievements, division_id, photos_urls } = body;

  if (!title || !background || !achievements) {
    return NextResponse.json(
      { error: 'Judul, latar belakang, dan capaian wajib diisi.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      title,
      background,
      achievements,
      division_id: division_id || null,
      photos_urls: photos_urls || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/proker');

  return NextResponse.json({ project: data });
}
