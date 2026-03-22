import Link from 'next/link';

/** Shared campaign chrome (demo: single campaign). */
export function CampaignWorkspaceHeader() {
  return (
    <>
      <Link
        href="/operator_dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden>
          arrow_back
        </span>
        Back to Campaigns
      </Link>
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Live
            </span>
            <span className="text-on-surface-variant text-sm font-medium">Campaign ID: #TRB-9921</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">Summer Solstice Meme Sprint</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            A high-velocity viral campaign targeting the Solana ecosystem. Powered by AI Agent validation and automated on-chain payouts.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-on-surface-variant mb-1">Treasury balance</div>
          <div className="text-3xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
            42,500 USDC
          </div>
        </div>
      </header>
    </>
  );
}
