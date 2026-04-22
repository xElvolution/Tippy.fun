import Link from 'next/link';
import { FadeIn } from '@/components/animations';
import { SiteFooter } from '@/components/SiteFooter';
import { LandingHeroCta } from '@/components/LandingHeroCta';
import { LandingHeroVisual } from '@/components/LandingHeroVisual';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { MergedCampaignsGrid } from '@/components/MergedCampaignsGrid';
import { TippyBotCta } from '@/components/TippyBotCta';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-8 overflow-hidden">
        <FadeIn delay={0.1} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <span className="inline-block py-1 px-4 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-sm font-semibold mb-6">
              Non-custodial · AI judged · Conflux eSpace
            </span>
            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
              Launch Funded Campaigns <span className="text-primary">on Socials</span>
            </h1>
            <p className="text-body-md text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xl">
              Spin up a bounty or an always-on tip jar on Conflux in two clicks. Escrow is on-chain,
              judges are AI, and every payout is verifiable.
            </p>
            <LandingHeroCta />
            <div className="mt-12 flex items-center gap-6 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-tertiary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                Non-custodial
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-tertiary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  analytics
                </span>
                On-chain audit trail
              </div>
            </div>
          </div>

          <LandingHeroVisual />
        </FadeIn>
      </section>

      <HowItWorksSection />

      {/* Trust & Transparency */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <FadeIn className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-surface-container-low rounded-[2.5rem] p-12 flex flex-col justify-between overflow-hidden relative">
            <div>
              <h2 className="font-headline text-4xl font-extrabold mb-6 leading-tight">
                Verifiable by default
              </h2>
              <p className="text-on-surface-variant text-lg max-w-md">
                Funding, judging, and payouts all emit events from{' '}
                <span className="font-semibold">TippyMaker.sol</span>. The on-chain ledger is the
                source of truth. The site is just a view over it.
              </p>
            </div>
            <div className="mt-12 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  What gets written on-chain
                </span>
                <span className="text-xs text-tertiary font-bold px-2 py-0.5 bg-tertiary-container/10 rounded">
                  Immutable
                </span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 border-b border-surface pb-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="text-on-surface">Campaign config + metadata URI</span>
                </li>
                <li className="flex items-center gap-3 border-b border-surface pb-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="text-on-surface">Funding, tipping, winner settlement</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="text-on-surface">
                    Submission hash + AI arbiter verdict hash on every payout
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-inverse-surface text-inverse-on-surface rounded-[2rem] p-8 h-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">security</span>
                </div>
                <h4 className="font-headline text-xl font-bold">Non-custodial</h4>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                No admin key, no upgrade path. Funds move only to winners, back to the organizer,
                or via explicit on-chain claim.
              </p>
            </div>
            <div className="bg-primary-container text-on-primary-container rounded-[2rem] p-8 h-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h4 className="font-headline text-xl font-bold">3 + 1 AI judging</h4>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Three judge personas score every entry; an arbiter aggregates and signs the verdict
                hash that lands on-chain.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Live & past campaigns (on-chain + showcase) */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-14">
          <FadeIn>
            <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  On-chain + Showcase
                </p>
                <h2 className="mt-1 font-headline text-3xl font-extrabold text-on-surface sm:text-4xl">
                  Campaigns on Tippy
                </h2>
                <p className="mt-2 max-w-xl text-sm text-on-surface-variant sm:text-base">
                  Live cards stream straight from TippyMaker on Conflux eSpace. Ended showcases
                  below give you a feel for what operators run.
                </p>
              </div>
              <Link
                href="/public_campaign_page"
                className="text-primary font-bold inline-flex items-center gap-2 shrink-0 group hover:underline underline-offset-4 md:pb-0.5"
              >
                Explore all
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </FadeIn>
          <MergedCampaignsGrid limit={9} />
        </div>
      </section>

      <TippyBotCta />

      <SiteFooter />
    </>
  );
}
