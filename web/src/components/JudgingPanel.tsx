'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import {
  useActiveWallet,
  useCampaign,
  usePayTip,
  useSettleWinners,
} from '@/hooks/useTippyCampaigns';
import { useAuthedFetch } from '@/lib/apiClient';
import { getActiveChain, explorerTxUrl, shortAddress } from '@/lib/conflux';
import { MODE_BOUNTY, MODE_TIP } from '@/lib/contracts';

type Submission = {
  id: string;
  campaign_id: string;
  submitter_privy_id: string;
  submitter_wallet: string | null;
  title: string | null;
  content: string;
  links: { label: string; url: string }[] | null;
  submission_hash: `0x${string}`;
  status: 'pending' | 'judging' | 'scored' | 'paid' | 'rejected';
  score: number | null;
  created_at: string;
};

type JudgeVerdict = {
  judge_id: string;
  model: string;
  persona: string;
  score: number;
  rationale: string;
};

type FinalVerdict = {
  submission_id: string;
  score: number;
  decision: 'pass' | 'fail';
  rationale: string;
  verdict_hash: `0x${string}`;
};

type Props = { campaignId: string | number };

export function JudgingPanel({ campaignId }: Props) {
  const chain = getActiveChain();
  const id = BigInt(campaignId);
  const { campaign } = useCampaign(id);
  const { address } = useActiveWallet();
  const authedFetch = useAuthedFetch();
  const { settle, state: settleState } = useSettleWinners();
  const { pay: payTip, state: tipState } = usePayTip();

  const token = campaign?.tokenInfo;
  const symbol = token?.key ?? chain.nativeCurrency.symbol;
  const decimals = token?.decimals ?? 18;
  const mode = campaign ? Number(campaign.mode) : MODE_BOUNTY;
  const isOrganizer =
    campaign && address ? campaign.organizer.toLowerCase() === address.toLowerCase() : false;

  const subsQuery = useQuery({
    queryKey: ['submissions', String(campaignId)],
    queryFn: async () => {
      const r = await fetch(`/api/submissions?campaignId=${campaignId}`);
      const body = (await r.json()) as { submissions: Submission[] };
      return body.submissions;
    },
    refetchInterval: 5_000,
  });

  const verdictsQuery = useQuery({
    queryKey: ['verdicts', String(campaignId), subsQuery.data?.length ?? 0],
    enabled: !!subsQuery.data,
    queryFn: async () => {
      const subs = subsQuery.data ?? [];
      if (subs.length === 0)
        return { ai: [] as JudgeVerdict[], final: [] as FinalVerdict[] };
      const r = await fetch(
        `/api/judging/verdicts?campaignId=${campaignId}`,
      );
      if (!r.ok) return { ai: [] as JudgeVerdict[], final: [] as FinalVerdict[] };
      return (await r.json()) as {
        ai: (JudgeVerdict & { submission_id: string })[];
        final: FinalVerdict[];
      };
    },
  });

  const [runBusy, setRunBusy] = useState(false);
  const [runErr, setRunErr] = useState<string | null>(null);
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});
  const [lastTxForSub, setLastTxForSub] = useState<Record<string, `0x${string}`>>({});
  const [settleTx, setSettleTx] = useState<`0x${string}` | null>(null);

  const runJudging = useCallback(async () => {
    setRunBusy(true);
    setRunErr(null);
    try {
      await authedFetch('/api/judging/run', {
        method: 'POST',
        body: JSON.stringify({ campaignId: String(campaignId) }),
      });
      await subsQuery.refetch();
      await verdictsQuery.refetch();
    } catch (e) {
      setRunErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRunBusy(false);
    }
  }, [authedFetch, campaignId, subsQuery, verdictsQuery]);

  const handlePayTip = useCallback(
    async (sub: Submission, finalV: FinalVerdict) => {
      if (!campaign || !token) return;
      const amount =
        payAmounts[sub.id] ??
        campaign.metadata?.judging?.rewardPerSubmission ??
        '';
      if (!amount || !sub.submitter_wallet) return;
      try {
        const hash = await payTip({
          id: campaign.id,
          to: sub.submitter_wallet as `0x${string}`,
          amount,
          token,
          submissionId: sub.id,
          verdictHash: finalV.verdict_hash,
          payoutNote: `AI arbiter ${finalV.score}/100`,
        });
        setLastTxForSub((prev) => ({ ...prev, [sub.id]: hash }));
      } catch {
        // state.error surfaces in UI
      }
    },
    [campaign, token, payAmounts, payTip],
  );

  const handleSettleAll = useCallback(
    async (passing: Submission[], finals: FinalVerdict[]) => {
      if (!campaign || !token) return;
      const finalBySub = new Map(finals.map((f) => [f.submission_id, f]));
      const winners = passing
        .filter((s) => s.submitter_wallet)
        .map((s) => {
          const v = finalBySub.get(s.id);
          const amt =
            payAmounts[s.id] ?? campaign.metadata?.judging?.rewardPerSubmission ?? '';
          return {
            address: s.submitter_wallet as `0x${string}`,
            amount: amt,
            submissionId: s.id,
            verdictHash: v?.verdict_hash,
          };
        })
        .filter((w) => Number(w.amount) > 0 && w.verdictHash);
      if (winners.length === 0) return;
      try {
        const plan = await authedFetch<{ plan: { id: string; verdict_hash: `0x${string}` } }>(
          '/api/judging/plan',
          {
            method: 'POST',
            body: JSON.stringify({
              campaignId: String(campaignId),
              winners: winners.map((w) => ({
                submissionId: w.submissionId,
                winnerAddress: w.address,
                amount: w.amount,
              })),
              payoutNote: `Panel verdict — ${winners.length} winner(s)`,
            }),
          },
        );
        const hash = await settle({
          id: campaign.id,
          token,
          winners: winners.map((w) => ({
            address: w.address,
            amount: w.amount,
            submissionId: w.submissionId,
          })),
          verdictHash: plan.plan.verdict_hash,
          payoutNote: `Panel verdict — ${winners.length} winner(s)`,
        });
        setSettleTx(hash);
        await authedFetch('/api/judging/plan', {
          method: 'PATCH',
          body: JSON.stringify({ planId: plan.plan.id, txHash: hash }),
        });
      } catch {
        // tx state surfaces elsewhere
      }
    },
    [authedFetch, campaign, campaignId, payAmounts, settle, token],
  );

  if (!campaign) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        Loading campaign…
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-sm">
        <p className="font-bold text-on-surface mb-1">Organizer-only</p>
        <p className="text-on-surface-variant">
          Connect as the campaign organizer ({shortAddress(campaign.organizer)}) to run AI
          judging and publish verdicts on-chain.
        </p>
      </div>
    );
  }

  const submissions = subsQuery.data ?? [];
  const finals = verdictsQuery.data?.final ?? [];
  const aiVerdicts = (verdictsQuery.data?.ai ?? []) as (JudgeVerdict & {
    submission_id: string;
  })[];
  const finalsBySub = new Map(finals.map((f) => [f.submission_id, f]));
  const aiBySub = new Map<string, JudgeVerdict[]>();
  for (const v of aiVerdicts) {
    const arr = aiBySub.get(v.submission_id) ?? [];
    arr.push(v);
    aiBySub.set(v.submission_id, arr);
  }
  const passing = submissions.filter((s) => finalsBySub.get(s.id)?.decision === 'pass');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">AI judging panel</h3>
            <p className="text-sm text-on-surface-variant">
              {submissions.length} submission{submissions.length === 1 ? '' : 's'} ·{' '}
              {finals.length} scored · {passing.length} passing
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={runJudging}
              disabled={runBusy}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {runBusy ? 'Judges deliberating…' : 'Run AI judging'}
            </button>
            {mode === MODE_BOUNTY ? (
              <button
                type="button"
                onClick={() => handleSettleAll(passing, finals)}
                disabled={passing.length === 0 || settleState.status === 'pending'}
                className="rounded-xl bg-tertiary px-5 py-3 text-sm font-bold text-on-tertiary shadow-lg shadow-tertiary/20 disabled:opacity-60"
              >
                {settleState.status === 'pending'
                  ? 'Publishing on-chain…'
                  : `Publish ${passing.length} winner${passing.length === 1 ? '' : 's'}`}
              </button>
            ) : null}
          </div>
        </div>
        {runErr ? (
          <p className="mt-3 rounded-lg bg-error-container/70 px-3 py-2 text-sm text-on-error-container">
            {runErr}
          </p>
        ) : null}
        {settleTx ? (
          <a
            href={explorerTxUrl(settleTx)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Settlement broadcast — view on ConfluxScan
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        ) : null}
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          No submissions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const judges = aiBySub.get(sub.id) ?? [];
            const final = finalsBySub.get(sub.id);
            const lastTx = lastTxForSub[sub.id];
            return (
              <div
                key={sub.id}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 bg-surface-variant text-on-surface-variant">
                        {sub.status}
                      </span>
                      {final ? (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                            final.decision === 'pass'
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {final.decision} · {final.score}/100
                        </span>
                      ) : null}
                      <span className="text-xs font-mono text-on-surface-variant">
                        {sub.submitter_wallet
                          ? shortAddress(sub.submitter_wallet)
                          : 'no wallet'}
                      </span>
                    </div>
                    <p className="font-semibold text-on-surface">
                      {sub.title || 'Untitled submission'}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant whitespace-pre-wrap line-clamp-4">
                      {sub.content}
                    </p>
                    {sub.links && sub.links.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sub.links.map((l) => (
                          <a
                            key={l.url}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {l.label || l.url}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {mode === MODE_TIP && final?.decision === 'pass' ? (
                    <div className="flex flex-col items-end gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder={
                          campaign.metadata?.judging?.rewardPerSubmission ?? '0.1'
                        }
                        value={payAmounts[sub.id] ?? ''}
                        onChange={(e) =>
                          setPayAmounts((p) => ({ ...p, [sub.id]: e.target.value }))
                        }
                        className="w-32 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-right text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        disabled={tipState.status === 'pending' || !sub.submitter_wallet}
                        onClick={() => handlePayTip(sub, final)}
                        className="rounded-xl bg-tertiary px-4 py-2 text-xs font-bold text-on-tertiary disabled:opacity-60"
                      >
                        {tipState.status === 'pending' ? 'Paying…' : `Pay ${symbol}`}
                      </button>
                      {lastTx ? (
                        <a
                          href={explorerTxUrl(lastTx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline"
                        >
                          Tx ↗
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {mode === MODE_BOUNTY && final?.decision === 'pass' ? (
                    <div className="flex flex-col items-end gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                        Prize ({symbol})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.0"
                        value={payAmounts[sub.id] ?? ''}
                        onChange={(e) =>
                          setPayAmounts((p) => ({ ...p, [sub.id]: e.target.value }))
                        }
                        className="w-32 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-right text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ) : null}
                </div>

                {judges.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {judges.map((j) => (
                      <div
                        key={j.judge_id}
                        className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-on-surface">
                            {j.judge_id}
                          </span>
                          <span className="font-mono text-primary">{j.score}/100</span>
                        </div>
                        <p className="mt-1 text-[11px] text-on-surface-variant">
                          {j.persona} · {j.model}
                        </p>
                        <p className="mt-2 text-xs text-on-surface whitespace-pre-wrap line-clamp-3">
                          {j.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {final ? (
                  <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                      Arbiter verdict
                    </p>
                    <p className="text-sm text-on-surface whitespace-pre-wrap">
                      {final.rationale}
                    </p>
                    <p className="mt-2 text-[10px] text-on-surface-variant font-mono break-all">
                      verdict_hash: {final.verdict_hash}
                    </p>
                  </div>
                ) : null}

                {campaign ? (
                  <p className="mt-3 text-[10px] text-on-surface-variant font-mono break-all">
                    submission_hash: {sub.submission_hash} ·{' '}
                    prize pool {formatUnits(campaign.prizePool, decimals)} {symbol}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
