import Link from 'next/link';

export default function DraftCampaignsPage() {
  return (
    <main className="max-w-5xl mx-auto px-8 py-12 pb-16">
      <Link
        href="/operator_dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden>
          arrow_back
        </span>
        Back to Campaigns
      </Link>

      <div className="mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Draft campaigns
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          A campaign becomes permanent as soon as it's deployed to TippyMaker, so there are no
          drafts yet. Local draft-saving ships alongside the Discord / Telegram bot flow.
        </p>
      </div>

      <section className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-14 text-center">
        <span className="material-symbols-outlined text-primary text-4xl" aria-hidden>
          drafts
        </span>
        <h2 className="mt-4 font-headline text-2xl font-extrabold text-on-surface">
          No drafts yet
        </h2>
        <p className="mt-2 text-on-surface-variant max-w-xl mx-auto">
          Go straight to the launch form. It deploys directly to Conflux eSpace. Anything you
          enter stays in the form until you sign the transaction.
        </p>
        <Link
          href="/create_campaign_wizard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          Launch a campaign
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </section>
    </main>
  );
}
