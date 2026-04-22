'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PUBLIC_CAMPAIGNS } from '@/lib/publicCampaigns';

export function LandingHeroVisual() {
  const image = useMemo(() => {
    const pool = PUBLIC_CAMPAIGNS;
    if (pool.length === 0) {
      return {
        src: '',
        alt: 'Tippy campaign',
        title: 'Campaign preview',
        prize: '—',
      };
    }
    const idx = Math.floor((Date.now() / 60_000) % pool.length);
    const pick = pool[idx];
    return {
      src: pick.imageSrc,
      alt: pick.imageAlt,
      title: pick.title,
      prize: pick.prizeShort,
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative z-10 overflow-hidden rounded-[2rem] shadow-[0_40px_80px_rgba(107,56,212,0.18)] aspect-[5/6] sm:aspect-[4/5] lg:aspect-auto lg:h-[540px]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
            Live on Conflux eSpace
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
            Tippy.Fun
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-5 bottom-5"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">
            Featured campaign
          </p>
          <h3 className="mt-1 font-headline text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {image.title}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 shadow">
              {image.prize}
            </span>
            <span className="text-[11px] font-semibold text-white/85">
              AI-judged · On-chain payout
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-4 bottom-8 z-20 hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-xl sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-container/70 text-on-tertiary-container">
            <span className="material-symbols-outlined text-lg">verified</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Verified payout
            </p>
            <p className="font-headline text-sm font-extrabold text-on-surface">
              Arbiter hash on-chain
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-3 top-10 z-20 hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-xl md:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              3 + 1 judges
            </p>
            <p className="font-headline text-sm font-extrabold text-on-surface">AI scoring</p>
          </div>
        </div>
      </motion.div>

      <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-tertiary/10 blur-3xl" />
    </div>
  );
}
