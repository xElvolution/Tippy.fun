import Link from 'next/link';
import type { PublicCampaign } from '@/lib/publicCampaigns';

type Props = Pick<
  PublicCampaign,
  'slug' | 'imageSrc' | 'imageAlt' | 'timeLeft' | 'title' | 'shortDescription' | 'prizeShort' | 'organizer' | 'submissionsCount'
>;

export function ExploreBountyCard(c: Props) {
  const href = `/public_campaign_page/${c.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-outline-variant/25 dark:bg-surface-container-low/50"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-container-high">
        <img src={c.imageSrc} alt={c.imageAlt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/90 text-sm font-bold text-on-surface shadow-sm dark:border-white/10 dark:bg-surface-container-highest/95 dark:text-on-surface">
          {c.organizer.abbr}
        </div>
        <div className="absolute right-3 top-3 max-w-[min(100%,11rem)] rounded-full bg-tertiary-container px-2.5 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-on-tertiary-container shadow-sm">
          Ongoing · {c.timeLeft}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm dark:bg-black/65">
          {c.submissionsCount} joined
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-headline text-base font-bold text-on-surface sm:text-lg">{c.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{c.shortDescription}</p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-outline-variant/15 pt-3 dark:border-outline-variant/25">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Prize pool</p>
            <p className="text-sm font-bold text-primary sm:text-base">{c.prizeShort}</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary">
            View
            <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5" aria-hidden>
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
