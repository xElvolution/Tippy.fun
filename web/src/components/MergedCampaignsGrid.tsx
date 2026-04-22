'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatUnits } from 'viem';
import { useRecentCampaigns } from '@/hooks/useTippyCampaigns';
import { getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';
import { PUBLIC_CAMPAIGNS, type PublicCampaign } from '@/lib/publicCampaigns';

type Card = {
  key: string;
  href: string;
  title: string;
  description: string;
  imageSrc: string;
  status: 'live' | 'ended';
  eyebrow: string;
  prizeLabel: string;
  meta: string;
  tags: string[];
};

const FALLBACK_IMAGES: string[] = PUBLIC_CAMPAIGNS.map((c) => c.imageSrc);

function cardFromPublic(c: PublicCampaign): Card {
  return {
    key: `mock-${c.slug}`,
    href: `/public_campaign_page/${c.slug}`,
    title: c.title,
    description: c.shortDescription,
    imageSrc: c.imageSrc,
    status: 'ended',
    eyebrow: c.organizer.name,
    prizeLabel: c.prizeShort,
    meta: `${c.submissionsCount} submissions`,
    tags: c.tags.slice(0, 3),
  };
}

export function MergedCampaignsGrid({ limit = 12 }: { limit?: number }) {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const { data: onChain, isLoading } = useRecentCampaigns(configured ? limit : 0);

  const cards = useMemo<Card[]>(() => {
    const live: Card[] = (onChain ?? []).map((c, idx) => {
      const title = c.metadata?.title ?? `Campaign #${c.id.toString()}`;
      const description =
        c.metadata?.description ??
        'On-chain bounty / tip campaign on Conflux eSpace via TippyMaker.';
      const symbol = c.tokenInfo?.key ?? chain.nativeCurrency.symbol;
      const decimals = c.tokenInfo?.decimals ?? 18;
      const modeLabel = Number(c.mode) === MODE_BOUNTY ? 'Bounty' : 'Tip jar';
      const imageSrc =
        c.metadata?.image ?? FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0];
      return {
        key: `onchain-${c.id.toString()}`,
        href: `/campaign/overview?id=${c.id.toString()}`,
        title,
        description,
        imageSrc,
        status: 'live',
        eyebrow: `#${c.id.toString()} · ${modeLabel}`,
        prizeLabel: `${formatUnits(c.prizePool, decimals)} ${symbol}`,
        meta: `by ${shortAddress(c.organizer)}`,
        tags: (c.metadata?.tags ?? []).slice(0, 3),
      };
    });
    const ended = PUBLIC_CAMPAIGNS.map(cardFromPublic);
    return [...live, ...ended];
  }, [onChain, chain.name, chain.nativeCurrency.symbol]);

  if (isLoading && cards.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-[320px] animate-pulse rounded-2xl bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
        >
          <MergedCard card={c} />
        </motion.div>
      ))}
    </div>
  );
}

function MergedCard({ card }: { card: Card }) {
  return (
    <Link
      href={card.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={card.imageSrc}
          alt={card.title}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            card.status === 'ended' ? 'grayscale-[15%]' : ''
          }`}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur ${
            card.status === 'live'
              ? 'bg-tertiary-container/90 text-on-tertiary-container'
              : 'bg-black/70 text-white'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              card.status === 'live' ? 'bg-tertiary animate-pulse' : 'bg-white/80'
            }`}
          />
          {card.status === 'live' ? 'Live' : 'Ended'}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow">
          {card.prizeLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {card.eyebrow}
        </p>
        <h3 className="mt-1 font-headline text-lg font-extrabold text-on-surface line-clamp-1">
          {card.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-on-surface-variant">
          {card.description}
        </p>
        {card.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="truncate">{card.meta}</span>
          <span className="font-semibold text-primary transition-transform group-hover:translate-x-0.5">
            {card.status === 'live' ? 'View campaign →' : 'View showcase →'}
          </span>
        </div>
      </div>
    </Link>
  );
}
