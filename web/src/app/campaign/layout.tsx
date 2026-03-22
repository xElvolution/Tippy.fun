import { CampaignManageTabs } from '@/components/CampaignManageTabs';
import { CampaignWorkspaceHeader } from '@/components/CampaignWorkspaceHeader';

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-7xl mx-auto px-8 py-10 pb-16">
      <CampaignWorkspaceHeader />
      <CampaignManageTabs />
      {children}
    </main>
  );
}
