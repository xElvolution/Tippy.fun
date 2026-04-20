'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { SubmissionForm } from '@/components/SubmissionForm';
import { ClaimCard } from '@/components/ClaimCard';
import { useActiveWallet, useCampaign } from '@/hooks/useTippyCampaigns';
import { shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';

type Submission = {
  id: string;
  submitter_privy_id: string;
  submitter_wallet: string | null;
  title: string | null;
  content: string;
  links: { label: string; url: string }[] | null;
  submission_hash: string;
  status: 'pending' | 'judging' | 'scored' | 'paid' | 'rejected';
  score: number | null;
  created_at: string;
};

export function CampaignSubmissionsClient() {
  const params = useSearchParams();
  const idParam = params.get('id');
  const configured = Boolean(getTippyAddress());
  const idBig = idParam
    ? (() => {
        try {
          return BigInt(idParam);
        } catch {
          return undefined;
        }
      })()
    : undefined;
  const { address } = useActiveWallet();
  const { campaign } = useCampaign(idBig);

  const subsQuery = useQuery({
    enabled: !!idParam,
    queryKey: ['submissions', idParam],
    queryFn: async () => {
      const r = await fetch(`/api/submissions?campaignId=${idParam}`);
      const body = (await r.json()) as { submissions: Submission[] };
      return body.submissions ?? [];
    },
    refetchInterval: 5_000,
  });

  const isOrganizer =
    campaign && address ? campaign.organizer.toLowerCase() === address.toLowerCase() : false;

  if (!configured || !idParam) {
    return (
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-headline text-on-surface">Submissions</h2>
        <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          Open this page with <code className="font-mono">?id=&lt;campaignId&gt;</code> to
          participate in or review submissions. Need a campaign first?{' '}
          <Link
            href="/create_campaign_wizard"
            className="font-semibold text-primary hover:underline"
          >
            Launch one
          </Link>
          .
        </div>
      </section>
    );
  }

  const submissions = subsQuery.data ?? [];
  const mine = address
    ? submissions.filter(
        (s) => s.submitter_wallet?.toLowerCase() === address.toLowerCase(),
      )
    : [];

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold font-headline text-on-surface">Submissions</h2>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            {submissions.length} submission{submissions.length === 1 ? '' : 's'} so far. The
            content is stored in Supabase and its keccak256 hash is anchored on-chain when the
            arbiter rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface-container-high text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              <span className="col-span-5">Participant</span>
              <span className="col-span-4">Preview</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1 text-right">Score</span>
            </div>
            {submissions.length === 0 ? (
              <div className="p-6 text-sm text-on-surface-variant">No submissions yet.</div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {submissions.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center"
                  >
                    <span className="col-span-5 font-mono text-xs">
                      {s.submitter_wallet
                        ? shortAddress(s.submitter_wallet)
                        : 'no wallet'}
                    </span>
                    <span className="col-span-4 text-on-surface-variant truncate">
                      {s.title || s.content.slice(0, 60)}
                    </span>
                    <span className="col-span-2 text-xs font-semibold">
                      <StatusPill status={s.status} />
                    </span>
                    <span className="col-span-1 text-right font-headline font-bold">
                      {s.score ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isOrganizer ? (
            <p className="text-xs text-on-surface-variant">
              Ready to judge? Head to{' '}
              <Link
                href={`/campaign/judging?id=${idParam}`}
                className="font-semibold text-primary hover:underline"
              >
                the judging tab
              </Link>{' '}
              to run the AI panel.
            </p>
          ) : null}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {campaign && Number(campaign.mode) === MODE_BOUNTY ? (
            <ClaimCard campaignId={idParam} />
          ) : null}
          <SubmissionForm
            campaignId={idParam}
            onSubmitted={() => subsQuery.refetch()}
          />
          {mine.length > 0 ? (
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                My submissions
              </p>
              <ul className="space-y-2 text-sm">
                {mine.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="truncate text-on-surface">
                      {s.title || s.content.slice(0, 40)}
                    </span>
                    <StatusPill status={s.status} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: Submission['status'] }) {
  const styles: Record<Submission['status'], string> = {
    pending: 'bg-surface-variant text-on-surface-variant',
    judging: 'bg-primary-fixed text-on-primary-fixed-variant',
    scored: 'bg-tertiary-container text-on-tertiary-container',
    paid: 'bg-tertiary text-on-tertiary',
    rejected: 'bg-error-container text-on-error-container',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
