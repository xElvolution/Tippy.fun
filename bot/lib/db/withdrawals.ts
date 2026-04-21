import { getSupabaseAdmin } from '../supabase/admin';

export type WithdrawalRow = {
  id: string;
  user_id: string;
  to_address: string;
  denom: string;
  amount: string;
  tx_hash: string | null;
  status: string;
  error: string | null;
  created_at: string;
};

export async function listWithdrawalsForUser(userId: string, limit = 100): Promise<WithdrawalRow[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as WithdrawalRow[] | null) ?? [];
}

export async function recordWithdrawal(input: {
  userId: string;
  toAddress: string;
  denom: string;
  amount: string;
  txHash: string | null;
  status: 'success' | 'failed' | 'pending';
  error?: string | null;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('withdrawals').insert({
    user_id: input.userId,
    to_address: input.toAddress,
    denom: input.denom,
    amount: input.amount,
    tx_hash: input.txHash,
    status: input.status,
    error: input.error ?? null,
  });
  if (error) throw error;
}
