'use client';

import React from 'react';

export function SettingsProfileForm() {
  const [savedFlash, setSavedFlash] = React.useState(false);

  const save = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <h2 className="text-xl font-bold font-headline text-on-surface tracking-tight mb-6">Profile</h2>

      <div className="mb-8 pb-8 border-b border-outline-variant/15">
        <p className="text-sm font-semibold text-on-surface mb-4">Profile picture</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-2xl font-bold text-on-tertiary-container font-headline shadow-inner ring-2 ring-outline-variant/20">
            C
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
            Avatar is managed by your connected account. Replace it from your identity provider, then refresh this page.
          </p>
        </div>
      </div>

      <div className="space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="profile-name">
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            defaultValue="cryptonative_tippy"
            className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-shadow focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="profile-username">
            Username
          </label>
          <input
            id="profile-username"
            type="text"
            defaultValue="cryptonative_tippy"
            className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-shadow focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1.5 text-xs text-on-surface-variant">Your unique username (without @)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            defaultValue="hello@tippy.fun"
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-outline-variant/25 bg-surface-container-high/50 px-4 py-3 text-on-surface-variant opacity-90"
          />
          <p className="mt-1.5 text-xs text-on-surface-variant">Email cannot be changed when linked to a sign-in provider.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-outline-variant/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm font-medium min-h-[1.25rem] transition-opacity ${savedFlash ? 'text-tertiary' : 'text-transparent sm:text-on-surface-variant'}`}
          aria-live="polite"
        >
          {savedFlash ? 'Profile saved (demo).' : '\u00a0'}
        </p>
        <button
          type="button"
          onClick={save}
          className="primary-gradient inline-flex items-center justify-center gap-2 self-end rounded-xl px-6 py-3 text-sm font-bold shadow-[0_10px_20px_rgba(107,56,212,0.2)] transition-transform hover:scale-[1.02] active:scale-95 sm:self-auto"
        >
          <span className="material-symbols-outlined text-xl text-current" aria-hidden>
            save
          </span>
          Save changes
        </button>
      </div>
    </section>
  );
}
