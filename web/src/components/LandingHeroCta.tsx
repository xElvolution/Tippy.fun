'use client';

import Link from 'next/link';

export function LandingHeroCta() {
  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href="/signup"
        className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-95 inline-flex items-center justify-center"
      >
        Create a campaign
      </Link>
      <Link
        href="/public_campaign_page"
        className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-dim transition-all active:scale-95 inline-flex items-center justify-center"
      >
        Browse live campaigns
      </Link>
    </div>
  );
}
