'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion';

const ScrollStoryScene = dynamic(
  () => import('@/components/three/ScrollStoryScene').then((m) => m.ScrollStoryScene),
  { ssr: false, loading: () => null },
);

const STAGES = [
  {
    eyebrow: '01 · Fund',
    title: 'Lock a prize on Conflux eSpace',
    copy:
      'Escrow lives in a smart contract. No admin keys, no custodian. Your funds move only to winners, back to you, or via an explicit on-chain claim.',
    accent: '#6ffbbe',
  },
  {
    eyebrow: '02 · Engage',
    title: 'Creators compete inside Discord and Telegram',
    copy:
      'Submissions and tips flow through the Tippy bot. Every interaction is stamped with the creator identity that will eventually claim payout.',
    accent: '#8fe4ff',
  },
  {
    eyebrow: '03 · Pay out',
    title: 'AI judges sign, the chain settles',
    copy:
      'Three judge personas score every entry. An arbiter aggregates and signs the verdict hash; TippyMaker pays winners in the same block.',
    accent: '#ff3df5',
  },
];

export function ScrollStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Derive each stage's opacity from scroll progress so copy swaps in sync
  // with the 3D scene's object swaps. Same anchor points used in ScrollStoryScene.
  const stageOpacities = [
    useTransform(scrollYProgress, [0.0, 0.1, 0.28, 0.38], [1, 1, 0, 0]),
    useTransform(scrollYProgress, [0.33, 0.43, 0.6, 0.7], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.66, 0.76, 1, 1], [0, 1, 1, 1]),
  ];
  const stageY = [
    useTransform(scrollYProgress, [0.0, 0.28, 0.38], [0, 0, -30]),
    useTransform(scrollYProgress, [0.28, 0.43, 0.6, 0.7], [30, 0, 0, -30]),
    useTransform(scrollYProgress, [0.6, 0.76, 1], [30, 0, 0]),
  ];

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '280vh' }}
      aria-label="How Tippy works"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_#1b1030_0%,_#07050f_55%,_#050309_100%)]">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:52px_52px]" />

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#6b38d4]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[#ff3df5]/15 blur-3xl" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-12">
          {/* 3D stage */}
          <div className="relative h-[55vh] w-full lg:h-[70vh]">
            <ScrollStoryScene
              progress={scrollYProgress}
              reducedMotion={!!prefersReducedMotion}
            />
          </div>

          {/* Text stack — three stages stacked on top of each other, cross-faded via opacity */}
          <div className="relative h-[55vh] lg:h-[70vh]">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.eyebrow}
                style={{ opacity: stageOpacities[i], y: stageY[i] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <p
                  className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
                  style={{ color: stage.accent }}
                >
                  {stage.eyebrow}
                </p>
                <h2 className="font-headline text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                  {stage.title}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {stage.copy}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          Scroll
        </div>
      </div>
    </section>
  );
}
