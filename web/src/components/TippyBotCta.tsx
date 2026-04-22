'use client';

import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations';
import { publicBotInstallUrl } from '@/lib/siteLinks';

const STEPS = [
  {
    icon: 'login',
    title: 'Log in with Discord',
    body: 'Same Discord account as the bot. No separate sign-up or seed phrase.',
  },
  {
    icon: 'account_balance_wallet',
    title: 'Your Conflux wallet',
    body: 'A dedicated Conflux eSpace wallet is created when you /register in the server.',
  },
  {
    icon: 'paid',
    title: '/tip @user',
    body: 'Reward anyone with CFX or ERC-20s right inside chat. On-chain settlement, receipts in the thread.',
  },
  {
    icon: 'rocket_launch',
    title: 'Earn + airdrops',
    body: 'Active members earn capped project points and can qualify for airdrop rules.',
  },
];

const TOKENS = [
  { symbol: 'CFX', label: 'Conflux', kind: 'Native' },
  { symbol: 'USDT', label: 'Tether', kind: 'ERC-20' },
  { symbol: 'AxCNH', label: 'Stable', kind: 'ERC-20' },
];

export function TippyBotCta() {
  const href = publicBotInstallUrl();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-tertiary/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-14">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-outline-variant/20 bg-gradient-to-br from-primary/10 via-surface-container-lowest to-tertiary/10 p-8 sm:p-12 lg:p-14">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-tertiary/20 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#5865F2]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5865F2]">
                  <DiscordMark className="h-3.5 w-3.5" />
                  Discord bot
                </span>
                <h2 className="mt-5 font-headline text-3xl font-extrabold leading-tight text-on-surface sm:text-4xl lg:text-5xl">
                  Add <span className="text-primary">Tippy</span> to your community and tip your
                  users in chat
                </h2>
                <p className="mt-4 max-w-xl text-base text-on-surface-variant">
                  The Tippy Discord bot lets server admins reward contributors with CFX and
                  ERC-20s without anyone leaving the channel. Same Conflux eSpace that powers your
                  campaigns. Same login. Instant settlement.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5865F2]/25 transition-all hover:bg-[#4752c4] active:scale-95"
                  >
                    <DiscordMark className="h-4 w-4" />
                    Add Tippy to Discord
                    <span className="material-symbols-outlined text-base">arrow_outward</span>
                  </a>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-outline-variant/40 bg-surface-container-lowest px-6 py-3.5 text-sm font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-surface-container-high"
                  >
                    See the bot page
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-base">
                      verified
                    </span>
                    Built for Conflux eSpace
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-base">
                      shield
                    </span>
                    Custodial per-user addresses
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-base">
                      bolt
                    </span>
                    No seed phrase in chat
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5865F2] text-white">
                        <DiscordMark className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-headline text-sm font-extrabold text-on-surface">
                          Tippy Bot
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          #payouts · just now
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
                      Settled
                    </span>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-4 font-mono text-xs text-on-surface-variant">
                    <p>
                      <span className="text-primary">/tip</span>{' '}
                      <span className="text-on-surface">@mira</span>{' '}
                      <span className="text-tertiary">25 USDT</span>
                    </p>
                    <p className="mt-2 text-on-surface">
                      Sent <span className="font-semibold text-primary">25 USDT</span> to{' '}
                      <span className="font-semibold">@mira</span> on Conflux eSpace.
                    </p>
                    <p className="mt-1 truncate text-[10px] text-on-surface-variant">
                      tx 0x9f1c…e42a · confirmed in 2.3s
                    </p>
                  </div>
                  <ul className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    {STEPS.map((s, i) => (
                      <motion.li
                        key={s.title}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                        className="flex items-start gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-3"
                      >
                        <span className="material-symbols-outlined shrink-0 text-primary">
                          {s.icon}
                        </span>
                        <div>
                          <p className="font-headline font-bold text-on-surface">{s.title}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">
                            {s.body}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Supported
                  </span>
                  {TOKENS.map((t) => (
                    <span
                      key={t.symbol}
                      className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-3 py-1 text-[11px] font-semibold text-on-surface"
                    >
                      <span className="font-headline font-extrabold text-primary">
                        {t.symbol}
                      </span>
                      <span className="text-on-surface-variant">· {t.kind}</span>
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function DiscordMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.105 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.106c.36.699.771 1.363 1.226 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.031-.056c.5-5.177-.838-9.674-3.548-13.66a.061.061 0 00-.031-.029zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}
