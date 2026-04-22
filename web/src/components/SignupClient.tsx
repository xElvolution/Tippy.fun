'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useMyProfile } from '@/hooks/useProfile';

const REDIRECT_DEFAULT = '/operator_dashboard';
const REGISTER_PATH = '/register';

function isSafeRedirect(target: string | null | undefined): target is string {
  return !!target && target.startsWith('/') && !target.startsWith('//');
}

export function SignupClient() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useMyProfile();

  const redirectParam = searchParams.get('redirect');
  const redirectTo = isSafeRedirect(redirectParam) ? redirectParam : REDIRECT_DEFAULT;

  useEffect(() => {
    if (!ready || !authenticated) return;
    if (profile.isLoading || profile.isFetching) return;
    // Profile row exists only after we've resolved a wallet + persisted the
    // auto-generated display name / handle. First-time users (no row yet) are
    // bounced through /register to set up socials; returning users go straight
    // to the original redirect target.
    const row = profile.data?.profile ?? null;
    const fresh =
      row != null && Math.abs(Date.parse(row.createdAt) - Date.parse(row.updatedAt)) < 3_000;
    if (!row || fresh) {
      const query =
        redirectTo && redirectTo !== REDIRECT_DEFAULT
          ? `?redirect=${encodeURIComponent(redirectTo)}`
          : '';
      router.replace(`${REGISTER_PATH}${query}`);
    } else {
      router.replace(redirectTo);
    }
  }, [ready, authenticated, router, redirectTo, profile.isLoading, profile.isFetching, profile.data]);

  const loading = !ready;
  const redirecting = ready && authenticated;

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <div className="max-w-5xl mx-auto px-6 py-14 md:py-24">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <section>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to home
            </Link>
            <h1 className="mt-6 font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Sign up to launch your first campaign
            </h1>
            <p className="mt-4 text-lg text-on-surface-variant max-w-xl">
              TippyMaker is fully non-custodial. Sign up with email, Google, X, or an existing
              wallet. We'll create an embedded wallet automatically if you don't have one.
              You'll be redirected to your dashboard right after.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-on-surface-variant max-w-md">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">
                  verified_user
                </span>
                <span>
                  <strong className="text-on-surface">Your keys, your funds.</strong> Campaign
                  escrow lives on Conflux eSpace, controlled by <em>your</em> wallet.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">bolt</span>
                <span>
                  <strong className="text-on-surface">No sign-up fee.</strong> You only pay gas
                  when you deploy or fund a campaign.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">
                  chat_bubble
                </span>
                <span>
                  <strong className="text-on-surface">Plug into Discord + Telegram</strong> as
                  soon as you're signed in.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0_30px_60px_rgba(17,28,45,0.08)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined">how_to_reg</span>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Step 1 of 2
                </p>
                <h2 className="font-headline text-xl font-extrabold text-on-surface">
                  Create your account
                </h2>
              </div>
            </div>

            <button
              type="button"
              disabled={loading || redirecting}
              onClick={() => login()}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-6 py-3 font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Loading…'
                : redirecting
                  ? 'Redirecting to dashboard…'
                  : 'Sign up / Sign in'}
              {!loading && !redirecting ? (
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              ) : null}
            </button>

            <div className="mt-6 grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
              <div className="rounded-xl bg-surface-container-low px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">mail</span>
                Email
              </div>
              <div className="rounded-xl bg-surface-container-low px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">login</span>
                Google
              </div>
              <div className="rounded-xl bg-surface-container-low px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">
                  alternate_email
                </span>
                X / Twitter
              </div>
              <div className="rounded-xl bg-surface-container-low px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">
                  account_balance_wallet
                </span>
                Wallet
              </div>
            </div>

            <p className="mt-6 text-xs text-on-surface-variant text-center">
              By continuing you agree that TippyMaker only sees your public wallet address.
              We never take custody of your funds.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
