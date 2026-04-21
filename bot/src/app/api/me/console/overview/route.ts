import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured } from '@lib/env';
import { listPointCurrenciesForGuilds } from '@lib/db/points';
import {
  fetchDiscordUserGuilds,
  guildEntryIsManageable,
  type DiscordUserGuild,
} from '@lib/discord/userGuildAccess';
import { fetchGuildFromBot } from '@lib/discord/botGuildMeta';
import type { AssetRail, Project } from '@/types/types';
import { getConfluxNetworkSlug } from '@lib/conflux/network';

export const dynamic = 'force-dynamic';

type CurrencyRow = {
  id: string;
  guild_id: string;
  name: string;
  symbol: string;
  cap: string;
  minted_total: string;
  created_at: string;
};

export type ConsoleOverviewEcosystem = Project & { currencies: CurrencyRow[] };

function formatBigIntShort(n: bigint): string {
  if (n >= 1_000_000_000n) return `${(Number(n / 1_000_000n) / 1000).toFixed(1)}B`;
  if (n >= 1_000_000n) return `${(Number(n) / 1e6).toFixed(1)}M`;
  if (n >= 1_000n) return `${(Number(n) / 1e3).toFixed(0)}k`;
  return n.toString();
}

function railsForGuild(currencyCount: number): AssetRail[] {
  if (currencyCount > 0) return ['CFX', 'POINTS'];
  return ['CFX'];
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET?.trim();
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();

  const jwt = secret ? await getToken({ req, secret }) : null;
  const accessToken = typeof jwt?.accessToken === 'string' ? jwt.accessToken : undefined;

  const envGuildId = process.env.DISCORD_GUILD_ID?.trim() ?? null;
  const network = getConfluxNetworkSlug();

  if (!accessToken) {
    return NextResponse.json({
      needsReauth: true,
      network,
      envGuildId,
      stats: {
        aggregatedMembers: 0,
        aggregatedMembersKnown: false,
        globalPointsSupplyFormatted: '0',
        activeCampaigns: 0,
        serverCount: 0,
      },
      ecosystems: [] as ConsoleOverviewEcosystem[],
    });
  }

  let manageable: DiscordUserGuild[] = [];
  try {
    const all = await fetchDiscordUserGuilds(accessToken);
    manageable = all.filter(guildEntryIsManageable);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Discord guilds failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  type Entry = { id: string; name: string };
  const entries: Entry[] = manageable.map((g) => ({ id: g.id, name: g.name }));

  const envGuildIdResolved = process.env.DISCORD_GUILD_ID?.trim();
  if (envGuildIdResolved && botToken && !entries.some((e) => e.id === envGuildIdResolved)) {
    const meta = await fetchGuildFromBot(botToken, envGuildIdResolved);
    if (meta) entries.push({ id: meta.id, name: meta.name });
  }

  const guildIds = entries.map((e) => e.id);
  let currencies: CurrencyRow[] = [];
  try {
    currencies = (await listPointCurrenciesForGuilds(guildIds)) as CurrencyRow[];
  } catch {
    currencies = [];
  }

  const byGuild = new Map<string, CurrencyRow[]>();
  for (const c of currencies) {
    const arr = byGuild.get(c.guild_id) ?? [];
    arr.push(c);
    byGuild.set(c.guild_id, arr);
  }

  const ecosystemsUnsorted: ConsoleOverviewEcosystem[] = await Promise.all(
    entries.map(async (e) => {
      let members: number | null = null;
      if (botToken) {
        const meta = await fetchGuildFromBot(botToken, e.id);
        if (meta?.approximate_member_count != null) members = meta.approximate_member_count;
      }

      const curs = byGuild.get(e.id) ?? [];
      let mintedSum = 0n;
      for (const c of curs) {
        try {
          mintedSum += BigInt(c.minted_total);
        } catch {
          /* skip */
        }
      }

      const ticker = curs[0]?.symbol ?? '—';
      return {
        id: e.id,
        name: e.name,
        ticker,
        members,
        pointsIssued: formatBigIntShort(mintedSum),
        activeCampaigns: curs.length,
        status: curs.length > 0 ? 'active' : 'inactive',
        rails: railsForGuild(curs.length),
        currencies: curs,
      } satisfies Project & { currencies: CurrencyRow[] };
    }),
  );

  const ecosystems = ecosystemsUnsorted.sort((a, b) => a.name.localeCompare(b.name));

  let totalMembers = 0;
  let memberCountKnown = 0;
  for (const eco of ecosystems) {
    if (eco.members != null) {
      totalMembers += eco.members;
      memberCountKnown += 1;
    }
  }

  let globalMinted = 0n;
  for (const c of currencies) {
    try {
      globalMinted += BigInt(c.minted_total);
    } catch {
      /* skip */
    }
  }

  return NextResponse.json({
    needsReauth: false,
    network,
    envGuildId,
    stats: {
      aggregatedMembers: memberCountKnown > 0 ? totalMembers : 0,
      aggregatedMembersKnown: memberCountKnown > 0,
      globalPointsSupplyFormatted: formatBigIntShort(globalMinted),
      activeCampaigns: currencies.length,
      serverCount: ecosystems.length,
    },
    ecosystems,
  });
}
