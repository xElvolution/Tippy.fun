'use client';

import { useMemo, useState } from 'react';
import { ExploreBountyCard } from '@/components/ExploreBountyCard';
import type { PublicCampaign } from '@/lib/publicCampaigns';

export function ExploreBountiesGrid({ campaigns }: { campaigns: PublicCampaign[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return campaigns;
    return campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.shortDescription.toLowerCase().includes(s) ||
        c.tags.some((t) => t.toLowerCase().includes(s)),
    );
  }, [campaigns, q]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{filtered.length}</span> active bounties
        </p>
        <div className="relative w-full sm:max-w-xs">
          <span
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 text-on-surface-variant/70"
            style={{ fontSize: '20px', transform: 'translateY(-50%)' }}
            aria-hidden
          >
            search
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search bounties"
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-outline-variant/35 dark:bg-surface-container-low"
            aria-label="Search bounties"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-outline-variant/30 py-16 text-center text-on-surface-variant">
          No bounties match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {filtered.map((c) => (
            <ExploreBountyCard key={c.slug} {...c} />
          ))}
        </div>
      )}
    </>
  );
}
