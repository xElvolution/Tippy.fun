import { getSupabaseAdmin } from '../supabase/admin';

export type DashboardTipRow = {
  id: string;
  createdAt: string;
  direction: 'sent' | 'received';
  denom: string;
  amount: string;
  counterpartyUsername: string;
  counterpartyAddress: string;
  txHash: string | null;
  status: string;
};

export async function listRecentTipsForDashboard(userId: string, limit = 100): Promise<DashboardTipRow[]> {
  const sb = getSupabaseAdmin();
  const { data: tips, error } = await sb
    .from('tips')
    .select('id, from_user_id, to_user_id, denom, amount, tx_hash, status, created_at')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = tips ?? [];
  if (rows.length === 0) return [];

  const idSet = new Set<string>();
  for (const t of rows) {
    idSet.add(t.from_user_id as string);
    idSet.add(t.to_user_id as string);
  }
  const { data: users, error: uErr } = await sb
    .from('users')
    .select('id, username, evm_address')
    .in('id', [...idSet]);
  if (uErr) throw uErr;
  const umap = new Map((users ?? []).map((u) => [u.id as string, u as { username: string; evm_address: string }]));

  return rows.map((t) => {
    const fromId = t.from_user_id as string;
    const toId = t.to_user_id as string;
    const sent = fromId === userId;
    const cpId = sent ? toId : fromId;
    const cp = umap.get(cpId);
    const addr = cp?.evm_address ?? '';
    const shortAddr = addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
    return {
      id: t.id as string,
      createdAt: t.created_at as string,
      direction: sent ? ('sent' as const) : ('received' as const),
      denom: (t.denom as string) || 'cfx',
      amount: String(t.amount),
      counterpartyUsername: cp?.username ? `@${cp.username}` : 'Unknown',
      counterpartyAddress: shortAddr,
      txHash: (t.tx_hash as string | null) ?? null,
      status: String(t.status).toUpperCase(),
    };
  });
}

export async function recordTip(input: {
  fromUserId: string;
  toUserId: string;
  denom: string;
  amount: string;
  txHash: string | null;
  status: 'success' | 'failed' | 'pending';
  error?: string | null;
}) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('tips').insert({
    from_user_id: input.fromUserId,
    to_user_id: input.toUserId,
    denom: input.denom,
    amount: input.amount,
    tx_hash: input.txHash,
    status: input.status,
    error: input.error ?? null,
  });
  if (error) throw error;
}
