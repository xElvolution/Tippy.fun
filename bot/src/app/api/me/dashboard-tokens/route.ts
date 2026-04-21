import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { isAddress } from 'viem';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured } from '@lib/env';
import { getUserByDiscordId } from '@lib/db/users';
import { addDashboardToken, removeDashboardToken, type DashboardTokenType } from '@lib/db/dashboardTokens';

export const dynamic = 'force-dynamic';

const BANK_REF = /^[\w./:-]{2,256}$/;

function parseDecimals(v: unknown): number {
  const n = typeof v === 'number' ? v : Number.parseInt(String(v ?? '6'), 10);
  if (!Number.isFinite(n) || n < 0 || n > 36) return NaN;
  return n;
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const tokenType = o.tokenType === 'bank' || o.tokenType === 'cw20' ? (o.tokenType as DashboardTokenType) : null;
  const ref = typeof o.ref === 'string' ? o.ref.trim() : '';
  const label = typeof o.label === 'string' ? o.label.trim() : 'Token';
  const decimals = parseDecimals(o.decimals);

  if (!tokenType) {
    return NextResponse.json({ error: 'tokenType must be "bank" or "cw20"' }, { status: 400 });
  }
  if (tokenType === 'bank') {
    return NextResponse.json(
      { error: 'Bank-style tokens are not supported on Conflux eSpace. Use tokenType "cw20" with an ERC-20 contract (0x…).' },
      { status: 400 },
    );
  }
  if (!ref || !BANK_REF.test(ref)) {
    return NextResponse.json({ error: 'Invalid ref' }, { status: 400 });
  }
  if (!isAddress(ref)) {
    return NextResponse.json({ error: 'ERC-20 ref must be a valid 0x contract address' }, { status: 400 });
  }
  if (Number.isNaN(decimals)) {
    return NextResponse.json({ error: 'decimals must be 0–36' }, { status: 400 });
  }

  const user = await getUserByDiscordId(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'Register with /register in Discord first' }, { status: 400 });
  }

  try {
    await addDashboardToken({
      userId: user.id,
      tokenType: 'cw20',
      ref,
      label: label || 'Token',
      decimals,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes('duplicate') || msg.includes('23505')) {
      return NextResponse.json({ error: 'You already added this token' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id')?.trim() ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const user = await getUserByDiscordId(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'Register first' }, { status: 400 });
  }

  try {
    await removeDashboardToken(user.id, id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
