import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/SiteFooter';
import { getPublicCampaign, PUBLIC_CAMPAIGNS } from '@/lib/publicCampaigns';
import { CampaignRulesBody } from '../CampaignRulesBody';
import { TipPanel } from '@/components/TipPanel';

export function generateStaticParams() {
  return PUBLIC_CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

export default async function PublicCampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getPublicCampaign(slug);
  if (!campaign) notFound();

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:px-12 xl:px-14">
        <div className="mb-6">
          <Link
            href="/public_campaign_page"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden>
              arrow_back
            </span>
            All bounties
          </Link>
        </div>

        <h1 className="font-headline mb-8 max-w-3xl text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          {campaign.title}
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-outline-variant/20 shadow-md dark:border-outline-variant/30">
              <div className="relative aspect-[21/9] min-h-[200px] w-full bg-surface-container-high sm:aspect-[2.4/1]">
                <img
                  src={campaign.imageSrc}
                  alt={campaign.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/90 text-sm font-bold text-on-surface shadow-md dark:bg-surface-container-highest/95">
                  {campaign.organizer.abbr}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-tertiary-container px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-on-tertiary-container shadow-md">
                  Ongoing · {campaign.timeLeft}
                </div>
              </div>
            </div>

            <div className="border-b border-outline-variant/25 dark:border-outline-variant/35">
              <span className="inline-block border-b-2 border-primary pb-3 text-sm font-bold text-primary">Details</span>
              <span className="ml-8 inline-block pb-3 text-sm font-semibold text-on-surface-variant">Submissions · demo</span>
            </div>

            <p className="text-base leading-relaxed text-on-surface-variant">{campaign.longDescription}</p>

            <div
              id="campaign-rules"
              className="scroll-mt-24 rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_20px_40px_rgba(17,28,45,0.06)] sm:p-8 md:p-10 dark:border-outline-variant/25 dark:bg-surface-container-low dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            >
              <h2 className="font-headline mb-8 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                <span className="material-symbols-outlined text-3xl text-primary sm:text-4xl">description</span>
                Campaign rules
              </h2>
              <CampaignRulesBody />
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-outline-variant/35 dark:bg-surface-container-low">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">Prize pool</p>
              <p className="mt-2 font-headline text-3xl font-extrabold text-primary sm:text-4xl">{campaign.prizePool.headline}</p>
              {campaign.prizePool.subline ? (
                <p className="mt-1 text-sm text-on-surface-variant">{campaign.prizePool.subline}</p>
              ) : null}
              <div className="mt-6 space-y-3 border-t border-outline-variant/20 pt-6 dark:border-outline-variant/35">
                {campaign.prizePool.breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">{row.label}</span>
                    <span className="font-bold text-on-surface">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-high/80 p-6 dark:border-outline-variant/35 dark:bg-surface-container-high/50">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">Event timeline</p>
              <div className="mt-3 inline-flex rounded-full bg-tertiary-container/20 px-3 py-1 text-xs font-bold text-tertiary dark:bg-tertiary-container/25 dark:text-on-tertiary-container">
                {campaign.statusLine}
              </div>
              <ul className="mt-6 space-y-4">
                {campaign.timeline.map((phase) => (
                  <li
                    key={phase.label}
                    className={`flex items-start justify-between gap-3 border-l-2 pl-3 text-sm ${
                      phase.active
                        ? 'border-primary font-medium text-on-surface'
                        : 'border-outline-variant/40 text-on-surface-variant'
                    }`}
                  >
                    <span>{phase.label}</span>
                    <span className="shrink-0 tabular-nums text-on-surface-variant">{phase.dateRight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-2 border-t border-outline-variant/25 pt-6 text-sm text-on-surface-variant dark:border-outline-variant/35">
                <span className="material-symbols-outlined text-primary" aria-hidden>
                  public
                </span>
                {campaign.location}
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 dark:border-outline-variant/30 dark:bg-surface-container-low">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">Bounty tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {campaign.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-outline-variant/20 pt-6 dark:border-outline-variant/35">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Organizer</p>
                  <p className="mt-0.5 font-semibold text-on-surface">{campaign.organizer.name}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-sm font-bold text-primary">
                  {campaign.organizer.abbr}
                </div>
              </div>
            </div>

            <div id="participate" className="scroll-mt-28 rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-outline-variant/35 dark:bg-surface-container-low">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Participate</h3>
              <TipPanel campaignId={null} demoLabel="Participate now" />
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant/20 py-5 sm:flex-row sm:gap-4 sm:py-4 dark:border-outline-variant/30">
              <div className="flex -space-x-3">
                <img
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-surface-container-lowest object-cover dark:border-surface-container-high"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtv7wN1yp0jIgJrJT469sJcpnnfwpS9aLCIlBkGmGQEvXLWphPcrT_aCVORCS0pVLJvBQ_qb3ep3_O-_ZqSh-0GxVfTzPGCs_70ZYRguboPkkNwYwSa-Hb_6TxtFTwXIyrWe17gtpM31gALLCVaDUlUNlvG2o6_ybOx7R23Lje15MQvRsu-GX9oZMMZB-JFqOsPz_6EUGkZi3Hzs0-hOetrGIMSyRh_zmQXdu7V3rNmAAckuJtqHv-hNDDhEryit3dAWEEWg0wbTJd"
                />
                <img
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-surface-container-lowest object-cover dark:border-surface-container-high"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAejaylfAorks15eIC1qEzqRUUl8ynkGOrNg8bGRVs1sSPkBFmXiE2lNu0nNFg0fojLD02E41RRbnqVKKv-U4y0uVfM1XaZ8PsYWNrBu0NWqcKZ9RHhbTh-ZmNZ5IwAluOEuW2l6UfCLCgehM6RQzIaJ2RXeTKfFRsaNaJFFeGOst7OUKe0QUoq6Oxju2OXbBM_SD9djZtY90flDc_HrV0Mi4jlvMgP698KDReoScraripV2hmZ1WBEMHahTcXt4wt972M0yxthGreW"
                />
                <img
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-surface-container-lowest object-cover dark:border-surface-container-high"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl_VfU26DDbm928JuzQ4gSV3LMk70EGN7k02_pjdH4OyXCLJpMtG4wiuZXsJTh2ntuqJHI9Hefdlpj2qVO0OMZosDhyeedXdTyAvc1xeBDHQu-SJhnw9PQ-x_bU3NP9ezDaR5C_ew6V_5EdBmOmsHHRkSgKoFQZUBkksyk8jKe6NM9vxJu_cGMSbWJc33lFsHBq5dXj7WKelofoPXzy2KeOUYVtn_0icen0i0f8cWmvBHhtkVOyvZ7c1VTB1U3cKfAr_RdR5jl_psY"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary-fixed text-[10px] font-bold text-primary dark:border-surface-container-high">
                  +
                  {campaign.submissionsCount >= 1000
                    ? `${Math.round(campaign.submissionsCount / 1000)}k`
                    : campaign.submissionsCount}
                </div>
              </div>
              <p className="text-sm font-medium text-on-surface-variant">Participants already joined</p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
