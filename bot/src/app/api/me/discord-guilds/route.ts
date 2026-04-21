import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { fetchDiscordUserGuilds, guildEntryIsManageable } from '@lib/discord/userGuildAccess';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'NEXTAUTH_SECRET is not set' }, { status: 503 });
  }

  const jwt = await getToken({ req, secret });
  const accessToken = typeof jwt?.accessToken === 'string' ? jwt.accessToken : undefined;

  if (!accessToken) {
    return NextResponse.json({
      reauthRequired: true,
      guilds: [] as { id: string; name: string }[],
    });
  }

  try {
    const all = await fetchDiscordUserGuilds(accessToken);
    const guilds = all
      .filter(guildEntryIsManageable)
      .map((g) => ({ id: g.id, name: g.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ reauthRequired: false, guilds });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load guilds';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
