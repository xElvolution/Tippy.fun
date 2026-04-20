'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { JudgingPanel } from '@/components/JudgingPanel';
import { getTippyAddress } from '@/lib/contracts';

export function CampaignJudgingClient() {
  const params = useSearchParams();
  const idParam = params.get('id');
  const configured = Boolean(getTippyAddress());

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">AI judging</h2>
          <p className="text-on-surface-variant text-sm max-w-2xl">
            Three OpenAI judges + one OpenAI arbiter score each submission against your
            criteria. Scores and rationales are stored off-chain in Supabase; a keccak256
            verdict hash is sealed on-chain when you publish winners (Bounty) or pay tips
            (Tip mode).
          </p>
        </div>
      </div>

      {!configured || !idParam ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          Open this page with <code className="font-mono">?id=&lt;campaignId&gt;</code> to
          review submissions. Need a campaign first?{' '}
          <Link
            href="/create_campaign_wizard"
            className="font-semibold text-primary hover:underline"
          >
            Launch one
          </Link>
          .
        </div>
      ) : (
        <JudgingPanel campaignId={idParam} />
      )}
    </section>
  );
}
