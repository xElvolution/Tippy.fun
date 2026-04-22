'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatUnits } from 'viem';
import { useRecentCampaigns } from '@/hooks/useTippyCampaigns';
import { getActiveChain } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';
import { PUBLIC_CAMPAIGNS, type PublicCampaign } from '@/lib/publicCampaigns';

type BannerSlide = {
  key: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  prizeLabel: string;
  tagLine: string;
  imageSrc: string;
  status: 'live' | 'ended';
  tags: string[];
};

const AUTO_ADVANCE_MS = 5500;

const MOCK_IMAGES: string[] = PUBLIC_CAMPAIGNS.map((c) => c.imageSrc);

function slideFromPublic(c: PublicCampaign): BannerSlide {
  return {
    key: `mock-${c.slug}`,
    href: `/public_campaign_page/${c.slug}`,
    eyebrow: `${c.organizer.name} · Showcase`,
    title: c.title,
    description: c.longDescription,
    prizeLabel: c.prizeShort,
    tagLine: `${c.submissionsCount} submissions`,
    imageSrc: c.imageSrc,
    status: 'ended',
    tags: c.tags,
  };
}

export function BountyBannerCarousel({ limit = 6 }: { limit?: number }) {
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const { data: onChain, isLoading } = useRecentCampaigns(configured ? limit : 0);

  const slides = useMemo<BannerSlide[]>(() => {
    const live: BannerSlide[] = (onChain ?? []).map((c, idx) => {
      const title = c.metadata?.title ?? `Campaign #${c.id.toString()}`;
      const description =
        c.metadata?.description ??
        'On-chain bounty on Conflux eSpace. Funded through TippyMaker.';
      const symbol = c.tokenInfo?.key ?? chain.nativeCurrency.symbol;
      const decimals = c.tokenInfo?.decimals ?? 18;
      const modeLabel = Number(c.mode) === MODE_BOUNTY ? 'Bounty' : 'Tip jar';
      const imageSrc =
        c.metadata?.image ?? MOCK_IMAGES[idx % MOCK_IMAGES.length] ?? MOCK_IMAGES[0];
      return {
        key: `onchain-${c.id.toString()}`,
        href: `/campaign/overview?id=${c.id.toString()}`,
        eyebrow: `Live on ${chain.name} · ${modeLabel}`,
        title,
        description,
        prizeLabel: `${formatUnits(c.prizePool, decimals)} ${symbol}`,
        tagLine: c.finalized ? 'Finalized' : 'Accepting submissions',
        imageSrc,
        status: 'live',
        tags: (c.metadata?.tags ?? []).slice(0, 3),
      };
    });
    const ended = PUBLIC_CAMPAIGNS.map(slideFromPublic);
    return [...live, ...ended];
  }, [onChain, chain.name, chain.nativeCurrency.symbol]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (total <= 1 || paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [total, paused]);

  useEffect(() => {
    if (index >= total && total > 0) setIndex(0);
  }, [index, total]);

  if (total === 0) {
    if (isLoading) {
      return (
        <div className="h-[360px] w-full animate-pulse rounded-[2rem] bg-surface-container-low" />
      );
    }
    return null;
  }

  const active = slides[Math.min(index, total - 1)];
  const go = (n: number) => setIndex(((n % total) + total) % total);

  return (
    <section
      className="relative isolate overflow-hidden rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured bounties"
    >
      <div className="relative h-[360px] sm:h-[400px] lg:h-[440px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={active.imageSrc}
              alt={active.title}
              fill
              priority
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active.key}-content`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur ${
                    active.status === 'live'
                      ? 'bg-tertiary-container/90 text-on-tertiary-container'
                      : 'bg-black/65 text-white'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active.status === 'live' ? 'bg-tertiary animate-pulse' : 'bg-white/80'
                    }`}
                  />
                  {active.status === 'live' ? 'Live now' : 'Ended'}
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur">
                  {active.eyebrow}
                </span>
              </div>
              <h2 className="mt-4 font-headline text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {active.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base line-clamp-3">
                {active.description}
              </p>
              {active.tags.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col-reverse items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous campaign"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next campaign"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <div className="ml-1 flex items-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => go(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active.key}-cta`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 sm:gap-5"
              >
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Prize pool
                  </p>
                  <p className="font-headline text-xl font-extrabold text-white sm:text-2xl">
                    {active.prizeLabel}
                  </p>
                  <p className="text-[11px] font-semibold text-white/70">{active.tagLine}</p>
                </div>
                <Link
                  href={active.href}
                  className="primary-gradient inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg shadow-primary/25 transition-opacity hover:opacity-95"
                >
                  {active.status === 'live' ? 'View campaign' : 'View showcase'}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
