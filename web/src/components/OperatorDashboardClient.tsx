'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useActiveWallet, useRecentCampaigns } from '@/hooks/useTippyCampaigns';
import { OnChainCampaignsStrip } from '@/components/OnChainCampaignsStrip';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';
import { explorerAddressUrl, getActiveChain, shortAddress } from '@/lib/conflux';

const SIGNUP_REDIRECT = '/signup?redirect=/operator_dashboard';

export function OperatorDashboardClient() {
  const configured = Boolean(getTippyAddress());
  const privyConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
  const { ready, authenticated, address } = useActiveWallet();
  const chain = getActiveChain();
  const router = useRouter();
  const { data: allCampaigns, isLoading } = useRecentCampaigns(48);

  const needsSignup = privyConfigured && ready && !authenticated;
  const walletWarmingUp = privyConfigured && ready && authenticated && !address;

  useEffect(() => {
    if (needsSignup) {
      router.replace(SIGNUP_REDIRECT);
    }
  }, [needsSignup, router]);

  const myCampaigns = useMemo(() => {
    if (!address || !allCampaigns) return [];
    const want = address.toLowerCase();
    return allCampaigns.filter((c) => c.organizer.toLowerCase() === want);
  }, [address, allCampaigns]);

  const activeCampaigns = myCampaigns.filter((c) => !c.finalized);
  const totalPrizePoolByToken = useMemo(() => {
    const buckets = new Map<string, { symbol: string; decimals: number; amount: bigint }>();
    for (const c of myCampaigns) {
      const key = c.token.toLowerCase();
      const symbol = c.tokenInfo?.key ?? 'CFX';
      const decimals = c.tokenInfo?.decimals ?? 18;
      const bucket = buckets.get(key) ?? { symbol, decimals, amount: 0n };
      bucket.amount += c.prizePool;
      buckets.set(key, bucket);
    }
    return Array.from(buckets.values());
  }, [myCampaigns]);

  if (!privyConfigured) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-primary text-4xl" aria-hidden>
          key
        </span>
        <h1 className="mt-4 font-headline text-3xl font-extrabold text-on-surface">
          Privy not configured
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Set <code className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</code> in{' '}
          <code className="font-mono">web/.env.local</code> and restart the dev server.
        </p>
      </main>
    );
  }

  if (!ready || needsSignup || walletWarmingUp) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-primary text-3xl animate-pulse" aria-hidden>
          progress_activity
        </span>
        <p className="mt-3 text-sm">
          {walletWarmingUp ? 'Finishing wallet setup…' : 'Checking your session…'}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-8 pt-12 pb-16">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-12">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-5xl font-extrabold font-headline tracking-tight text-on-surface">
            Campaigns
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Your on-chain hub. Every card below is read straight from TippyMaker on {chain.name}.
            Nothing cached, nothing mocked.
          </p>
          {address ? (
            <p className="text-sm text-on-surface-variant">
              Connected as{' '}
              <a
                href={explorerAddressUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline"
              >
                {shortAddress(address, 6)}
              </a>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <Link
            href="/draft_campaigns"
            className="bg-surface-container-highest text-on-surface px-6 py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">folder_special</span>
            View drafts
          </Link>
          <Link
            href="/create_campaign_wizard"
            className="primary-gradient px-8 py-4 rounded-xl font-bold inline-flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(107,56,212,0.2)] hover:scale-[1.02] active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined" data-icon="add">
              add
            </span>
            New campaign
          </Link>
        </div>
      </header>

      {!configured ? (
        <div className="mb-10 rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-10 text-center">
          <span className="material-symbols-outlined text-primary text-3xl" aria-hidden>
            link_off
          </span>
          <p className="mt-3 font-headline font-bold text-on-surface">
            TippyMaker address not configured
          </p>
          <p className="mt-1 text-sm text-on-surface-variant max-w-md mx-auto">
            Set <code className="font-mono">NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS</code> in{' '}
            <code className="font-mono">web/.env.local</code> to enable the dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
            <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(17,28,45,0.04)] overflow-hidden relative">
              <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">
                Prize pools you manage ({chain.name})
              </p>
              {isLoading ? (
                <p className="text-2xl font-headline font-extrabold text-on-surface-variant">
                  Loading from chain…
                </p>
              ) : totalPrizePoolByToken.length === 0 ? (
                <p className="text-2xl font-headline font-extrabold text-on-surface-variant">
                  No prize pools yet
                </p>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  {totalPrizePoolByToken.map((b) => (
                    <h2
                      key={b.symbol}
                      className="text-4xl font-headline font-extrabold text-on-surface"
                    >
                      {formatUnits(b.amount, b.decimals)}{' '}
                      <span className="text-lg font-medium text-tertiary-container font-body">
                        {b.symbol}
                      </span>
                    </h2>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-on-surface-variant">
                Sum of <code className="font-mono">prizePool</code> across every campaign this
                wallet organized. Funds sit non-custodially in TippyMaker.
              </p>
            </div>
            <div className="md:col-span-4 bg-primary-fixed p-8 rounded-xl flex flex-col justify-center">
              <p className="text-on-primary-fixed-variant font-semibold text-sm mb-1">
                Active campaigns
              </p>
              <h2 className="text-4xl font-headline font-extrabold text-on-primary-fixed">
                {isLoading ? '-' : activeCampaigns.length}
              </h2>
              <p className="mt-2 text-xs text-on-primary-fixed-variant">
                Not finalized yet. Still accepting submissions or tipping.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-headline font-bold">Your campaigns</h3>
              <Link
                href="/create_campaign_wizard"
                className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Launch another
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <OnChainCampaignsStrip filterOrganizer={address} limit={48} />
          </div>
        </>
      )}

      {/* All campaigns on-chain (discovery) */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-2xl font-headline font-bold">All campaigns on {chain.name}</h3>
            <p className="text-sm text-on-surface-variant">
              Every organizer, not just yours. Same contract, same view.
            </p>
          </div>
        </div>
        <OnChainCampaignsStrip limit={24} />
      </section>
    </main>
  );
}
