import { getSupabaseAdmin } from '../supabase/admin';
import type { Database } from '../database.types';

type CurrencyRow = Database['public']['Tables']['point_currencies']['Row'];
type BalanceRow = Database['public']['Tables']['point_balances']['Row'];

function assertBigIntStr(s: string, label: string) {
  try {
    void BigInt(s);
  } catch {
    throw new Error(`${label} must be an integer string`);
  }
}

export async function listPointCurrenciesForGuild(guildId: string): Promise<CurrencyRow[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('point_currencies').select('*').eq('guild_id', guildId);
  if (error) throw error;
  return (data as CurrencyRow[] | null) ?? [];
}

export async function listPointCurrenciesForGuilds(guildIds: string[]): Promise<CurrencyRow[]> {
  if (guildIds.length === 0) return [];
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('point_currencies').select('*').in('guild_id', guildIds);
  if (error) throw error;
  return (data as CurrencyRow[] | null) ?? [];
}

export async function createPointCurrency(input: {
  guildId: string;
  channelId: string | null;
  ownerDiscordId: string;
  name: string;
  symbol: string;
  cap: string;
}): Promise<CurrencyRow> {
  assertBigIntStr(input.cap, 'cap');
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('point_currencies')
    .insert({
      guild_id: input.guildId,
      channel_id: input.channelId,
      owner_discord_id: input.ownerDiscordId,
      name: input.name,
      symbol: input.symbol,
      cap: input.cap,
      minted_total: '0',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as CurrencyRow;
}

export async function mintPoints(input: {
  currencyId: string;
  guildId: string;
  guildOwnerDiscordId: string;
  issuerDiscordId: string;
  toUserId: string; // users.id uuid
  amount: string;
}) {
  assertBigIntStr(input.amount, 'amount');
  if (input.guildOwnerDiscordId !== input.issuerDiscordId) {
    throw new Error('Only the guild owner can mint.');
  }
  const sb = getSupabaseAdmin();
  const { data: curRaw, error: e1 } = await sb.from('point_currencies').select('*').eq('id', input.currencyId).single();
  if (e1 || !curRaw) throw new Error('Unknown point currency');
  const cur = curRaw as CurrencyRow;
  if (cur.guild_id !== input.guildId) throw new Error('That currency belongs to another server.');

  const minted = BigInt(cur.minted_total);
  const cap = BigInt(cur.cap);
  const add = BigInt(input.amount);
  if (minted + add > cap) throw new Error('Would exceed supply cap');

  const newMinted = (minted + add).toString();

  const { data: balRaw } = await sb
    .from('point_balances')
    .select('*')
    .eq('point_currency_id', input.currencyId)
    .eq('user_id', input.toUserId)
    .maybeSingle();
  const balRow = balRaw as BalanceRow | null;

  const nextBal = (BigInt(balRow?.balance ?? '0') + add).toString();

  const { error: e2 } = await sb.from('point_currencies').update({ minted_total: newMinted }).eq('id', input.currencyId);
  if (e2) throw e2;

  if (balRow) {
    const { error: e3 } = await sb.from('point_balances').update({ balance: nextBal }).eq('id', balRow.id);
    if (e3) throw e3;
  } else {
    const { error: e4 } = await sb.from('point_balances').insert({
      point_currency_id: input.currencyId,
      user_id: input.toUserId,
      balance: nextBal,
    });
    if (e4) throw e4;
  }
}

export async function transferPoints(input: {
  currencyId: string;
  guildId: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
}) {
  assertBigIntStr(input.amount, 'amount');
  const amt = BigInt(input.amount);
  if (amt <= BigInt(0)) throw new Error('Amount must be positive');

  const sb = getSupabaseAdmin();
  const { data: curRaw } = await sb.from('point_currencies').select('guild_id').eq('id', input.currencyId).maybeSingle();
  const cur = curRaw as Pick<CurrencyRow, 'guild_id'> | null;
  if (!cur || cur.guild_id !== input.guildId) {
    throw new Error('Invalid currency for this server.');
  }

  const { data: fromRaw } = await sb
    .from('point_balances')
    .select('*')
    .eq('point_currency_id', input.currencyId)
    .eq('user_id', input.fromUserId)
    .maybeSingle();
  const fromB = fromRaw as BalanceRow | null;

  const fromBal = BigInt(fromB?.balance ?? '0');
  if (fromBal < amt) throw new Error('Insufficient points');

  const { data: toRaw } = await sb
    .from('point_balances')
    .select('*')
    .eq('point_currency_id', input.currencyId)
    .eq('user_id', input.toUserId)
    .maybeSingle();
  const toB = toRaw as BalanceRow | null;

  const newFrom = (fromBal - amt).toString();
  const newTo = (BigInt(toB?.balance ?? '0') + amt).toString();

  if (fromB) {
    const { error } = await sb.from('point_balances').update({ balance: newFrom }).eq('id', fromB.id);
    if (error) throw error;
  }

  if (toB) {
    const { error } = await sb.from('point_balances').update({ balance: newTo }).eq('id', toB.id);
    if (error) throw error;
  } else {
    const { error } = await sb.from('point_balances').insert({
      point_currency_id: input.currencyId,
      user_id: input.toUserId,
      balance: newTo,
    });
    if (error) throw error;
  }
}

export async function listPointBalancesForUser(userId: string): Promise<{ symbol: string; balance: string }[]> {
  const sb = getSupabaseAdmin();
  const { data: bals, error } = await sb.from('point_balances').select('balance, point_currency_id').eq('user_id', userId);
  if (error) throw error;
  const rows = (bals ?? []) as { balance: string; point_currency_id: string }[];
  const positive = rows.filter((r) => {
    try {
      return BigInt(r.balance) > BigInt(0);
    } catch {
      return false;
    }
  });
  if (positive.length === 0) return [];
  const curIds = [...new Set(positive.map((r) => r.point_currency_id))];
  const { data: curs, error: cErr } = await sb.from('point_currencies').select('id, symbol').in('id', curIds);
  if (cErr) throw cErr;
  const sym = new Map((curs ?? []).map((c) => [c.id as string, (c as { symbol: string }).symbol]));
  return positive.map((r) => ({ symbol: sym.get(r.point_currency_id) ?? '?', balance: r.balance }));
}

export async function getPointBalance(currencyId: string, userId: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from('point_balances')
    .select('balance')
    .eq('point_currency_id', currencyId)
    .eq('user_id', userId)
    .maybeSingle();
  const row = data as { balance: string } | null;
  return row?.balance ?? '0';
}
