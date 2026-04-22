'use client';

import Link from 'next/link';
import { formatUnits } from 'viem';
import { useRecentCampaigns } from '@/hooks/useTippyCampaigns';
import { getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';

type Props = {
  /**
   * `default` – full marketing grid (used on landing + dashboard).
   * `hero` – compact list inside the hero illustration panel.
   */
  variant?: 'default' | 'hero';
  /** Optional filter: only show campaigns where `organizer === filterOrganizer`. */
  filterOrganizer?: string;
  /** Headline shown above the grid when `variant = default`. */
  showHeader?: boolean;
  /** Max number of campaigns to request from the contract. */
  limit?: number;
  /**
   * When true, render a softer encouragement card for the empty state
   * (e.g. when the page already shows past bounties above and we don't need to
   * shout 'No live campaigns').
   */
  soften?: boolean;
};

export function OnChainCampaignsStrip({
  variant = 'default',
  filterOrganizer,
  showHeader = false,
  limit = 12,
  soften = false,
}: Props) {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const { data, isLoading, error } = useRecentCampaigns(limit);

  if (!configured) {
    return (
      <EmptyState
        icon="link_off"
        title="TippyMaker address not configured"
        body={`Set NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS in web/.env.local so the site can read campaigns from ${chain.name}.`}
      />
    );
  }

  if (isLoading) {
    return (
      <EmptyState
        icon="hourglass_top"
        title={`Loading campaigns from ${chain.name}…`}
        body="Pulling the latest page from TippyMaker.getRecentCampaigns()."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="error"
        title="Couldn't reach TippyMaker"
        body={error instanceof Error ? error.message : 'Unknown RPC error.'}
      />
    );
  }

  const all = data ?? [];
  const campaigns = filterOrganizer
    ? all.filter((c) => c.organizer.toLowerCase() === filterOrganizer.toLowerCase())
    : all;

  if (campaigns.length === 0) {
    if (soften) {
      return (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-headline text-lg font-extrabold text-on-surface">
              Your campaign could be here
            </p>
            <p className="mt-1 text-sm text-on-surface-variant max-w-xl">
              Be the first operator to go live on {chain.name}. You'll appear above the past
              bounties showcase.
            </p>
          </div>
          <Link
            href="/create_campaign_wizard"
            className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-bold hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            Launch yours
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      );
    }
    return (
      <EmptyState
        icon="rocket_launch"
        title={filterOrganizer ? 'No campaigns from this wallet yet' : 'No live campaigns yet'}
        body={
          filterOrganizer
            ? 'Launch your first campaign to see it here.'
            : `Nothing on ${chain.name} right now. Be the first to launch.`
        }
        cta={{ href: '/create_campaign_wizard', label: 'Create a campaign' }}
      />
    );
  }

  if (variant === 'hero') {
    return (
      <ul className="space-y-3">
        {campaigns.slice(0, 3).map((c) => {
          const title = c.metadata?.title ?? `Campaign #${c.id.toString()}`;
          const symbol = c.tokenInfo?.key ?? chain.nativeCurrency.symbol;
          const decimals = c.tokenInfo?.decimals ?? 18;
          const modeLabel = Number(c.mode) === MODE_BOUNTY ? 'Bounty' : 'Tip';
          return (
            <li key={c.id.toString()}>
              <Link
                href={`/campaign/overview?id=${c.id.toString()}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    #{c.id.toString()} · {modeLabel}
                  </p>
                  <p className="font-headline text-sm font-bold text-on-surface truncate">
                    {title}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Prize
                  </p>
                  <p className="font-headline font-extrabold text-primary text-sm">
                    {formatUnits(c.prizePool, decimals)} {symbol}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className={showHeader ? 'mb-12' : ''}>
      {showHeader && (
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
      )}
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
                <Link
                  href={`/u/${c.organizer}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-mono text-on-surface-variant hover:text-primary"
                >
                  by {shortAddress(c.organizer)}
                </Link>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-10 text-center">
      <span className="material-symbols-outlined text-primary text-3xl" aria-hidden>
        {icon}
      </span>
      <p className="mt-3 font-headline font-bold text-on-surface">{title}</p>
      <p className="mt-1 text-sm text-on-surface-variant max-w-md mx-auto">{body}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-2 text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          {cta.label}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      ) : null}
    </div>
  );
}
