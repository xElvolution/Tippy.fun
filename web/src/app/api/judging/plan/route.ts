import { NextRequest } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/privyServer';
import { hashCanonical } from '@/lib/hash';
import { getActiveChain } from '@/lib/conflux';

export const dynamic = 'force-dynamic';

type PlanBody = {
  campaignId: string | number;
  winners: Array<{
    submissionId: string;
    winnerAddress: string;
    amount: string; // human-readable in the campaign's token
  }>;
  payoutNote?: string;
};

/**
 * Drafts a settlement plan the organizer can review and then publish on-chain via `settleWinners`.
 * Includes the `verdict_hash` covering every winning submission's arbiter verdict so we prove the
 * off-chain record is the one that was settled.
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: 'Supabase is not configured.' }, { status: 501 });
  }
  try {
    const user = await requireAuth(req);
    const body = (await req.json()) as PlanBody;
    if (!body.campaignId || !Array.isArray(body.winners) || body.winners.length === 0) {
      return Response.json({ error: 'campaignId and winners are required' }, { status: 400 });
    }

    const chain = getActiveChain();
    const db = supabaseAdmin();

    const { data: submissions, error: subErr } = await db
      .from('submissions')
      .select('id, submission_hash, chain_id, campaign_id')
      .in(
        'id',
        body.winners.map((w) => w.submissionId),
      );
    if (subErr) return Response.json({ error: subErr.message }, { status: 500 });
    if (!submissions || submissions.length !== body.winners.length) {
      return Response.json({ error: 'Some submissions were not found.' }, { status: 404 });
    }
    for (const s of submissions) {
      if (
        s.chain_id !== chain.id ||
        String(s.campaign_id) !== String(body.campaignId)
      ) {
        return Response.json(
          { error: 'Submission does not belong to the given campaign.' },
          { status: 400 },
        );
      }
    }

    const { data: verdicts, error: vErr } = await db
      .from('final_verdicts')
      .select('submission_id, score, decision, rationale, arbiter_model, verdict_hash')
      .in(
        'submission_id',
        submissions.map((s) => s.id),
      );
    if (vErr) return Response.json({ error: vErr.message }, { status: 500 });

    const bySub = new Map((verdicts ?? []).map((v) => [v.submission_id, v]));
    const subBySubId = new Map(submissions.map((s) => [s.id, s]));

    const canonicalWinners = body.winners.map((w) => {
      const s = subBySubId.get(w.submissionId);
      const v = bySub.get(w.submissionId);
      return {
        submissionId: w.submissionId,
        submissionHash: s?.submission_hash,
        winner: w.winnerAddress,
        amount: w.amount,
        verdict: v
          ? { score: v.score, decision: v.decision, verdictHash: v.verdict_hash }
          : null,
      };
    });
    const verdictHash = hashCanonical({
      chainId: chain.id,
      campaignId: String(body.campaignId),
      winners: canonicalWinners,
      payoutNote: body.payoutNote ?? '',
    });

    const { data: inserted, error: insErr } = await db
      .from('settlement_plans')
      .insert({
        chain_id: chain.id,
        campaign_id: String(body.campaignId),
        organizer_privy_id: user.privyId,
        status: 'draft',
        winners: canonicalWinners,
        verdict_hash: verdictHash,
        payout_note: body.payoutNote ?? null,
      })
      .select('id, verdict_hash, winners, payout_note, created_at')
      .single();
    if (insErr) return Response.json({ error: insErr.message }, { status: 500 });

    return Response.json({ plan: inserted }, { status: 201 });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: 'Supabase is not configured.' }, { status: 501 });
  }
  try {
    await requireAuth(req);
    const { planId, txHash } = (await req.json()) as { planId: string; txHash: string };
    if (!planId || !txHash) {
      return Response.json({ error: 'planId and txHash required' }, { status: 400 });
    }
    const db = supabaseAdmin();
    const { error } = await db
      .from('settlement_plans')
      .update({ status: 'published', tx_hash: txHash, published_at: new Date().toISOString() })
      .eq('id', planId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
