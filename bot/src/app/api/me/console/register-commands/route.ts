import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { registerSlashCommandsForGuildHttp } from '@lib/discord/registerGuildSlashCommandsHttp';
import { userCanManageGuild } from '@lib/discord/userGuildAccess';

export const dynamic = 'force-dynamic';

const SNOWFLAKE = /^\d{17,20}$/;

export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      { error: 'Sign out and sign in again so Tippy can verify your servers.', code: 'REAUTH' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const guildId =
    typeof body === 'object' && body !== null && 'guildId' in body && typeof (body as { guildId: unknown }).guildId === 'string'
      ? (body as { guildId: string }).guildId.trim()
      : '';

  if (!SNOWFLAKE.test(guildId)) {
    return NextResponse.json({ error: 'Invalid guild id' }, { status: 400 });
  }

  const ok = await userCanManageGuild(accessToken, guildId);
  if (!ok) {
    return NextResponse.json({ error: 'You must be the owner or have Manage Server for that guild.' }, { status: 403 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  if (!botToken || !clientId) {
    return NextResponse.json({ error: 'DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID must be set on the server.' }, { status: 503 });
  }

  try {
    await registerSlashCommandsForGuildHttp(botToken, clientId, guildId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lower = msg.toLowerCase();
    if (lower.includes('missing access') || lower.includes('403')) {
      return NextResponse.json(
        {
          error:
            'Discord rejected registration. Add the bot to this server first (with **applications.commands**), then try again.',
        },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true, guildId });
}
