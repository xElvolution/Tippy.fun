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
      'Escrow lives in a smart contract on Conflux. No admin keys, no custodian. Your funds move only to winners, back to you, or via an explicit on-chain claim.',
    accent: '#3ec28f',
  },
  {
    eyebrow: '02 · Engage',
    title: 'Creators compete inside Discord and Telegram',
    copy:
      'Submissions and tips flow through the Tippy bot. Every interaction is stamped with the creator identity that will eventually claim payout.',
    accent: '#8fe4ff',
  },
  {
    eyebrow: '03 · Judge',
    title: 'Three AI judges + one arbiter score every entry',
    copy:
      'Each judge persona scores independently. A higher-tier arbiter aggregates and signs a verdict hash, giving you a verifiable record of why each winner was chosen.',
    accent: '#ff3df5',
  },
  {
    eyebrow: '04 · Pay out',
    title: 'The chain settles winners in the same block',
    copy:
      'TippyMaker.sol reads the arbiter verdict hash, releases escrow to winners, and emits an on-chain event you can audit from any explorer.',
    accent: '#f5c451',
  },
];

// Anchor centers in scroll-progress space — quarters of the section.
const ANCHORS = [0.125, 0.375, 0.625, 0.875] as const;
// Plateau half-width and fade half-width together define how long a stage is "held" at full opacity vs. cross-fading.
const PLATEAU = 0.04;
const FADE = 0.08;

function stageWindow(anchor: number) {
  // [outStart, plateauStart, plateauEnd, outEnd]
  return [
    anchor - PLATEAU - FADE,
    anchor - PLATEAU,
    anchor + PLATEAU,
    anchor + PLATEAU + FADE,
  ] as const;
}

export function ScrollStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Build one opacity MotionValue per stage. useTransform must be called at the
  // top level, so we call it explicitly four times instead of in a map.
  const w1 = stageWindow(ANCHORS[0]);
  const w2 = stageWindow(ANCHORS[1]);
  const w3 = stageWindow(ANCHORS[2]);
  const w4 = stageWindow(ANCHORS[3]);

  const opacity1 = useTransform(
    scrollYProgress,
    [w1[0], w1[1], w1[2], w1[3]],
    [0, 1, 1, 0],
  );
  const opacity2 = useTransform(
    scrollYProgress,
    [w2[0], w2[1], w2[2], w2[3]],
    [0, 1, 1, 0],
  );
  const opacity3 = useTransform(
    scrollYProgress,
    [w3[0], w3[1], w3[2], w3[3]],
    [0, 1, 1, 0],
  );
  const opacity4 = useTransform(
    scrollYProgress,
    [w4[0], w4[1], w4[2], w4[3]],
    [0, 1, 1, 0],
  );

  const y1 = useTransform(scrollYProgress, [w1[0], w1[1], w1[2], w1[3]], [30, 0, 0, -30]);
  const y2 = useTransform(scrollYProgress, [w2[0], w2[1], w2[2], w2[3]], [30, 0, 0, -30]);
  const y3 = useTransform(scrollYProgress, [w3[0], w3[1], w3[2], w3[3]], [30, 0, 0, -30]);
  const y4 = useTransform(scrollYProgress, [w4[0], w4[1], w4[2], w4[3]], [30, 0, 0, -30]);

  const opacities = [opacity1, opacity2, opacity3, opacity4];
  const ys = [y1, y2, y3, y4];

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '360vh' }}
      aria-label="How Tippy works"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_#1b1030_0%,_#07050f_55%,_#050309_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:52px_52px]" />

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

          {/* Text stack — four stages cross-fade via opacity */}
          <div className="relative h-[55vh] lg:h-[70vh]">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.eyebrow}
                style={{ opacity: opacities[i], y: ys[i] }}
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

        {/* Progress dots — each lights up with its stage */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {STAGES.map((stage, i) => (
            <div key={stage.eyebrow} className="relative h-1.5 w-10 rounded-full bg-white/15">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: stage.accent, opacity: opacities[i] }}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          Scroll
        </div>
      </div>
    </section>
  );
}
