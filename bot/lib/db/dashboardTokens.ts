import { getSupabaseAdmin } from '../supabase/admin';
import type { Database } from '../database.types';

export type DashboardTokenRow = Database['public']['Tables']['user_dashboard_tokens']['Row'];
export type DashboardTokenType = 'bank' | 'cw20';

export async function listDashboardTokensForUser(userId: string): Promise<DashboardTokenRow[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('user_dashboard_tokens')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as DashboardTokenRow[] | null) ?? [];
}

export async function addDashboardToken(input: {
  userId: string;
  tokenType: DashboardTokenType;
  ref: string;
  label: string;
  decimals: number;
}): Promise<DashboardTokenRow> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('user_dashboard_tokens')
    .insert({
      user_id: input.userId,
      token_type: input.tokenType,
      ref: input.ref.trim(),
      label: input.label.trim() || 'Token',
      decimals: input.decimals,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as DashboardTokenRow;
}

export async function removeDashboardToken(userId: string, id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('user_dashboard_tokens').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}
