'use client';

import { useLinkAccount, usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMyProfile, useUpdateMyProfile } from '@/hooks/useProfile';
import { shortAddress, explorerAddressUrl } from '@/lib/conflux';

const DEFAULT_REDIRECT = '/operator_dashboard';

function isSafeRedirect(value: string | null | undefined): value is string {
  return !!value && value.startsWith('/') && !value.startsWith('//');
}

export function RegisterClient() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectTo = isSafeRedirect(redirectParam) ? redirectParam : DEFAULT_REDIRECT;

  const profile = useMyProfile();
  const updateProfile = useUpdateMyProfile();

  const row = profile.data?.profile ?? null;

  const [displayName, setDisplayName] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (row?.displayName && !touched) {
      setDisplayName(row.displayName);
    }
  }, [row?.displayName, touched]);

  const { linkTwitter, linkDiscord } = useLinkAccount({
    onSuccess: () => profile.refetch(),
  });

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  const twitterLinked = Boolean(row?.twitterHandle);
  const discordLinked = Boolean(row?.discordHandle);

  const canSubmit = useMemo(() => {
    if (!row) return false;
    if (!displayName.trim()) return false;
    if (updateProfile.isPending) return false;
    return true;
  }, [row, displayName, updateProfile.isPending]);

  const onFinish = async () => {
    if (!row) return;
    try {
      const trimmed = displayName.trim();
      if (trimmed && trimmed !== row.displayName) {
        await updateProfile.mutateAsync({ displayName: trimmed });
      }
      router.replace(redirectTo);
    } catch {
      /* updateProfile.error will surface below */
    }
  };

  const onSkip = () => router.replace(redirectTo);

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <div className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to home
        </Link>

        <header className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Step 2 of 2</p>
          <h1 className="mt-2 font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
            Finish your profile
          </h1>
          <p className="mt-3 text-lg text-on-surface-variant max-w-xl">
            Pick a display name and (optionally) link your Twitter and Discord accounts so your
            campaigns and submissions can be recognised across the community.
          </p>
        </header>

        {!ready || profile.isLoading ? (
          <section className="mt-10 rounded-2xl bg-surface-container-lowest px-6 py-14 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined text-primary text-3xl animate-pulse"
              aria-hidden
            >
              progress_activity
            </span>
            <p className="mt-3 text-sm">Loading your profile…</p>
          </section>
        ) : !row ? (
          <section className="mt-10 rounded-2xl border border-error/30 bg-error-container/30 px-6 py-8">
            <p className="text-on-error-container font-semibold">
              We couldn't find your wallet yet.
            </p>
            <p className="mt-1 text-sm text-on-error-container/90">
              {profile.data?.reason ??
                'Try signing in again — Privy may still be provisioning an embedded wallet for you.'}
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-2.5 font-bold text-sm hover:opacity-90"
            >
              Back to sign in
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </section>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onFinish();
            }}
            className="mt-10 space-y-8"
          >
            <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_20px_40px_rgba(17,28,45,0.05)]">
              <label htmlFor="displayName" className="block font-headline font-bold text-on-surface">
                Display name
              </label>
              <p className="text-sm text-on-surface-variant">
                We generated one from your wallet. Edit it if you want something custom.
              </p>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setTouched(true);
                }}
                maxLength={48}
                className="mt-3 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-lg font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              {row.handle ? (
                <p className="mt-2 text-xs text-on-surface-variant">
                  Public handle: <span className="font-mono">{row.handle}</span>
                </p>
              ) : null}
              {row.walletAddress ? (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Signed in as{' '}
                  <a
                    href={explorerAddressUrl(row.walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    {shortAddress(row.walletAddress, 6)}
                  </a>
                </p>
              ) : null}
            </section>

            <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_20px_40px_rgba(17,28,45,0.05)]">
              <h2 className="font-headline font-bold text-on-surface">
                Link your socials (optional)
              </h2>
              <p className="text-sm text-on-surface-variant">
                We'll attribute your on-chain activity to these handles across Tippy. You can skip
                and link them later from Settings.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <SocialButton
                  icon="alternate_email"
                  label="Twitter / X"
                  linkedValue={row.twitterHandle}
                  onLink={() => linkTwitter()}
                />
                <SocialButton
                  icon="forum"
                  label="Discord"
                  linkedValue={row.discordHandle}
                  onLink={() => linkDiscord()}
                />
              </div>
            </section>

            {updateProfile.error ? (
              <p className="text-sm text-error">{updateProfile.error.message}</p>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-6 py-3 font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateProfile.isPending ? 'Saving…' : 'Finish and go to campaigns'}
                {!updateProfile.isPending ? (
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface px-6 py-3 font-bold hover:bg-surface-container-low transition-all"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function SocialButton({
  icon,
  label,
  linkedValue,
  onLink,
}: {
  icon: string;
  label: string;
  linkedValue: string | null | undefined;
  onLink: () => void;
}) {
  const linked = Boolean(linkedValue);
  return (
    <button
      type="button"
      onClick={onLink}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        linked
          ? 'border-primary/40 bg-primary/5'
          : 'border-outline-variant/40 bg-surface hover:bg-surface-container-low'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <span>
          <span className="block font-semibold text-on-surface">{label}</span>
          <span className="block text-xs text-on-surface-variant">
            {linked ? `Connected as @${linkedValue}` : 'Not linked'}
          </span>
        </span>
      </span>
      <span className="material-symbols-outlined text-on-surface-variant text-base">
        {linked ? 'sync' : 'arrow_forward'}
      </span>
    </button>
  );
}
