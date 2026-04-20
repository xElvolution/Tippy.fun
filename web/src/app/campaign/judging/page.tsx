import { Suspense } from 'react';
import { CampaignJudgingClient } from '@/components/CampaignJudgingClient';

export default function CampaignJudgingPage() {
  return (
    <Suspense fallback={<div className="text-on-surface-variant">Loading judging…</div>}>
      <CampaignJudgingClient />
    </Suspense>
  );
}
