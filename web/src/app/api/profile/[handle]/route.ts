import { NextRequest } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ProfileRow = {
  id: string;
  privy_id: string;
  wallet_address: string | null;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
  avatar_seed: string | null;
  twitter_handle: string | null;
  discord_handle: string | null;
  created_at: string;
  updated_at: string;
};

function isAddressLike(raw: string): boolean {
  return /^0x[0-9a-f]{40}$/i.test(raw);
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ handle: string }> },
) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: 'Supabase is not configured on this deployment.' },
      { status: 501 },
    );
  }
  const { handle } = await ctx.params;
  const raw = decodeURIComponent(handle).trim();
  if (!raw) {
    return Response.json({ error: 'handle is required' }, { status: 400 });
  }
  const db = supabaseAdmin();
  let query = db.from('profiles').select('*').limit(1);
  query = isAddressLike(raw)
    ? query.eq('wallet_address', raw.toLowerCase())
    : query.ilike('handle', raw);

  const { data, error } = await query.maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 });

  const row = data as ProfileRow;
  return Response.json({
    profile: {
      handle: row.handle,
      displayName: row.display_name,
      walletAddress: row.wallet_address,
      avatarUrl: row.avatar_url,
      avatarSeed: row.avatar_seed,
      twitterHandle: row.twitter_handle,
      discordHandle: row.discord_handle,
      createdAt: row.created_at,
    },
  });
}
