export default function CampaignOverviewPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-headline text-on-surface mb-2">Overview</h2>
        <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
          Snapshot of this campaign. Open <strong className="text-on-surface">Submissions</strong> to review entries,{' '}
          <strong className="text-on-surface">Judging</strong> for agent scores, <strong className="text-on-surface">Funds &amp; ledger</strong> for
          on-chain movements, and <strong className="text-on-surface">Payout</strong> when winners are ready.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest dark:bg-surface-container-low p-5 rounded-xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-1">Status</p>
          <p className="text-lg font-headline font-bold text-tertiary-container">Live</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container-low p-5 rounded-xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-1">Submissions</p>
          <p className="text-lg font-headline font-bold text-on-surface">842</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container-low p-5 rounded-xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-1">Treasury</p>
          <p className="text-lg font-headline font-bold text-primary">42.5k USDC</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container-low p-5 rounded-xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-1">Channel</p>
          <p className="text-lg font-headline font-bold text-on-surface">Telegram</p>
        </div>
      </div>
    </section>
  );
}
