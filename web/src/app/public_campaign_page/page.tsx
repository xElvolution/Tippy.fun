import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { PUBLIC_CAMPAIGNS } from '@/lib/publicCampaigns';
import { ExploreBountiesGrid } from './ExploreBountiesGrid';

export default function PublicCampaignExplorePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-12 lg:px-12 xl:px-14">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm text-on-surface-variant">
              Want to create a campaign?{' '}
              <Link href="/account_settings" className="font-semibold text-primary hover:underline">
                Create account
              </Link>
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              Explore bounties
            </h1>
            <p className="mt-3 max-w-xl text-base text-on-surface-variant">
              Funded challenges on Discord and Telegram. Open a campaign for prize pool, timeline, and rules — then join in
              one click.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create_campaign_wizard"
              className="primary-gradient inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-opacity hover:opacity-95"
            >
              Create a campaign
            </Link>
            <Link
              href="/how_judging_works"
              className="inline-flex items-center justify-center rounded-xl border-2 border-outline-variant/40 bg-surface-container-lowest px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:border-primary/35 hover:bg-surface-container-high dark:border-outline-variant/50 dark:bg-surface-container-low"
            >
              How it works
            </Link>
          </div>
        </div>

        <ExploreBountiesGrid campaigns={PUBLIC_CAMPAIGNS} />
      </main>
      <SiteFooter />
    </>
  );
}
