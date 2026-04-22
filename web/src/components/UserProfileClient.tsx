'use client';

import Link from 'next/link';
import { formatUnits } from 'viem';
import { useMemo } from 'react';
import { useRecentCampaigns } from '@/hooks/useTippyCampaigns';
import { explorerAddressUrl, shortAddress, getActiveChain } from '@/lib/conflux';
import { OnChainCampaignsStrip } from '@/components/OnChainCampaignsStrip';
import { AvatarGradient } from '@/components/AvatarGradient';
import { MODE_BOUNTY } from '@/lib/contracts';

type ResolvedProfile = {
  handle: string;
  displayName: string;
  walletAddress: string;
  avatarSeed: string;
  twitterHandle: string | null;
  discordHandle: string | null;
  createdAt: string | null;
  inferred: boolean;
};

export function UserProfileClient({ profile }: { profile: ResolvedProfile }) {
  const chain = getActiveChain();
  const recent = useRecentCampaigns(48);

  const stats = useMemo(() => {
    const all = recent.data ?? [];
    const mine = all.filter(
      (c) => c.organizer.toLowerCase() === profile.walletAddress.toLowerCase(),
    );
    const totalPool = mine.reduce((acc, c) => acc + c.prizePool, 0n);
    const bounties = mine.filter((c) => Number(c.mode) === MODE_BOUNTY).length;
    const tips = mine.length - bounties;
    const finalized = mine.filter((c) => c.finalized).length;
    return { count: mine.length, totalPool, bounties, tips, finalized };
  }, [recent.data, profile.walletAddress]);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant/15 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <Link
            href="/public_campaign_page"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to campaigns
          </Link>

          <div className="mt-6 flex flex-col sm:flex-row gap-6 sm:items-center">
            <AvatarGradient
              seed={profile.avatarSeed}
              label={profile.displayName}
              size={112}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant font-mono">@{profile.handle}</p>
              {profile.inferred ? (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface-variant/50 px-2.5 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs">info</span>
                  Unclaimed wallet. If this is yours, sign in to claim it.
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={explorerAddressUrl(profile.walletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface hover:border-primary/40 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                  <span className="font-mono">{shortAddress(profile.walletAddress, 6)}</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
                {profile.twitterHandle ? (
                  <a
                    href={`https://x.com/${profile.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface hover:border-primary/40 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-base">alternate_email</span>@
                    {profile.twitterHandle}
                  </a>
                ) : null}
                {profile.discordHandle ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-base">forum</span>
                    {profile.discordHandle}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Campaigns" value={stats.count.toString()} icon="campaign" />
            <StatCard label="Bounties" value={stats.bounties.toString()} icon="emoji_events" />
            <StatCard label="Tip jars" value={stats.tips.toString()} icon="payments" />
            <StatCard
              label={`Prize pool (${chain.nativeCurrency.symbol} eq.)`}
              value={formatPool(stats.totalPool)}
              icon="savings"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-14 space-y-10">
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                Campaigns organised
              </h2>
              <p className="text-sm text-on-surface-variant">
                Every campaign this wallet has published on {chain.name}.
              </p>
            </div>
          </div>
          <OnChainCampaignsStrip
            variant="default"
            filterOrganizer={profile.walletAddress}
            limit={48}
          />
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-base">{icon}</span>
        </span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
      </div>
      <p className="mt-2 font-headline text-2xl font-extrabold text-on-surface">{value}</p>
    </div>
  );
}

function formatPool(total: bigint): string {
  if (total === 0n) return '0';
  // Values on-chain use token-native decimals; we can't know the exact mix,
  // so just show the raw base-18 magnitude as a quick-glance stat.
  const formatted = formatUnits(total, 18);
  const n = Number(formatted);
  if (!Number.isFinite(n)) return formatted;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(2);
}
