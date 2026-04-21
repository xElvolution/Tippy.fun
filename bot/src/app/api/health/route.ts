import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@lib/env';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, supabase: 'not_configured' });
  }
  try {
    const { getSupabaseAdmin } = await import('@lib/supabase/admin');
    const sb = getSupabaseAdmin();
    const { error } = await sb.from('users').select('id').limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, supabase: 'connected' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    return NextResponse.json({ ok: false, supabase: 'error', message: msg }, { status: 503 });
  }
}
