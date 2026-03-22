import Link from 'next/link';

const linkClass =
  'text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline underline-offset-4';

export function SiteFooter() {
  return (
    <footer className="mt-20 w-full border-t border-outline-variant/20 bg-surface-container-lowest dark:border-outline-variant/30 dark:bg-surface-dim/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="font-headline text-xl font-bold text-on-surface">Tippy.Fun</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-surface-variant">
              Funded Web3 campaigns on Discord and Telegram. Non-custodial treasuries, AI judging, and transparent
              payouts.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface">Product</p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/public_campaign_page" className={linkClass}>
                  Active campaigns
                </Link>
              </li>
              <li>
                <Link href="/how_judging_works" className={linkClass}>
                  How judging works
                </Link>
              </li>
              <li>
                <Link href="/operator_dashboard" className={linkClass}>
                  Organizer dashboard
                </Link>
              </li>
              <li>
                <Link href="/create_campaign_wizard" className={linkClass}>
                  Create a campaign
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface">Integrations</p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/discord_bot_installation" className={linkClass}>
                  Discord bot
                </Link>
              </li>
              <li>
                <Link href="/telegram_bot_onboarding" className={linkClass}>
                  Telegram bot
                </Link>
              </li>
              <li>
                <Link href="/integrations_hub" className={linkClass}>
                  Integrations hub
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface">Account</p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/account_settings" className={linkClass}>
                  Account settings
                </Link>
              </li>
              <li>
                <Link href="/settings" className={linkClass}>
                  Preferences
                </Link>
              </li>
            </ul>
            <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-on-surface">Status</p>
            <p className="text-sm text-on-surface-variant">All systems operational</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-outline-variant/20 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-outline-variant/30">
          <p className="text-sm text-on-surface-variant">© {new Date().getFullYear()} Tippy.Fun. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant">
            <span className="text-on-surface-variant/70">Privacy &amp; terms — coming soon</span>
            <Link href="/" className={linkClass}>
              Home
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
