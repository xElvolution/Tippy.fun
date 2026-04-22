'use client';

import Link from 'next/link';
import React from 'react';
import { useLinkAccount, usePrivy } from '@privy-io/react-auth';
import { useMyProfile } from '@/hooks/useProfile';
import { publicBotInstallUrl } from '@/lib/siteLinks';

type LinkedAccountEntry = {
  type: string;
  subject?: string;
  username?: string;
  name?: string;
};

type SocialId = 'twitter' | 'discord';

const TWITTER_GLYPH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DISCORD_GLYPH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

function findLinked(accounts: LinkedAccountEntry[], type: string): LinkedAccountEntry | undefined {
  return accounts.find((a) => a.type === type);
}

export function SettingsSocialConnectionsForm() {
  const { ready, authenticated, user, login, unlinkTwitter, unlinkDiscord } = usePrivy();
  const profile = useMyProfile();

  const { linkTwitter, linkDiscord } = useLinkAccount({
    onSuccess: () => {
      profile.refetch();
    },
  });

  const [actionState, setActionState] = React.useState<{ id: SocialId; busy: boolean } | null>(null);

  const linkedAccounts = ((user?.linkedAccounts ?? []) as unknown) as LinkedAccountEntry[];
  const twitter = findLinked(linkedAccounts, 'twitter_oauth');
  const discord = findLinked(linkedAccounts, 'discord_oauth');

  const handleLink = (id: SocialId) => {
    if (!authenticated) {
      login();
      return;
    }
    setActionState({ id, busy: true });
    try {
      if (id === 'twitter') linkTwitter();
      else linkDiscord();
    } finally {
      setTimeout(() => setActionState(null), 500);
    }
  };

  const handleUnlink = async (id: SocialId, subject?: string) => {
    if (!subject) return;
    setActionState({ id, busy: true });
    try {
      if (id === 'twitter') await unlinkTwitter(subject);
      else await unlinkDiscord(subject);
      await profile.refetch();
    } finally {
      setActionState(null);
    }
  };

  const botInstall = publicBotInstallUrl();

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <h2 className="text-xl font-bold font-headline text-on-surface tracking-tight">Socials</h2>
      <p className="mt-1.5 text-sm text-on-surface-variant max-w-2xl leading-relaxed mb-6">
        Link Twitter and Discord so your on-chain campaigns and submissions can be attributed to
        the same identity across the Tippy network. Everything runs through Privy. We never store
        OAuth tokens.
      </p>

      {!ready || profile.isLoading ? (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-6 text-center text-on-surface-variant">
          Loading your accounts…
        </div>
      ) : !authenticated ? (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-6 text-center">
          <p className="font-semibold text-on-surface">Sign in to manage your linked accounts.</p>
          <button
            type="button"
            onClick={() => login()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-on-primary font-bold hover:opacity-90"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          <SocialRow
            id="twitter"
            name="X (Twitter)"
            description="We'll attribute submissions and campaigns you publish with your @handle."
            iconWrap="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            glyph={TWITTER_GLYPH}
            linkedHandle={twitter?.username ?? twitter?.name ?? null}
            subject={twitter?.subject}
            busy={actionState?.id === 'twitter' && actionState.busy}
            onLink={() => handleLink('twitter')}
            onUnlink={() => handleUnlink('twitter', twitter?.subject)}
          />
          <SocialRow
            id="discord"
            name="Discord"
            description="Required if you want to run Discord-native tipping campaigns."
            iconWrap="bg-[#5865F2] text-white"
            glyph={DISCORD_GLYPH}
            linkedHandle={discord?.username ?? discord?.name ?? null}
            subject={discord?.subject}
            busy={actionState?.id === 'discord' && actionState.busy}
            onLink={() => handleLink('discord')}
            onUnlink={() => handleUnlink('discord', discord?.subject)}
          />

          {botInstall ? (
            <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-4">
              <p className="font-semibold text-on-surface">Want to run Tippy inside a server?</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Install the bot to tip from Discord or Telegram once your campaign is live.
              </p>
              <a
                href={botInstall}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90"
              >
                Install bot
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
            </div>
          ) : (
            <Link
              href="/integrations_hub"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Explore integrations
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function SocialRow({
  id,
  name,
  description,
  iconWrap,
  glyph,
  linkedHandle,
  subject,
  busy,
  onLink,
  onUnlink,
}: {
  id: SocialId;
  name: string;
  description: string;
  iconWrap: string;
  glyph: React.ReactNode;
  linkedHandle: string | null;
  subject: string | undefined;
  busy: boolean;
  onLink: () => void;
  onUnlink: () => void;
}) {
  const linked = Boolean(linkedHandle);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-surface-container-low/20">
      <div className="flex min-w-0 gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>{glyph}</div>
        <div className="min-w-0">
          <p className="font-bold text-on-surface">{name}</p>
          <p className="text-sm text-on-surface-variant leading-snug">{description}</p>
          {linked ? (
            <p className="mt-1 text-xs font-semibold text-tertiary">
              Connected as <span className="font-mono">@{linkedHandle}</span>
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
        {linked ? (
          <span className="text-xs font-bold uppercase tracking-wide text-tertiary">Connected</span>
        ) : (
          <span className="text-xs font-medium text-on-surface-variant">Not connected</span>
        )}
        <button
          type="button"
          disabled={busy || (linked && !subject)}
          onClick={linked ? onUnlink : onLink}
          aria-label={`${linked ? 'Disconnect' : 'Connect'} ${name}`}
          data-social={id}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            linked
              ? 'border border-outline-variant/40 text-on-surface hover:bg-surface-container-high'
              : 'primary-gradient text-white shadow-sm hover:opacity-95'
          }`}
        >
          {busy ? 'Working…' : linked ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
