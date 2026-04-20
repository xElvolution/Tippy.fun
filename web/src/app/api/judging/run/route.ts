import { NextRequest } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/privyServer';
import { runJudge, runArbiter } from '@/lib/ai/openaiJudge';
import { hashCanonical } from '@/lib/hash';
import { fetchCampaignMetadata, type JudgingConfig } from '@/lib/campaignMetadata';
import { getActiveChain } from '@/lib/conflux';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

type RunBody = {
  campaignId: string | number;
  submissionIds?: string[];
};

/**
 * Runs the AI judging panel for a campaign. Organizer-only.
 *
 * Steps per submission:
 *   1. Call every judge in the panel in parallel (OpenAI) and store their verdicts.
 *   2. Call the arbiter with all judge verdicts to produce an aggregated score + pass/fail.
 *   3. Store the arbiter verdict with a canonical `verdict_hash`.
 *   4. Bounty mode → draft a `settlement_plan` the organizer can later publish on-chain.
 *      Tip mode    → mark the submission as "scored" and let the UI call `payTip` client-side.
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: 'Supabase is not configured on this deployment.' },
      { status: 501 },
    );
  }
  try {
    const user = await requireAuth(req);
    const body = (await req.json()) as RunBody;
    if (!body.campaignId) {
      return Response.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const chain = getActiveChain();
    const db = supabaseAdmin();

    const { data: campaign, error: campErr } = await db
      .from('campaigns_cache')
      .select('*')
      .eq('chain_id', chain.id)
      .eq('campaign_id', String(body.campaignId))
      .maybeSingle();
    if (campErr) return Response.json({ error: campErr.message }, { status: 500 });
    if (!campaign) {
      return Response.json(
        { error: 'Campaign not yet indexed from chain. Try again in a few seconds.' },
        { status: 404 },
      );
    }

    const { data: organizerProfile } = await db
      .from('profiles')
      .select('privy_id, wallet_address')
      .eq('privy_id', user.privyId)
      .maybeSingle();

    const organizerMatches =
      organizerProfile?.wallet_address?.toLowerCase() === campaign.organizer.toLowerCase();
    if (!organizerMatches) {
      return Response.json(
        {
          error:
            'Only the campaign organizer can trigger judging. Connect the organizer wallet and retry.',
        },
        { status: 403 },
      );
    }

    // Pull judging config from the campaign's metadata URI (written at creation time).
    const metadata =
      (campaign.metadata as Record<string, unknown> | null) ??
      (await fetchCampaignMetadata(campaign.metadata_uri));
    const judging = (metadata as { judging?: JudgingConfig } | null)?.judging;
    if (!judging) {
      return Response.json(
        { error: 'Campaign metadata is missing a judging config.' },
        { status: 400 },
      );
    }

    // Fetch submissions to judge.
    let query = db
      .from('submissions')
      .select('*')
      .eq('chain_id', chain.id)
      .eq('campaign_id', String(body.campaignId))
      .in('status', ['pending', 'judging']);
    if (body.submissionIds && body.submissionIds.length > 0) {
      query = query.in('id', body.submissionIds);
    }
    const { data: submissions, error: subErr } = await query;
    if (subErr) return Response.json({ error: subErr.message }, { status: 500 });
    if (!submissions || submissions.length === 0) {
      return Response.json({ judged: [], message: 'No pending submissions to judge.' });
    }

    const passThreshold = judging.passThreshold ?? 70;
    const results: Array<{
      submissionId: string;
      score: number;
      decision: 'pass' | 'fail';
      rationale: string;
      verdictHash: string;
    }> = [];

    // Mark in-progress.
    await db
      .from('submissions')
      .update({ status: 'judging' })
      .in('id', submissions.map((s) => s.id));

    for (const sub of submissions) {
      const submissionPayload = {
        id: sub.id,
        title: sub.title as string | null,
        content: sub.content as string,
        links: (sub.links as { label: string; url: string }[] | null) ?? [],
      };

      // 1. Run judges in parallel.
      const judgeResults = await Promise.all(
        judging.judges.map(async (j) => {
          const v = await runJudge({
            model: j.model,
            persona: j.persona,
            criteria: judging.criteria,
            submission: submissionPayload,
          });
          return { judge: j, verdict: v };
        }),
      );

      // Store judge verdicts (upsert so re-runs overwrite).
      await db
        .from('ai_verdicts')
        .upsert(
          judgeResults.map(({ judge, verdict }) => ({
            submission_id: sub.id,
            judge_id: judge.id,
            provider: judge.provider,
            model: judge.model,
            persona: judge.persona,
            score: verdict.score,
            rationale: verdict.rationale,
            flags: verdict.flags,
            raw: verdict.raw as unknown as Record<string, unknown>,
          })),
          { onConflict: 'submission_id,judge_id' },
        );

      // 2. Arbiter aggregates.
      const arb = await runArbiter(
        {
          model: judging.arbiter.model,
          criteria: judging.criteria,
          submission: submissionPayload,
          judgeVerdicts: judgeResults.map((r) => ({
            judgeId: r.judge.id,
            persona: r.judge.persona,
            score: r.verdict.score,
            rationale: r.verdict.rationale,
          })),
        },
        passThreshold,
      );

      const canonicalVerdict = {
        submissionId: sub.id,
        submissionHash: sub.submission_hash,
        criteria: judging.criteria,
        judges: judgeResults.map((r) => ({
          judgeId: r.judge.id,
          model: r.judge.model,
          persona: r.judge.persona,
          score: r.verdict.score,
          rationale: r.verdict.rationale,
        })),
        arbiter: {
          model: judging.arbiter.model,
          score: arb.score,
          decision: arb.decision,
          rationale: arb.rationale,
        },
      };
      const verdictHash = hashCanonical(canonicalVerdict);

      // 3. Upsert final verdict.
      await db
        .from('final_verdicts')
        .upsert(
          {
            submission_id: sub.id,
            arbiter_provider: judging.arbiter.provider,
            arbiter_model: judging.arbiter.model,
            score: arb.score,
            decision: arb.decision,
            rationale: arb.rationale,
            raw: arb.raw as unknown as Record<string, unknown>,
            verdict_hash: verdictHash,
          },
          { onConflict: 'submission_id' },
        );

      // 4. Update submission status + score.
      await db
        .from('submissions')
        .update({ status: 'scored', score: arb.score, updated_at: new Date().toISOString() })
        .eq('id', sub.id);

      results.push({
        submissionId: sub.id,
        score: arb.score,
        decision: arb.decision,
        rationale: arb.rationale,
        verdictHash,
      });
    }

    return Response.json({ judged: results });
  } catch (err) {
    return authErrorResponse(err);
  }
}
