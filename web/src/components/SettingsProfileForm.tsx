'use client';

import React from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useMyProfile, useUpdateMyProfile } from '@/hooks/useProfile';
import { shortAddress, explorerAddressUrl } from '@/lib/conflux';
import { AvatarGradient } from '@/components/AvatarGradient';

export function SettingsProfileForm() {
  const { ready, authenticated, login } = usePrivy();
  const profile = useMyProfile();
  const update = useUpdateMyProfile();

  const row = profile.data?.profile ?? null;
  const [displayName, setDisplayName] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [savedFlash, setSavedFlash] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (row?.displayName && !touched) {
      setDisplayName(row.displayName);
    }
  }, [row?.displayName, touched]);

  const save = async () => {
    if (!row) return;
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === row.displayName) return;
    try {
      await update.mutateAsync({ displayName: trimmed });
      setTouched(false);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2500);
    } catch {
      /* error surfaces below */
    }
  };

  const copyAddress = async () => {
    if (!row?.walletAddress) return;
    try {
      await navigator.clipboard.writeText(row.walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (!ready) {
    return (
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-on-surface-variant">
        Loading profile…
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center">
        <p className="font-headline text-lg font-bold text-on-surface">Sign in to manage your profile</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Your profile is keyed to your wallet. Sign in to edit your display name and socials.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-on-primary font-bold hover:opacity-90"
        >
          Sign in
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </section>
    );
  }

  if (profile.isLoading) {
    return (
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-on-surface-variant">
        Loading your profile…
      </section>
    );
  }

  if (!row) {
    return (
      <section className="rounded-2xl border border-error/30 bg-error-container/20 p-6">
        <p className="font-semibold text-on-error-container">We couldn't load your profile.</p>
        <p className="mt-1 text-sm text-on-error-container/80">
          {profile.error?.message ?? profile.data?.reason ?? 'Try refreshing the page.'}
        </p>
      </section>
    );
  }

  const canSave = displayName.trim().length > 0 && displayName.trim() !== row.displayName && !update.isPending;

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <h2 className="text-xl font-bold font-headline text-on-surface tracking-tight mb-6">Profile</h2>

      <div className="mb-8 pb-8 border-b border-outline-variant/15">
        <p className="text-sm font-semibold text-on-surface mb-4">Profile picture</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AvatarGradient
            seed={row.avatarSeed ?? row.walletAddress ?? row.handle ?? 'tippy'}
            label={row.displayName ?? '?'}
            size={80}
            className="shrink-0"
          />
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
            Your avatar is generated deterministically from your wallet address. Every wallet gets
            a unique gradient so your public profile stays consistent.
          </p>
        </div>
      </div>

      <div className="space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="profile-name">
            Display name
          </label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setTouched(true);
            }}
            maxLength={48}
            className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-shadow focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1.5 text-xs text-on-surface-variant">
            Shown on campaigns you launch and submissions you make.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="profile-handle">
            Public handle
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-outline-variant/25 bg-surface-container-high/50 px-4 py-3">
            <span className="text-on-surface-variant">tippy.fun/u/</span>
            <span id="profile-handle" className="font-mono text-on-surface">
              {row.handle ?? '(none)'}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-on-surface-variant">
            Auto-generated from your display name. Changes the moment you save a new name.
          </p>
          {row.handle ? (
            <Link
              href={`/u/${row.handle}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View public profile
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Wallet address</label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant/25 bg-surface-container-high/50 px-4 py-3">
            <span className="font-mono text-sm text-on-surface">
              {row.walletAddress ?? 'Not linked yet'}
            </span>
            {row.walletAddress ? (
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyAddress}
                  className="rounded-lg bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface hover:bg-surface-container-high"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={explorerAddressUrl(row.walletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary hover:bg-surface-container-high"
                >
                  Explorer
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            ) : null}
          </div>
          {row.walletAddress ? (
            <p className="mt-1.5 text-xs text-on-surface-variant">
              Short form: <span className="font-mono">{shortAddress(row.walletAddress, 6)}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-outline-variant/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm font-medium min-h-[1.25rem] transition-opacity ${
            update.error
              ? 'text-error'
              : savedFlash
                ? 'text-tertiary'
                : 'text-transparent sm:text-on-surface-variant'
          }`}
          aria-live="polite"
        >
          {update.error
            ? update.error.message
            : savedFlash
              ? 'Profile saved.'
              : '\u00a0'}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="primary-gradient inline-flex items-center justify-center gap-2 self-end rounded-xl px-6 py-3 text-sm font-bold shadow-[0_10px_20px_rgba(107,56,212,0.2)] transition-transform hover:scale-[1.02] active:scale-95 sm:self-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="material-symbols-outlined text-xl text-current" aria-hidden>
            save
          </span>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </section>
  );
}
