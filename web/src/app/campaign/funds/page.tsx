export default function CampaignFundsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-headline text-on-surface mb-2">Funds &amp; ledger</h2>
        <p className="text-on-surface-variant max-w-xl body-md leading-relaxed">
          <strong className="text-on-surface">Inflows, outflows, and audit trail</strong> for this campaign pool. Verifiable on-chain.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full md:w-auto md:max-w-md">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(17,28,45,0.06)] min-w-0">
          <p className="text-on-surface-variant text-sm font-medium mb-1">Total treasury</p>
          <p className="text-2xl font-bold font-headline text-primary">12.45 ETH</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(17,28,45,0.06)] min-w-0">
          <p className="text-on-surface-variant text-sm font-medium mb-1">Distributed</p>
          <p className="text-2xl font-bold font-headline text-tertiary-container">4.20 ETH</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="bg-surface-container-high px-6 py-4">
              <h3 className="font-headline font-bold text-on-surface">Transaction ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-wider bg-surface-container-low/50">
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold text-sm">Winner Payout #04</span>
                        <span className="text-on-surface-variant text-xs">Aug 24, 2024 • 14:22</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded-md font-bold">Distribution</span>
                    </td>
                    <td className="px-6 py-5 text-right font-headline font-bold text-on-surface">- 1.50 ETH</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="bg-tertiary-container text-on-tertiary-container text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Success
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <a className="text-primary hover:underline flex items-center justify-end gap-1 text-sm font-medium" href="/">
                        Explorer
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold text-sm">Sponsor Deposit</span>
                        <span className="text-on-surface-variant text-xs">Aug 22, 2024 • 09:15</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md font-bold">Deposit</span>
                    </td>
                    <td className="px-6 py-5 text-right font-headline font-bold text-tertiary-container">+ 10.0 ETH</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="bg-tertiary-container text-on-tertiary-container text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Success
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <a className="text-primary hover:underline flex items-center justify-end gap-1 text-sm font-medium" href="/">
                        Explorer
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold text-sm">Judge Fee: 0x8a...4b</span>
                        <span className="text-on-surface-variant text-xs">Aug 24, 2024 • 16:45</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md font-bold">Judge Fee</span>
                    </td>
                    <td className="px-6 py-5 text-right font-headline font-bold text-on-surface">- 0.05 ETH</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          Pending
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <a className="text-primary hover:underline flex items-center justify-end gap-1 text-sm font-medium" href="/">
                        Explorer
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold text-sm">Reward Distribution</span>
                        <span className="text-on-surface-variant text-xs">Aug 21, 2024 • 11:30</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded-md font-bold">Distribution</span>
                    </td>
                    <td className="px-6 py-5 text-right font-headline font-bold text-on-surface-variant line-through">- 2.00 ETH</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="bg-error-container text-on-error-container text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">error</span>
                          Failed
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        className="text-primary hover:bg-primary/5 px-3 py-1 rounded-lg text-sm font-bold border border-primary/20 transition-all active:scale-95"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <h4 className="text-xl font-bold font-headline text-on-surface">Escrow details</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              This campaign utilizes a multi-sig escrow contract. All distributions require consensus from assigned judges.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Contract address</span>
                <span className="font-mono text-primary cursor-pointer hover:underline">0x4F...d92E</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Active judges</span>
                <span className="font-bold">3 of 5 required</span>
              </div>
            </div>
          </div>
          <div className="bg-primary p-1 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90" />
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[10px] p-6">
              <h4 className="text-lg font-bold font-headline mb-4">Payout health</h4>
              <div className="flex items-end gap-1 h-24 mb-4">
                <div className="w-full bg-primary/20 rounded-t-md h-[40%]" />
                <div className="w-full bg-primary/40 rounded-t-md h-[60%]" />
                <div className="w-full bg-primary/60 rounded-t-md h-[55%]" />
                <div className="w-full bg-primary rounded-t-md h-[90%]" />
                <div className="w-full bg-primary/80 rounded-t-md h-[70%]" />
                <div className="w-full bg-primary/50 rounded-t-md h-[45%]" />
              </div>
              <p className="text-xs text-on-surface-variant italic">
                Aggregated payout volume over the last 30 days. Payouts are healthy and scaling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
