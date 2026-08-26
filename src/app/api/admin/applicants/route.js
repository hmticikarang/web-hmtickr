import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyAdminSession } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division'); // filter by choice_div_1
  const search = searchParams.get('search'); // nama/nim

  let query = supabaseAdmin
    .from('applicants')
    .select(
      `id, app_number, full_name, nim, email, phone_wa, major, cohort, motivation, status,
       interview_datetime, interview_location, created_at,
       choice_div_1, choice_div_2,
       div1:choice_div_1(id, name), div2:choice_div_2(id, name)`
    )
    .order('created_at', { ascending: false });

  if (division) {
    query = query.eq('choice_div_1', division);
  }
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,nim.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applicants: data });
}

export async function PATCH(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { id, status, interview_datetime, interview_location } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID pendaftar wajib disertakan.' }, { status: 400 });
  }

  const updatePayload = {};
  if (status !== undefined) updatePayload.status = status;
  if (interview_datetime !== undefined) updatePayload.interview_datetime = interview_datetime;
  if (interview_location !== undefined) updatePayload.interview_location = interview_location;

  const { data, error } = await supabaseAdmin
    .from('applicants')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applicant: data });
}
