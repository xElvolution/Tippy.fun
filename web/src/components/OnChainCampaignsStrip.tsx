'use client';

import Link from 'next/link';
import { formatUnits } from 'viem';
import { useRecentCampaigns } from '@/hooks/useTippyCampaigns';
import { explorerAddressUrl, getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';

export function OnChainCampaignsStrip() {
  const configured = Boolean(getTippyAddress());
  const { data, isLoading } = useRecentCampaigns(12);
  const chain = getActiveChain();

  if (!configured) return null;

  if (isLoading) {
    return (
      <div className="mb-10 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        Loading on-chain campaigns from {chain.name}…
      </div>
    );
  }

  const campaigns = data ?? [];
  if (campaigns.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Live on Conflux</h2>
          <p className="text-sm text-on-surface-variant">
            Campaigns deployed right now on <span className="font-semibold">{chain.name}</span>.
          </p>
        </div>
        <Link
          href="/create_campaign_wizard"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Launch yours
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const title = c.metadata?.title ?? `Campaign #${c.id.toString()}`;
          const description =
            c.metadata?.description ?? 'On-chain bounty / tip campaign on Conflux eSpace.';
          const symbol = c.tokenInfo?.key ?? chain.nativeCurrency.symbol;
          const decimals = c.tokenInfo?.decimals ?? 18;
          const modeLabel = Number(c.mode) === MODE_BOUNTY ? 'Bounty' : 'Tip';
          return (
            <Link
              key={c.id.toString()}
              href={`/campaign/overview?id=${c.id.toString()}`}
              className="group flex flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  #{c.id.toString()} · {modeLabel}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                    c.finalized
                      ? 'bg-surface-variant text-on-surface-variant'
                      : 'bg-tertiary-container/70 text-on-tertiary-container'
                  }`}
                >
                  {c.finalized ? 'Finalized' : 'Active'}
                </span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-2 line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{description}</p>
              <div className="flex items-end justify-between text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Prize pool
                  </p>
                  <p className="font-headline font-extrabold text-primary">
                    {formatUnits(c.prizePool, decimals)} {symbol}
                  </p>
                </div>
                <a
                  href={explorerAddressUrl(c.organizer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-mono text-on-surface-variant hover:text-primary"
                >
                  by {shortAddress(c.organizer)}
                </a>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
