import { Suspense } from 'react';
import { CampaignOverviewClient } from '@/components/CampaignOverviewClient';

export default function CampaignOverviewPage() {
  return (
    <Suspense fallback={<section className="text-on-surface-variant text-sm">Loading…</section>}>
      <CampaignOverviewClient />
    </Suspense>
  );
}
