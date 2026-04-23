'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HeroScene = dynamic(
  () => import('@/components/three/HeroScene').then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => <HeroPoster />,
  },
);

export function LandingHeroVisual3D() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <div className="relative z-10 aspect-[5/6] w-full overflow-hidden rounded-[2rem] border border-white/5 bg-[radial-gradient(ellipse_at_top_right,_#2a1b4c_0%,_#0c0914_55%,_#050309_100%)] shadow-[0_40px_100px_-20px_rgba(107,56,212,0.35)] sm:aspect-[4/5] lg:aspect-auto lg:h-[560px]">
        {/* Decorative grid background — kept behind the Canvas, visible through transparency. */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]" />

        {/* Ambient neon wash */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#6b38d4]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-72 w-72 rounded-full bg-[#ff3df5]/25 blur-3xl" />

        {mounted ? (
          <HeroScene reducedMotion={!!prefersReducedMotion} />
        ) : (
          <HeroPoster />
        )}

        {/* Badge */}
        <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6ffbbe] animate-pulse" />
          Live on Conflux eSpace
        </div>
        <div className="pointer-events-none absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
          Tippy.Fun
        </div>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-5 bottom-5"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Meet Tippy
          </p>
          <h3 className="mt-1 font-headline text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            Your on-chain tip bot
          </h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 shadow">
              AI-judged payouts
            </span>
            <span className="text-[11px] font-semibold text-white/80">
              Non-custodial · Verifiable
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating cards around the scene, kept from the original layout. */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-4 bottom-8 z-20 hidden rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl backdrop-blur-md sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6ffbbe]/20 text-[#6ffbbe]">
            <span className="material-symbols-outlined text-lg">verified</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Verified payout
            </p>
            <p className="font-headline text-sm font-extrabold text-white">
              Arbiter hash on-chain
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-3 top-10 z-20 hidden rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl backdrop-blur-md md:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff3df5]/20 text-[#ff3df5]">
            <span className="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              3 + 1 judges
            </p>
            <p className="font-headline text-sm font-extrabold text-white">AI scoring</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Lightweight CSS-only hero shown before WebGL loads and as the
 * reduced-motion / no-JS fallback. Keeps layout stable during hydration.
 */
function HeroPoster() {
  return (
    <div
      aria-hidden
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 30%, #3b2368 0%, #1a1030 35%, #05030a 100%)',
      }}
    >
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-gradient-to-br from-[#6b38d4] to-[#2a1b4c] shadow-[0_30px_80px_rgba(107,56,212,0.45)]">
        <div className="absolute left-1/2 top-[28%] flex -translate-x-1/2 gap-6">
          <span className="h-3 w-3 rounded-full bg-[#6ffbbe] shadow-[0_0_18px_#6ffbbe]" />
          <span className="h-3 w-3 rounded-full bg-[#6ffbbe] shadow-[0_0_18px_#6ffbbe]" />
        </div>
        <div className="absolute left-1/2 top-[46%] h-1 w-10 -translate-x-1/2 rounded-full bg-[#6ffbbe] shadow-[0_0_14px_#6ffbbe]" />
      </div>
    </div>
  );
}
