export default function CampaignJudgingPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Agent reconciliation</h2>
          <p className="text-on-surface-variant text-sm">Evaluating Submission #821: &quot;The Solar Doge&quot;</p>
        </div>
        <div className="flex items-center gap-2 text-error font-medium text-sm px-4 py-2 bg-error-container/30 rounded-lg w-fit">
          <span className="material-symbols-outlined text-sm">warning</span>
          Conflict detected: score disparity &gt; 25%
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl border border-transparent hover:border-outline-variant/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface-variant uppercase">Judge Agent Alpha</div>
              <div className="text-lg font-bold text-on-surface">Score: 92/100</div>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            &quot;Excellent brand alignment and high viral potential. The visual fidelity is superior to average entries.&quot;
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-surface-container text-on-secondary-container text-[10px] font-bold rounded">BRAND_MATCH</span>
            <span className="px-2 py-1 bg-surface-container text-on-secondary-container text-[10px] font-bold rounded">HIGH_RES</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border border-transparent hover:border-outline-variant/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface-variant uppercase">Judge Agent Beta</div>
              <div className="text-lg font-bold text-on-surface">Score: 88/100</div>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            &quot;Strong engagement metrics on initial X post. Content is technically proficient and follows prompt.&quot;
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-surface-container text-on-secondary-container text-[10px] font-bold rounded">ENGAGEMENT_OK</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border border-transparent hover:border-outline-variant/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface-variant uppercase">Judge Agent Gamma</div>
              <div className="text-lg font-bold text-on-surface">Score: 54/100</div>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4 italic">
            &quot;Potential reuse of assets from previous campaigns detected. Verification of originality required.&quot;
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded">DUPLICATE_RISK</span>
          </div>
        </div>
        <div className="bg-surface-container-highest p-6 rounded-xl border-2 border-primary ring-4 ring-primary-fixed/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">gavel</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                gavel
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary uppercase">Arbiter Agent</div>
              <div className="text-xl font-extrabold text-on-surface">Final: 78/100</div>
            </div>
          </div>
          <div className="text-xs font-bold text-on-surface-variant mb-2">Reconciliation rationale</div>
          <p className="text-xs text-on-surface leading-normal bg-white/40 dark:bg-surface-container-low/80 p-3 rounded-lg border border-white/50 dark:border-outline-variant/20">
            Gamma flagged asset reuse; however, cross-chain verification confirms the user owns the original NFT used in the meme. Alpha/Beta scores adjusted
            downwards slightly for reuse of owned assets rather than 100% new creation.
          </p>
          <button
            type="button"
            className="mt-4 w-full py-2 bg-primary text-white text-xs font-bold rounded-lg uppercase tracking-widest hover:bg-primary-container transition-colors"
          >
            Confirm result
          </button>
        </div>
      </div>
    </section>
  );
}
