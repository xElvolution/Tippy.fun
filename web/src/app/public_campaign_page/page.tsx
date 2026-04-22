import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { BountyBannerCarousel } from '@/components/BountyBannerCarousel';
import { MergedCampaignsGrid } from '@/components/MergedCampaignsGrid';

export default function PublicCampaignExplorePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-12 lg:px-12 xl:px-14">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm text-on-surface-variant">
              Want to run your own?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              Explore bounties
            </h1>
            <p className="mt-3 max-w-xl text-base text-on-surface-variant">
              Funded on-chain challenges on Conflux eSpace. Open any card for the prize pool,
              timeline, and submission rules.
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

        <section className="mb-12">
          <BountyBannerCarousel />
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                All campaigns
              </p>
              <h2 className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
                Live and past bounties
              </h2>
              <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
                On-chain campaigns surface first. Ended showcases below give you a feel for what
                operators run on Tippy.
              </p>
            </div>
          </div>
          <MergedCampaignsGrid limit={18} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
