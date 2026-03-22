export default function CampaignSubmissionsPage() {
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-headline text-on-surface">Submissions</h2>
        <p className="text-sm text-on-surface-variant max-w-2xl">Entries received for this campaign (demo data).</p>
        <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface-container-high text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <span className="col-span-4">Participant</span>
            <span className="col-span-4">Preview</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Score</span>
          </div>
          <div className="divide-y divide-outline-variant/10">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center">
              <span className="col-span-4 font-medium">@solar_doge</span>
              <span className="col-span-4 text-on-surface-variant truncate">&quot;The Solar Doge&quot;</span>
              <span className="col-span-2 text-tertiary font-semibold">In review</span>
              <span className="col-span-2 text-right font-headline font-bold">—</span>
            </div>
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center">
              <span className="col-span-4 font-medium">@meme_knight</span>
              <span className="col-span-4 text-on-surface-variant truncate">GIF / 4s loop</span>
              <span className="col-span-2 text-on-surface-variant">Queued</span>
              <span className="col-span-2 text-right font-headline font-bold">—</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-on-surface">Recent submissions</h2>
          <div className="flex gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary w-64 max-w-full"
                placeholder="Search handles..."
                type="text"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-xl text-sm font-semibold text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Participant</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Platform</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Submitted At</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Link</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcxCWE8TV_tXMDIguNqWLgcCM_st5K5hUBUgMJwF1L2lih8qxPGtMXMl5yy49BaR_BTrgucwnrEMBp9D0atXpkRj7FnPWbVJzn0kVm0vgOSCMZVUiuXPB_8fIlHvzyKGphHu99fVB2hI3lDj3OaEB9ZO2AyVhN22Z5TjGxZdQl3DlhF1VI_QZPR7xrAHewy-jf01-mAYm5fpNv6PZrrTpE39ZtqLeuqch5vJB20pwYowQYJjFVsbAQto5Y4AvQEC94u_Ov7LpLijcD"
                      />
                    </div>
                    <span className="font-semibold text-on-surface">@cryptowizard</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="material-symbols-outlined text-on-surface-variant">share</span>
                  <span className="text-sm ml-1 text-on-surface-variant">Twitter/X</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Oct 12, 14:32</td>
                <td className="px-6 py-5">
                  <a className="text-primary text-sm font-medium hover:underline flex items-center gap-1" href="/">
                    View Post <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full uppercase">
                    Eligible
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button type="button" className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6R4u3H5GID5_xI2NSsDzerVKPLq4rS-0cQzFKrkTYceWK2EQRqt342BhkQribrq2lkdPAYEgwp1jJBqPgqOvuRggA-ABS3UeBTqX-hyCTpaA9Yza3H18WLYXHEA22Vv3PGMTkxXSB0z2KUw5SWKaVMmuEi_Q5-2PBOvHwML5ShoXGj38hdLpa4jqZ81pyHDVo7CQvnoFg_cI5Iy4vYiuOdwHel7VNJzZ499qPhDPIimdDvlM3khOMfMmzp-FyArqQIBU13LeZHG5v"
                      />
                    </div>
                    <span className="font-semibold text-on-surface">@meme_lord</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
                  <span className="text-sm ml-1 text-on-surface-variant">Discord</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Oct 12, 15:10</td>
                <td className="px-6 py-5">
                  <a className="text-primary text-sm font-medium hover:underline flex items-center gap-1" href="/">
                    View Message <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded-full uppercase">
                    Flagged
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button type="button" className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuAIXcsL7Xe3ahIvcd_BU2VGJoJjBnEO4Kkcex07IOd1ZIJt2ugaMVWc3_vjXGTvJEWI4xpBWqn-NcKoB-pu5fBca9Dm5KUif2eNsG47usKg13gqebhf5kv8iyNVZ7qHUHyVGEXA_F0rX0x27QfaFE2ztIviRXEB8-JZDXzFn9fkiOnN3v0gfDLn850jwz6YXj42aRjUuiWNvzxz0mIPppuCeeU864QYVyn3JbFLhOT39kjd1eflswgJ8luF8amSAqt8fgtLYr812K"
                      />
                    </div>
                    <span className="font-semibold text-on-surface">@sol_surfer</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="material-symbols-outlined text-on-surface-variant">share</span>
                  <span className="text-sm ml-1 text-on-surface-variant">Twitter/X</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Oct 12, 16:45</td>
                <td className="px-6 py-5">
                  <a className="text-primary text-sm font-medium hover:underline flex items-center gap-1" href="/">
                    View Post <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full uppercase">
                    Eligible
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button type="button" className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
