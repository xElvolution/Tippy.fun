'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useActiveWallet } from '@/hooks/useTippyCampaigns';
import { CreateCampaignForm } from '@/components/CreateCampaignForm';
import { getTippyAddress } from '@/lib/contracts';
import { getActiveChain } from '@/lib/conflux';

const SIGNUP_REDIRECT = '/signup?redirect=/create_campaign_wizard';

export function CreateCampaignGate() {
  const privyConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
  const { ready, authenticated, address } = useActiveWallet();
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const router = useRouter();

  const needsSignup = privyConfigured && ready && !authenticated;
  const walletWarmingUp = privyConfigured && ready && authenticated && !address;

  useEffect(() => {
    if (needsSignup) {
      router.replace(SIGNUP_REDIRECT);
    }
  }, [needsSignup, router]);

  if (!configured) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 pb-16">
        <header className="mb-10">
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Launch a campaign
          </h1>
        </header>
        <ErrorCard
          title="TippyMaker address not configured"
          body={
            <>
              Set <code className="font-mono">NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS</code> in{' '}
              <code className="font-mono">web/.env.local</code> and restart the dev server before
              creating a campaign.
            </>
          }
        />
      </main>
    );
  }

  if (!ready || needsSignup || walletWarmingUp) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-primary text-3xl animate-pulse" aria-hidden>
          progress_activity
        </span>
        <p className="mt-3 text-sm">
          {walletWarmingUp ? 'Finishing wallet setup…' : 'Checking your session…'}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 pb-16">
      <Link
        href="/operator_dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-8"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden>
          arrow_back
        </span>
        Back to Campaigns
      </Link>

      <header className="mb-10">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">
          Launch a campaign
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
          Pick Bounty or Tip mode, a prize token, submission window, and AI rubric. The form below
          deploys directly to <span className="font-semibold">TippyMaker</span> on {chain.name}.
        </p>
      </header>

      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)]">
        <CreateCampaignForm />
      </section>
    </main>
  );
}

function ErrorCard({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-error/30 bg-error-container/30 px-6 py-8">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-error text-2xl" aria-hidden>
          error
        </span>
        <div>
          <h2 className="font-headline font-bold text-on-error-container">{title}</h2>
          <p className="mt-1 text-sm text-on-error-container/90">{body}</p>
        </div>
      </div>
    </section>
  );
}
