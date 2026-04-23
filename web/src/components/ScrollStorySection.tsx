'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import {
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import {
  exclusiveStageWeights,
  STORY_STAGE_COUNT,
} from '@/components/scrollStoryStages';

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

export function ScrollStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // One ref per stage panel and dot — we push styles imperatively every time
  // scrollYProgress changes, avoiding framer-motion ref wiring on each node.
  const panelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null, null]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Paint once on mount so the first frame isn't fully opaque/stacked.
  useEffect(() => {
    paint(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (p) => paint(p));

  function paint(p: number) {
    const w = exclusiveStageWeights(p);
    for (let i = 0; i < STORY_STAGE_COUNT; i++) {
      const a = w[i];
      const panel = panelRefs.current[i];
      if (panel) {
        panel.style.opacity = String(a);
        const y = (1 - a) * 12;
        panel.style.transform = `translate3d(0, ${y}px, 0)`;
        panel.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
        panel.style.zIndex = a > 0.5 ? '2' : '0';
        panel.style.visibility = a < 0.02 ? 'hidden' : 'visible';
      }
      const dot = dotRefs.current[i];
      if (dot) dot.style.opacity = String(a);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '480vh' }}
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

          {/* Text stack — four stages, each painted imperatively on scroll */}
          <div className="relative h-[55vh] lg:h-[70vh]">
            {STAGES.map((stage, i) => (
              <div
                key={stage.eyebrow}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-center will-change-[opacity,transform]"
                style={{ opacity: 0 }}
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
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots — each lights up with its stage */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {STAGES.map((stage, i) => (
            <div key={stage.eyebrow} className="relative h-1.5 w-10 rounded-full bg-white/15">
              <span
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="absolute inset-0 rounded-full will-change-[opacity]"
                style={{ backgroundColor: stage.accent, opacity: 0 }}
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
