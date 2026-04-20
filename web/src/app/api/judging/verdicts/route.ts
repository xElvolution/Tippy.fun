import { NextRequest } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { getActiveChain } from '@/lib/conflux';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return Response.json({ ai: [], final: [] });
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  if (!campaignId) {
    return Response.json({ error: 'campaignId is required' }, { status: 400 });
  }
  const chain = getActiveChain();
  const db = supabaseAdmin();

  const { data: subs } = await db
    .from('submissions')
    .select('id')
    .eq('chain_id', chain.id)
    .eq('campaign_id', campaignId);
  const subIds = (subs ?? []).map((s) => s.id as string);
  if (subIds.length === 0) return Response.json({ ai: [], final: [] });

  const { data: ai } = await db
    .from('ai_verdicts')
    .select('submission_id, judge_id, model, persona, score, rationale')
    .in('submission_id', subIds);

  const { data: final } = await db
    .from('final_verdicts')
    .select('submission_id, score, decision, rationale, verdict_hash')
    .in('submission_id', subIds);

  return Response.json({ ai: ai ?? [], final: final ?? [] });
}
