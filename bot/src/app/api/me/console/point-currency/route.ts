import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured, isEncryptionConfigured } from '@lib/env';
import { getUserByDiscordId, getPrivateKeyHexForUser } from '@lib/db/users';
import { createPointCurrency } from '@lib/db/points';
import { fetchGuildOwnerIdFromBot } from '@lib/discord/botGuildMeta';
import { broadcastMasterTipRequestPointToken, masterTipContractAddress } from '@lib/conflux/masterTip';

export const dynamic = 'force-dynamic';

const SNOWFLAKE = /^\d{17,20}$/;

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  if (!isEncryptionConfigured()) {
    return NextResponse.json({ error: 'ENCRYPTION_KEY is not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const guildId = typeof o.guildId === 'string' ? o.guildId.trim() : '';
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const symbol = typeof o.symbol === 'string' ? o.symbol.trim() : '';
  const cap = typeof o.cap === 'string' ? o.cap.trim() : '';

  if (!SNOWFLAKE.test(guildId)) {
    return NextResponse.json({ error: 'Invalid guild id' }, { status: 400 });
  }
  if (!name || !symbol || !cap) {
    return NextResponse.json({ error: 'name, symbol, and cap are required' }, { status: 400 });
  }
  try {
    void BigInt(cap);
  } catch {
    return NextResponse.json({ error: 'cap must be an integer string' }, { status: 400 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!botToken) {
    return NextResponse.json({ error: 'DISCORD_BOT_TOKEN must be set' }, { status: 503 });
  }

  const ownerId = await fetchGuildOwnerIdFromBot(botToken, guildId);
  if (!ownerId) {
    return NextResponse.json({ error: 'Could not load guild (is the bot in this server?)' }, { status: 403 });
  }
  if (ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Only the Discord server owner can create project points.' }, { status: 403 });
  }

  const user = await getUserByDiscordId(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'Register with /register in Discord first (custodial wallet required).' }, { status: 400 });
  }

  let currency;
  try {
    currency = await createPointCurrency({
      guildId,
      channelId: null,
      ownerDiscordId: session.user.id,
      name,
      symbol,
      cap,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let masterTipTx: string | null = null;
  let masterTipError: string | null = null;
  if (masterTipContractAddress()) {
    try {
      const pk = await getPrivateKeyHexForUser(session.user.id);
      if (!pk) {
        masterTipError = 'Could not decrypt wallet key';
      } else {
        const { transactionHash } = await broadcastMasterTipRequestPointToken({
          privateKeyHex: pk,
          senderAddress: user.evm_address,
          guildId,
          displayName: name,
          symbol,
          supplyCap: cap,
        });
        masterTipTx = transactionHash;
      }
    } catch (e) {
      masterTipError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    ok: true,
    currency,
    masterTipTx,
    masterTipError,
  });
}
