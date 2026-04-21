import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured } from '@lib/env';
import { listPointCurrenciesForGuild } from '@lib/db/points';
import { getConfluxNetworkSlug } from '@lib/conflux/network';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  if (!guildId) {
    return NextResponse.json({
      configured: false,
      message:
        'Set DISCORD_GUILD_ID in .env to the Discord server where Tippy runs - this console lists every /points create currency for that guild (from Supabase).',
      network: getConfluxNetworkSlug(),
      currencies: [] as unknown[],
    });
  }

  try {
    const currencies = await listPointCurrenciesForGuild(guildId);
    let mintedSum = BigInt(0);
    for (const c of currencies) {
      try {
        mintedSum += BigInt(c.minted_total);
      } catch {
        /* skip */
      }
    }
    return NextResponse.json({
      configured: true,
      guildId,
      network: getConfluxNetworkSlug(),
      currencies,
      mintedTotalAll: mintedSum.toString(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Console load failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
