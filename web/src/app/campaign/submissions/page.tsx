import { Suspense } from 'react';
import { CampaignSubmissionsClient } from '@/components/CampaignSubmissionsClient';

export default function CampaignSubmissionsPage() {
  return (
    <Suspense fallback={<div className="text-on-surface-variant">Loading submissions…</div>}>
      <CampaignSubmissionsClient />
    </Suspense>
  );
}
