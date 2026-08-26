import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, verifyAdminSession } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'oprec_status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ oprec_status: data.value });
}

export async function PATCH(request) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const { oprec_status } = await request.json();

  if (!['open', 'closed'].includes(oprec_status)) {
    return NextResponse.json({ error: "Nilai status harus 'open' atau 'closed'." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('settings')
    .update({ value: oprec_status })
    .eq('key', 'oprec_status');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');

  return NextResponse.json({ oprec_status });
}
