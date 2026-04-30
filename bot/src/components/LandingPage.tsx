'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Shield,
  UserPlus,
  Landmark,
  Heart,
  Stars,
  Sun,
  Moon,
  Twitter,
  ExternalLink,
  MessageCircle,
  BookOpen,
  Plus,
  Coins,
} from 'lucide-react';
import { getDiscordInviteUrl } from '@lib/discordInvite';
import {
  publicCommunityDiscordUrl,
  publicExplorerHomeUrl,
  publicConfluxXUrl,
  publicLearnUrl,
} from '@/lib/publicSiteLinks';
import { Button, Card } from './UI';
import { TippyLogoLink } from './TippyLogoLink';

type SupportedTokenRow = {
  name: string;
  symbol: string;
  type: string;
  img?: string;
};

const SUPPORTED_TOKENS: SupportedTokenRow[] = [
  {
    name: 'Conflux',
    symbol: 'CFX',
    type: 'NATIVE',
    img: '/conflux-logo.png',
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    type: 'ERC-20',
    img: '/token-usdt.png',
  },
  {
    name: 'USDT0 (bridged)',
    symbol: 'USDT0 · tUSDT0',
    type: 'TESTNET',
    img: '/token-usdt0.png',
  },
  {
    name: 'AxCNH (mock)',
    symbol: 'tAxCNH',
    type: 'TESTNET',
    img: '/token-cnh.svg',
  },
  {
    name: 'Your token',
    symbol: 'ERC-20',
    type: 'WATCHLIST',
  },
];

