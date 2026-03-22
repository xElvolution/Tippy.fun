export default function SettingsWalletsPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold px-2">Web3 infrastructure</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_rgba(17,28,45,0.04)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary-fixed p-3 rounded-lg">
              <span className="material-symbols-outlined text-on-primary-fixed-variant">payments</span>
            </div>
            <span className="bg-tertiary-container/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold">PRIMARY PAYOUT</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Main rewards</h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            All campaign earnings are automatically routed to this address.
          </p>
          <div className="bg-surface-container-low px-4 py-3 rounded-lg font-mono text-sm text-on-surface flex justify-between items-center group">
            <span>0x71C...492E</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary cursor-pointer transition-colors">content_copy</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_rgba(17,28,45,0.04)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-secondary-container p-3 rounded-lg">
              <span className="material-symbols-outlined text-secondary">terminal</span>
            </div>
            <span className="bg-surface-dim/30 text-secondary px-3 py-1 rounded-full text-xs font-bold">CONNECTED</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Operator node</h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            The active wallet signing transactions for campaign execution.
          </p>
          <div className="bg-surface-container-low px-4 py-3 rounded-lg font-mono text-sm text-on-surface flex justify-between items-center group">
            <span>0x99A...11BC</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary cursor-pointer transition-colors">sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}
