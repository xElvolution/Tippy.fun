import { Suspense } from 'react';
import { CampaignFundsClient } from '@/components/CampaignFundsClient';

export default function CampaignFundsPage() {
  return (
    <Suspense fallback={<div className="text-on-surface-variant text-sm">Loading ledger…</div>}>
      <CampaignFundsClient />
    </Suspense>
  );
}