const sectionFade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' } };
const staggerChild = { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' } };

export const LandingPage = ({
  authError,
  onDiscordLogin,
  theme,
  toggleTheme,
  openAppButton,
}: {
  authError?: string | null;
  onDiscordLogin: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  /** When signed in elsewhere, show e.g. “Open app” instead of Discord login on primary CTAs */
  openAppButton?: { label: string; onClick: () => void };
}) => {
  const discordInviteUrl = getDiscordInviteUrl();
  const primaryCtaLabel = openAppButton?.label ?? 'Log in with Discord';
  const primaryCtaAction = openAppButton?.onClick ?? onDiscordLogin;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-8 py-3 sm:py-6 flex items-center justify-between backdrop-blur-md bg-background/50 border-b border-outline-variant/10">
        <TippyLogoLink
          markSize={28}
          wordmarkClassName="font-headline font-black text-lg sm:text-xl tracking-tighter text-on-surface"
          className="rounded-lg -m-1 p-1 hover:opacity-90 transition-opacity"
          priority
        />
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-all"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {discordInviteUrl ? (
            <Button variant="outline" href={discordInviteUrl} className="hidden sm:flex px-4 py-2.5 text-sm">
              Add to Discord
            </Button>
          ) : (
            <span
              className="hidden sm:inline text-xs text-on-surface-variant/60 max-w-[10rem] text-right"
              title="Set NEXT_PUBLIC_DISCORD_CLIENT_ID or NEXT_PUBLIC_DISCORD_INVITE_URL in .env.local"
            >
              Add to Discord (set env)
            </span>
          )}
          <Button
            className="whitespace-nowrap !py-2.5 !px-4 md:!px-6 text-sm"
            onClick={primaryCtaAction}
            title={primaryCtaLabel}
          >
            <DiscordMark className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Log in</span>
            <span className="hidden sm:inline">{primaryCtaLabel}</span>
          </Button>
        </div>
      </nav>

      <section className="relative hero-gradient px-8 pt-32 pb-40 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-10 hero-inner"
        >
          {authError === 'OAuthCallback' ? (
            <Card className="p-5 text-left border-error/30 bg-error-container/10 max-w-2xl mx-auto">
              <p className="font-headline font-bold text-error mb-2">Discord sign-in failed (OAuthCallback)</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Discord refused the login handshake. Fix these in order: (1){' '}
                <strong className="text-on-surface">DISCORD_CLIENT_SECRET</strong> must be the value from Developer Portal →{' '}
                <strong className="text-on-surface">OAuth2 → General → Client Secret</strong> - not your bot token. Re-copy with no
                spaces. (2) Redirect URL must include exactly{' '}
                <code className="text-xs bg-surface-container-high px-1 py-0.5 rounded">http://localhost:3000/api/auth/callback/discord</code>{' '}
                (same host as <code className="text-xs bg-surface-container-high px-1 py-0.5 rounded">NEXTAUTH_URL</code>). (3) Restart{' '}
                <code className="text-xs bg-surface-container-high px-1 py-0.5 rounded">pnpm dev</code> after editing{' '}
                <code className="text-xs bg-surface-container-high px-1 py-0.5 rounded">.env</code>. For the exact Discord error line in
                the terminal, add{' '}
                <code className="text-xs bg-surface-container-high px-1 py-0.5 rounded">NEXTAUTH_DEBUG=true</code>.
              </p>
            </Card>
          ) : null}
          <div className="inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full bg-surface-container/80 border border-outline-variant/15 text-on-surface font-medium text-xs tracking-wider uppercase shadow-sm shadow-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/conflux-logo.png" alt="" width={28} height={28} className="rounded-full bg-surface-container-high ring-1 ring-outline-variant/20 object-cover" />
            <span className="text-on-surface-variant">Built on</span>
            <span className="text-primary font-headline font-bold tracking-tight normal-case">Conflux eSpace</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight leading-[1.08] text-on-background drop-shadow-sm">
            Tip CFX &amp; earn project points{' '}
            <span className="text-primary [text-shadow:0_0_42px_rgb(132_85_239_/_0.35)]">directly in Discord</span>
          </h1>
          <p className="text-on-surface-variant text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            The fastest way to reward community contributors and participate in ecosystem drops without leaving your server.
          </p>
          <p className="text-on-surface-variant/80 text-sm max-w-md mx-auto">
            The web dashboard uses <span className="text-on-surface font-semibold">Discord only</span> - same account as the bot. No separate sign-up.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
            {discordInviteUrl ? (
              <Button href={discordInviteUrl} className="px-10 py-4 text-lg">
                Add to Discord
              </Button>
            ) : (
              <Button disabled className="px-10 py-4 text-lg" title="Set NEXT_PUBLIC_DISCORD_CLIENT_ID in .env.local">
                Add to Discord
              </Button>
            )}
            <Button variant="secondary" className="px-10 py-4 text-lg" onClick={primaryCtaAction}>
              {primaryCtaLabel}
            </Button>
          </div>
        </motion.div>

        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/8 blur-[120px] rounded-full pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-container/8 blur-[150px] rounded-full pointer-events-none" aria-hidden />
      </section>

      <section className="py-12 bg-surface-container-lowest border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-80">
            <div className="flex items-center gap-3">
              <Shield className="text-primary" size={24} />
              <p className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">Sovereign Custody</p>
            </div>
            <p className="text-center md:text-left text-on-surface-variant max-w-2xl text-sm italic">
              &quot;Tippy uses a custodial model to enable instant tipping within Discord. Your funds are held in per-user
              Conflux eSpace addresses managed by Tippy - see our policy for details.&quot;
            </p>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/conflux-logo.png" alt="" width={20} height={20} className="opacity-95 shrink-0 object-contain" />
              <span className="text-primary font-bold font-headline">Conflux</span>
              <div className="h-4 w-[1px] bg-outline-variant/40" />
              <span className="text-on-surface-variant text-sm font-medium">Verified Safety</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...sectionFade} transition={{ duration: 0.45 }} className="mb-20 text-center md:text-left">
            <h2 className="text-4xl font-headline font-bold mb-4">Master Tippy in seconds</h2>
            <p className="text-on-surface-variant max-w-xl">A seamless bridge between your community interactions and your on-chain assets.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: UserPlus,
                title: '1. Log in',
                desc: 'Open the dashboard with Discord. Your Tippy Conflux eSpace wallet is created when you /register in the server - no private keys in Discord.',
              },
              {
                icon: Landmark,
                title: '2. Deposit',
                desc: 'Send CFX or supported ERC-20 tokens to your dedicated Tippy deposit address to fund your wallet.',
              },
              {
                icon: Heart,
                title: '3. Tip',
                desc: 'Use /tip @user [amount] [token] to reward anyone in the chat with on-chain settlement.',
              },
              {
                icon: Stars,
                title: '4. Earn',
                desc: 'Active members earn capped project points and can participate in configured airdrop rules.',
              },
            ].map((step, i) => (
              <motion.div key={i} {...staggerChild} transition={{ duration: 0.42, delay: i * 0.06 }}>
                <Card hover className="p-8 h-full">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-headline">{step.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            {...sectionFade}
            transition={{ duration: 0.45 }}
            className="mb-10 lg:mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10"
          >
            <div className="min-w-0 text-center md:text-left">
              <span className="font-headline font-bold tracking-wider uppercase text-[0.6875rem] text-primary mb-3 md:mb-4 block">
                Ecosystem Assets
              </span>
              <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight">Supported Tokens</h2>
            </div>
            <p className="text-on-surface-variant text-sm sm:text-base max-w-md mx-auto md:mx-0 md:max-w-sm md:text-right leading-relaxed md:shrink-0">
              Tip CFX, USDT, bridged <span className="text-on-surface font-medium">USDT0</span>, and testnet{' '}
              <span className="text-on-surface font-medium">tAxCNH</span> on Conflux eSpace with the same flow.
            </p>
          </motion.div>

          <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center items-stretch gap-5 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible no-scrollbar pb-1 md:pb-0 snap-x snap-mandatory md:snap-none">
            {SUPPORTED_TOKENS.map((asset, i) => (
                <motion.div
                  key={`${asset.name}-${asset.symbol}`}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.24) }}
                  className="flex-none w-[min(16rem,calc(100vw-3rem))] sm:w-64 snap-start glass-card p-6 rounded-2xl border border-outline-variant/10 flex flex-col"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/15 overflow-hidden shrink-0 bg-surface-container-high ring-1 ring-outline-variant/15">
                    {asset.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.img}
                        alt={`${asset.name} logo`}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain p-1.5"
                        loading="lazy"
                      />
                    ) : (
                      <Coins className="text-primary" size={26} aria-hidden />
                    )}
                  </div>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h4 className="text-lg font-bold font-headline leading-tight">{asset.name}</h4>
                    <span className="shrink-0 text-[0.6875rem] font-bold tracking-tighter text-primary px-2 py-0.5 bg-primary/10 rounded">
                      {asset.type}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-sm font-medium leading-snug">{asset.symbol}</p>
                </motion.div>
              ))}
            <motion.div
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              className="flex-none w-[min(16rem,calc(100vw-3rem))] sm:w-64 snap-start glass-card p-6 rounded-2xl border border-outline-variant/10 opacity-60 flex flex-col items-center justify-center text-center min-h-[11rem] md:min-h-0"
            >
              <Plus className="text-outline mb-4 shrink-0" size={32} />
              <h4 className="text-lg font-bold font-headline">And More</h4>
              <p className="text-on-surface-variant text-sm font-medium mt-1">New listings weekly</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-primary-container p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-primary-container mb-8">
              Ready to boost your community engagement?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {discordInviteUrl ? (
                <Button href={discordInviteUrl} className="px-12 py-5 text-xl">
                  Add to your server
                </Button>
              ) : null}
              <Button variant={discordInviteUrl ? 'secondary' : 'primary'} onClick={primaryCtaAction} className="px-12 py-5 text-xl">
                {primaryCtaLabel}
              </Button>
            </div>
            <p className="mt-8 text-on-primary-container/70 font-medium">Join Discord communities building on Conflux.</p>
          </div>
          <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgb(132_85_239_/_0.55)_0%,transparent_55%)]" />
        </div>
      </section>

      <footer className="bg-surface-container-lowest w-full py-12 px-8 border-t border-outline-variant/10 opacity-80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link
              href="/landing"
              className="flex items-center gap-2 font-headline font-black text-on-surface text-xl hover:text-primary transition-colors"
            >
              <Image src="/logo.png" alt="" width={28} height={28} className="object-contain rounded-md shrink-0" />
              Tippy
            </Link>
            <p className="text-xs font-medium text-on-surface-variant/40">© {new Date().getFullYear()} Tippy. Built for Conflux eSpace.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            <a
              href={publicExplorerHomeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant/60 hover:text-primary transition-colors"
            >
              <ExternalLink size={16} />
              Conflux explorer
            </a>
            <a
              href={publicLearnUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant/60 hover:text-primary transition-colors"
            >
              <BookOpen size={16} />
              Learn
            </a>
            <a
              href={publicCommunityDiscordUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant/60 hover:text-primary transition-colors"
            >
              <MessageCircle size={16} />
              Discord
            </a>
            <a
              href={publicConfluxXUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant/60 hover:text-primary transition-colors"
            >
              <Twitter size={16} />
              Conflux on X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

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
