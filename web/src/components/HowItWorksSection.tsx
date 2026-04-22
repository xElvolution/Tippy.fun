'use client';

import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations';

type Step = {
  number: string;
  title: string;
  icon: string;
  description: React.ReactNode;
  accent: 'primary' | 'tertiary' | 'secondary' | 'error';
  badge?: { icon: string; label: string };
};

const ACCENTS: Record<
  Step['accent'],
  {
    iconBg: string;
    iconText: string;
    ring: string;
    glow: string;
    badgeText: string;
    numberHover: string;
  }
> = {
  primary: {
    iconBg: 'bg-primary-container',
    iconText: 'text-on-primary-container',
    ring: 'ring-primary/25',
    glow: 'bg-primary/30',
    badgeText: 'text-primary',
    numberHover: 'group-hover:text-primary',
  },
  tertiary: {
    iconBg: 'bg-tertiary-container',
    iconText: 'text-on-tertiary-container',
    ring: 'ring-tertiary/25',
    glow: 'bg-tertiary/30',
    badgeText: 'text-tertiary',
    numberHover: 'group-hover:text-tertiary',
  },
  secondary: {
    iconBg: 'bg-secondary-container',
    iconText: 'text-on-secondary-container',
    ring: 'ring-secondary/25',
    glow: 'bg-secondary/25',
    badgeText: 'text-secondary',
    numberHover: 'group-hover:text-secondary',
  },
  error: {
    iconBg: 'bg-error-container',
    iconText: 'text-on-error-container',
    ring: 'ring-error/25',
    glow: 'bg-error/25',
    badgeText: 'text-error',
    numberHover: 'group-hover:text-error',
  },
};

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Create',
    icon: 'hub',
    accent: 'primary',
    description: (
      <>Pick Bounty or Tip mode, token (CFX / USDT0 / AxCNH), submission window, and the AI rubric.</>
    ),
  },
  {
    number: '02',
    title: 'Fund',
    icon: 'account_balance_wallet',
    accent: 'tertiary',
    description: (
      <>
        Seed the non-custodial escrow in <span className="font-semibold">TippyMaker.sol</span>.
        Funds only leave for winners or back to you.
      </>
    ),
    badge: { icon: 'lock', label: 'On-chain escrow' },
  },
  {
    number: '03',
    title: 'Submit',
    icon: 'send',
    accent: 'secondary',
    description: (
      <>
        Participants post work from the campaign page. Discord and Telegram bots coming soon. Every
        submission is keccak-hashed.
      </>
    ),
  },
  {
    number: '04',
    title: 'Judge & pay',
    icon: 'psychology',
    accent: 'error',
    description: (
      <>Three OpenAI judges plus an arbiter score every entry. The verdict hash is attached on-chain to every payout.</>
    ),
    badge: { icon: 'bolt', label: 'Verifiable payout' },
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-surface-container-low py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-64 w-[60%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-tertiary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-8">
        <FadeIn>
          <div className="mb-16 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              How it works
            </span>
            <h2 className="mt-4 font-headline text-4xl font-extrabold text-on-surface">
              From zero to verifiable payout in four steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant">
              Deploy, fund, collect submissions, and pay out, all on Conflux eSpace. Every step
              emits an on-chain event you (and judges) can audit.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <StepCard key={step.number} step={step} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const accent = ACCENTS[step.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="relative h-full overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
        <span
          className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`}
        />

        <div className="flex items-start justify-between">
          <div className="relative">
            <motion.div
              animate={{ boxShadow: [
                '0 0 0 0 rgba(107, 56, 212, 0.0)',
                '0 0 24px 6px rgba(107, 56, 212, 0.20)',
                '0 0 0 0 rgba(107, 56, 212, 0.0)',
              ] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ring-4 ${accent.ring} ${accent.iconBg}`}
            >
              <span
                className={`material-symbols-outlined text-3xl ${accent.iconText}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {step.icon}
              </span>
              <span
                className={`absolute -inset-2 rounded-2xl ${accent.glow} opacity-40 blur-lg -z-10`}
              />
            </motion.div>
          </div>
          <span
            className={`font-headline text-5xl font-extrabold leading-none tracking-tight text-on-surface/10 transition-colors duration-300 ${accent.numberHover}`}
            aria-hidden
          >
            {step.number}
          </span>
        </div>

        <h3 className="mt-6 font-headline text-xl font-extrabold text-on-surface">
          {step.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{step.description}</p>

        {step.badge ? (
          <div
            className={`mt-5 inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${accent.badgeText}`}
          >
            <span className="material-symbols-outlined text-sm">{step.badge.icon}</span>
            {step.badge.label}
          </div>
        ) : null}

        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}
