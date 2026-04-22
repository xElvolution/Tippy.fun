'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeEventLog } from 'viem';
import { usePublicClient } from 'wagmi';
import { useCreateCampaign } from '@/hooks/useTippyCampaigns';
import { tippyMakerAbi } from '@/lib/tippyAbi';
import { explorerTxUrl, getActiveChain } from '@/lib/conflux';
import { getTippyAddress, supportedTokens, MODE_BOUNTY, MODE_TIP, type CampaignMode } from '@/lib/contracts';
import { defaultJudgingConfig } from '@/lib/campaignMetadata';

type Props = { className?: string };

export function CreateCampaignForm({ className }: Props) {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const router = useRouter();
  const publicClient = usePublicClient({ chainId: chain.id });
  const { create, state } = useCreateCampaign();

  const tokens = useMemo(() => supportedTokens(), []);
  const [tokenKey, setTokenKey] = useState(tokens[0]?.key ?? 'CFX');
  const token = tokens.find((t) => t.key === tokenKey) ?? tokens[0];

  const [mode, setMode] = useState<CampaignMode>(MODE_BOUNTY);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');
  const [channel, setChannel] = useState<'discord' | 'telegram' | 'web'>('web');
  const [seed, setSeed] = useState('1');
  const [duration, setDuration] = useState('7'); // days until submissionsClose
  const [claimDays, setClaimDays] = useState('7'); // additional days after submissionsClose for claim window (Bounty)
  const [rewardPerSubmission, setRewardPerSubmission] = useState('0.1'); // Tip mode only
  const [err, setErr] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<bigint | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setCreatedId(null);
    if (!configured) {
      setErr(
        'On-chain creation requires NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS in web/.env.local.',
      );
      return;
    }
    if (!token) {
      setErr('No supported token configured for this network.');
      return;
    }
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const submissionsClose =
        duration && Number(duration) > 0 ? nowSec + Number(duration) * 86_400 : 0;
      const claimDeadline =
        mode === MODE_BOUNTY
          ? (submissionsClose || nowSec) + Math.max(Number(claimDays || '1'), 1) * 86_400
          : 0;

      const judging = defaultJudgingConfig(criteria.trim());
      if (mode === MODE_TIP) {
        judging.rewardPerSubmission = rewardPerSubmission || '0';
      }

      const hash = await create({
        metadata: {
          title: title.trim(),
          description: description.trim(),
          channel,
          tags: [channel, mode === MODE_BOUNTY ? 'bounty' : 'tip'],
          judging,
          version: 2,
        },
        mode,
        token,
        submissionsClose,
        claimDeadline,
        seedAmount: seed && Number(seed) > 0 ? seed : undefined,
      });
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        for (const log of receipt.logs) {
          try {
            const parsed = decodeEventLog({
              abi: tippyMakerAbi,
              data: log.data,
              topics: log.topics,
            });
            if (parsed.eventName === 'CampaignCreated') {
              const id = (parsed.args as { id: bigint }).id;
              setCreatedId(id);
              router.push(`/campaign/overview?id=${id.toString()}`);
              return;
            }
          } catch {
            // not our event
          }
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const isBusy = state.status === 'pending';
  const txHash = state.status === 'success' ? state.hash : null;

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">Launch on Conflux eSpace</h3>
          <p className="text-sm text-on-surface-variant">
            Deploys a non-custodial escrow on {chain.name} and records the judging config on-chain.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed-variant">
          <span className="material-symbols-outlined text-sm">bolt</span>
          On-chain
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Mode toggle */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-on-surface ml-1">Campaign mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ModeCard
              selected={mode === MODE_BOUNTY}
              onClick={() => setMode(MODE_BOUNTY)}
              title="Bounty / Hackathon"
              subtitle="AI judges rank submissions. Winners claim within your claim window; unclaimed funds return to you."
              tag="Claim-based"
            />
            <ModeCard
              selected={mode === MODE_TIP}
              onClick={() => setMode(MODE_TIP)}
              title="Tip / Always-on"
              subtitle="Every qualifying submission gets paid the moment the AI arbiter approves it. No claim step."
              tag="Auto-pay"
            />
          </div>
        </div>

        {/* Title + description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-on-surface ml-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            placeholder={mode === MODE_BOUNTY ? 'Conflux DeFi Hack 2026' : 'Always-on GM thread contest'}
            className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-on-surface ml-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            maxLength={1200}
            placeholder="What are participants building / posting / writing?"
            className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
          />
        </div>

        {/* AI criteria */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-on-surface ml-1">
            AI judging criteria
          </label>
          <textarea
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            required
            rows={4}
            maxLength={2000}
            placeholder={
              mode === MODE_BOUNTY
                ? '1. Technical quality 40%\n2. Originality 30%\n3. Conflux integration 20%\n4. Clarity 10%'
                : 'Post must be original, informative, at least 180 chars, and mention Conflux.'
            }
            className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
          />
          <p className="text-xs text-on-surface-variant">
            Three OpenAI judges + one OpenAI arbiter score each submission against this rubric.
            Additional providers (Anthropic, Gemini) can be wired post-hackathon.
          </p>
        </div>

        {/* Token + seed */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface ml-1">Prize token</label>
            <select
              value={tokenKey}
              onChange={(e) => setTokenKey(e.target.value as typeof tokenKey)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface"
            >
              {tokens.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface ml-1">
              Treasury seed ({token?.key ?? ''})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="1"
              className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface ml-1">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as typeof channel)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="web">Web</option>
              <option value="discord">Discord</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
        </div>

        {/* Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface ml-1">
              Submissions open for (days)
            </label>
            <input
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface"
            />
          </div>
          {mode === MODE_BOUNTY ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface ml-1">
                Claim window (days after submissions close)
              </label>
              <input
                type="number"
                min="1"
                value={claimDays}
                onChange={(e) => setClaimDays(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface ml-1">
                Reward per qualifying submission ({token?.key})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={rewardPerSubmission}
                onChange={(e) => setRewardPerSubmission(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs text-on-surface-variant">
          Non-custodial escrow. Funds only move to winners or back to you.
        </p>
        <button
          type="submit"
          disabled={isBusy || !token}
          className="primary-gradient rounded-xl px-8 py-4 text-base font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isBusy ? 'Deploying on Conflux…' : 'Launch campaign'}
        </button>
      </div>

      {err ? (
        <p className="mt-4 text-sm text-on-error-container bg-error-container/60 rounded-lg px-3 py-2">
          {err}
        </p>
      ) : null}
      {txHash ? (
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {createdId !== null
            ? `Campaign #${createdId.toString()} created. View on ConfluxScan`
            : 'View transaction on ConfluxScan'}
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      ) : null}
    </form>
  );
}

function ModeCard({
  selected,
  onClick,
  title,
  subtitle,
  tag,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  tag: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/40'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-on-surface">{title}</span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
            selected ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
          }`}
        >
          {tag}
        </span>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{subtitle}</p>
    </button>
  );
}
