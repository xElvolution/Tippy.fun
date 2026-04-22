import Link from 'next/link';
import { Suspense } from 'react';
import { PayWinnerForm } from '@/components/PayWinnerForm';

export default function CampaignPayoutPage() {
  return (
    <div className="space-y-12">
      <Suspense fallback={<div className="text-on-surface-variant text-sm">Loading payout…</div>}>
        <PayWinnerForm />
      </Suspense>
      <div className="max-w-3xl rounded-xl border border-outline-variant/25 bg-surface-container-low px-5 py-4 text-sm text-on-surface-variant leading-relaxed space-y-3">
        <p>
          <strong className="text-on-surface">Participants usually claim rewards in the app where the campaign runs.</strong> Open the campaign in{' '}
          <strong className="text-on-surface">Telegram</strong> or <strong className="text-on-surface">Discord</strong> and follow the bot flow there. This web view is
          mainly for organizers and for linking a payout wallet when you use both channels.
        </p>
        <p>
          <strong className="text-on-surface">Organizers</strong> run batch payouts from a live campaign. Use{' '}
          <Link href="/campaign/judging" className="font-semibold text-primary hover:underline">
            Judging
          </Link>{' '}
          for scores, then return to{' '}
          <Link href="/operator_dashboard" className="font-semibold text-primary hover:underline">
            Campaigns
          </Link>{' '}
          for the list.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-[0_20px_40px_rgba(17,28,45,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10">
              <span className="text-primary font-semibold tracking-wider text-sm font-headline">AVAILABLE TO CLAIM</span>
              <div className="mt-4 flex items-baseline gap-3">
                <h2 className="text-6xl font-extrabold font-headline tracking-tight text-on-surface">1.428</h2>
                <span className="text-3xl font-bold text-primary">ETH</span>
              </div>
              <p className="mt-4 text-on-surface-variant max-w-md leading-relaxed">
                If you joined via Telegram or Discord, claim there first. Bots guide most winners. Use the wallet fields below when you need to register an on-chain
                address for settlement.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  className="min-h-[56px] px-10 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-[0_10px_25px_rgba(107,56,212,0.3)] hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  Claim now
                </button>
                <button
                  type="button"
                  className="min-h-[56px] px-8 bg-surface-container-highest text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Auto-claim
                </button>
              </div>
            </div>
          </section>
          <section className="bg-surface-container-low rounded-[2rem] p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
                <span className="material-symbols-outlined">link</span>
              </div>
              <div>
                <h2 className="text-xl font-bold font-headline">Recipient address</h2>
                <p className="text-sm text-on-surface-variant">Where should we send your earnings?</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2 px-1" htmlFor="wallet-address">
                Ethereum wallet address
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">search</span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface rounded-xl border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary outline-none font-mono text-sm transition-all"
                    id="wallet-address"
                    placeholder="0x..."
                    type="text"
                  />
                </div>
                <button
                  type="button"
                  className="px-8 py-4 bg-on-background text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Update wallet
                </button>
              </div>
              <p className="mt-4 text-xs text-on-surface-variant flex items-center gap-2 px-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Changing your wallet requires a 24-hour security lock for withdrawals.
              </p>
            </div>
          </section>
        </div>
        <div className="lg:col-span-5 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tertiary-container text-on-tertiary-container p-6 rounded-[1.5rem] flex flex-col justify-between h-40">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total received</span>
              <div>
                <div className="text-3xl font-extrabold font-headline">12.84</div>
                <div className="text-sm font-medium">ETH all-time</div>
              </div>
            </div>
            <div className="bg-surface-container-highest p-6 rounded-[1.5rem] flex flex-col justify-between h-40">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tippers</span>
              <div>
                <div className="text-3xl font-extrabold font-headline">1,402</div>
                <div className="text-sm font-medium text-on-surface-variant">Unique supporters</div>
              </div>
            </div>
          </div>
          <section className="bg-surface-container-low rounded-[2rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold font-headline">Recent tips</h2>
              <button type="button" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="group bg-surface-container-lowest p-5 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface overflow-hidden">
                    <img
                      alt=""
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdbyKewX9GBV3G2guxUCpMN0AgkZk6ljvht22traztaA97FcL9tV9pC3hnPjxM4076dOR6fsVBNECj9XbYkNgBFN91D9H5usMwoM37QhKYKqBAyYOI_WtoEvYF-8wVeklNyf5kZtGC6blHAXm8C9cB6RVAmff88oClYV1GZXrugtSEQbCxOprcNaY4OyHGeHBLfqq0hPba5imlsJdJwwn4eZi9M53HAGSxoTIWBrTBU0ymKQqedR0nURhZNu-cbSnvhKC5FpNerQDS"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Alex.eth</div>
                    <div className="text-xs text-on-surface-variant">2 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-tertiary font-headline">+0.05 ETH</div>
                  <a
                    className="text-[10px] font-bold text-primary flex items-center justify-end gap-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                    href="/"
                  >
                    Etherscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>
              <div className="group bg-surface-container-lowest p-5 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface overflow-hidden">
                    <img
                      alt=""
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAlEc8s6CLtzI58P0Br0SiWiBGZoQi1BY1xtG65kidMa662vsnZsO5zoDTkYIxr-zTqK9ZryMvjYcRN1WOLTIWwyH2502BVenbs2e91xxQeytRvuy0PX_I21Y2nD2zU4jyKh360C6_7iAEgBUZL01XIKFcm5CeU3HTEt2rUQsMTpxTDWnNtg9D-hBgQlUFeeXguqm-KwjGvxPZviyLrTD0BdEgsRJMTqKlg13fq4CgoqRVwS0SGAC-_yVNgxj_Qv-qKAlRi_Ne-4Qt"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Sarah Bloom</div>
                    <div className="text-xs text-on-surface-variant">5 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-tertiary font-headline">+0.12 ETH</div>
                  <a
                    className="text-[10px] font-bold text-primary flex items-center justify-end gap-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                    href="/"
                  >
                    Etherscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>
              <div className="group bg-surface-container-lowest p-5 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Anonymous</div>
                    <div className="text-xs text-on-surface-variant">Yesterday</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-tertiary font-headline">+0.01 ETH</div>
                  <a
                    className="text-[10px] font-bold text-primary flex items-center justify-end gap-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                    href="/"
                  >
                    Etherscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Leaderboard &amp; payouts</h2>
            <p className="text-on-surface-variant text-sm">Campaign phase: Distribution</p>
          </div>
          <button
            type="button"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold editorial-shadow active:scale-95 transition-all w-fit"
          >
            Release remaining payouts
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <div className="text-4xl font-black text-primary/10">#1</div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-4 overflow-hidden">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9AZ5ZLWn0P5xGwlNaKNrvgJgW8VzZmzOoHGA4yah9ZTDo_pS1LVGSIPO5JFS2YEU9uUgP1f_yvonPvWic3r-UIJ7gfWcc--xYIWgbCIVJRSp9NVwzrbmR4cl3ZjUyM0Lkao54uJsQpSWhh6sM5c0h_Oy3JyY7sT4vgQJ0tcWsNc-HvQDK5Ovqh5To04OW9DcfEP8aPX73gVnyRqYMOL-EonYutJW0LgF8YGbYZpsYGZAyfqnLoqrybssElHwaKGUiMAxnjg_3MLFa"
                />
              </div>
              <div>
                <div className="font-bold text-lg text-on-surface">@cryptowizard</div>
                <div className="text-xs text-on-surface-variant font-medium">Score: 94.5/100</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Payout amount</span>
                <span className="font-bold text-on-surface">15,000 USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Status</span>
                <span className="flex items-center gap-1.5 text-tertiary font-bold">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  Sent
                </span>
              </div>
              <div className="pt-2">
                <a
                  className="text-[10px] font-mono bg-surface-container-low px-3 py-2 rounded-lg block text-primary hover:bg-surface-container text-center transition-colors"
                  href="/"
                >
                  TX: 0x8a2f...3b11
                </a>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="text-4xl font-black text-on-surface-variant/10">#2</div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full ring-2 ring-surface-container-high ring-offset-4 overflow-hidden">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgScOLnpaR84b9Nb3HNMWOac7YAjhgGWJYRUA9bOjXrp2LStVAmLHLV-8Cv0a2fZsvzSLw-GBU4t3FOl15tbAuhA_I94-5QAvlJF2CEZhkbeK8WfK_Rf64rwqJDz8bDHw--YW_M08jj8hJg1Uur-LnqkEPCA2w7v3QBsHzfgOMs-ZIFz_S_MGzM1rS6n9woRuhFFFH_yWRDNimV5Zx6_7vkUvmxf_pn49Wea9K74XFkhQ4lcEVzHi2fzUOH5NN4xf-HOIEDynxMlx-"
                />
              </div>
              <div>
                <div className="font-bold text-lg text-on-surface">@sol_surfer</div>
                <div className="text-xs text-on-surface-variant font-medium">Score: 89.2/100</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Payout amount</span>
                <span className="font-bold text-on-surface">10,000 USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Status</span>
                <span className="flex items-center gap-1.5 text-on-secondary-container font-bold">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Pending
                </span>
              </div>
              <div className="pt-2">
                <div className="text-[10px] font-mono bg-surface-container-low/50 px-3 py-2 rounded-lg text-on-surface-variant text-center italic">
                  Awaiting confirmation...
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="text-4xl font-black text-on-surface-variant/10">#3</div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full ring-2 ring-surface-container-high ring-offset-4 overflow-hidden">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIJfmRNrfBZGBShCw4QkSV6P97xgetRR_iXfC0bObyP_1pojXQw0r2kzU4JEb3cFhxuhj5KJlgN0vV3ysUAMXsH0WoMYkJH6NCi78IuX4p8V1dOEXT08JLWQlDe_0uqmE7-OYP5cllMHvpLIJ7yrcfo7DipX3zyGPSLwaTGweV19GJCwQKRhqIMVdRnjnOYGoTDRPA2zG_Tv9ENlc09k-7l6ZFy5UxlmryVUlcJuKJKeypcVB1NuuYlNwf5C5NBqsTfxsb9NR-hH-U"
                />
              </div>
              <div>
                <div className="font-bold text-lg text-on-surface">@nft_collector</div>
                <div className="text-xs text-on-surface-variant font-medium">Score: 82.1/100</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Payout amount</span>
                <span className="font-bold text-on-surface">5,000 USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Status</span>
                <span className="flex items-center gap-1.5 text-error font-bold">
                  <span className="material-symbols-outlined text-sm">error</span>
                  Failed
                </span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full text-[10px] font-bold bg-error-container text-on-error-container px-3 py-2 rounded-lg hover:brightness-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xs">refresh</span> Retry payout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
