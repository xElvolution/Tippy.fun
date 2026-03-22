'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const TABS = [
  { id: 'overview', label: 'Overview', href: '/campaign/overview' },
  { id: 'submissions', label: 'Submissions', href: '/campaign/submissions' },
  { id: 'judging', label: 'Judging', href: '/campaign/judging' },
  { id: 'ledger', label: 'Funds & ledger', href: '/campaign/funds' },
  { id: 'payout', label: 'Payout', href: '/campaign/payout' },
] as const;

export function CampaignManageTabs() {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-wrap items-center gap-1 p-1 bg-surface-container-low rounded-xl mb-8 sm:mb-10 w-full max-w-full dark:bg-surface-container-high/40"
      role="tablist"
      aria-label="Campaign sections"
    >
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2.5 sm:px-6 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              active
                ? 'bg-surface-container-lowest text-primary shadow-sm dark:bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-lowest/80 dark:hover:bg-surface-container-high/50'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
