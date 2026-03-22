'use client';

import React from 'react';
import {
  THEME_CHANGED_EVENT,
  getStoredIsDark,
  setThemeIsDark,
  type ThemeChangedDetail,
} from '@/lib/themePreference';

type Mode = 'light' | 'dark';

const OPTIONS: {
  mode: Mode;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    mode: 'light',
    label: 'Light mode',
    description: 'Bright surfaces and high clarity for daytime use.',
    icon: 'light_mode',
  },
  {
    mode: 'dark',
    label: 'Dark mode',
    description: 'Reduced glare — easier in low light and at night.',
    icon: 'dark_mode',
  },
];

export function ThemeAppearancePicker() {
  const [mode, setMode] = React.useState<Mode>('light');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setMode(getStoredIsDark() ? 'dark' : 'light');

    const onTheme = (e: Event) => {
      const d = (e as CustomEvent<ThemeChangedDetail>).detail;
      setMode(d.dark ? 'dark' : 'light');
    };
    window.addEventListener(THEME_CHANGED_EVENT, onTheme);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, onTheme);
  }, []);

  const select = (next: Mode) => {
    const dark = next === 'dark';
    setMode(next);
    setThemeIsDark(dark);
  };

  if (!mounted) {
    return (
      <div
        className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)]"
        aria-hidden
      >
        <div className="h-6 w-40 rounded-md bg-surface-container-high animate-pulse mb-3" />
        <div className="h-4 w-full max-w-md rounded bg-surface-container-high/80 animate-pulse mb-8" />
        <div className="space-y-3">
          <div className="h-24 rounded-xl bg-surface-container-high/60 animate-pulse" />
          <div className="h-24 rounded-xl bg-surface-container-high/60 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <section
      className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
      aria-labelledby="theme-settings-heading"
    >
      <div className="mb-6">
        <h2 id="theme-settings-heading" className="text-xl font-bold font-headline text-on-surface tracking-tight">
          Theme
        </h2>
        <p className="mt-1.5 text-sm text-on-surface-variant leading-relaxed max-w-xl">
          Choose your preferred color theme for the app. This device remembers your choice; the floating palette control uses the same setting.
        </p>
      </div>

      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Color theme">
        {OPTIONS.map((opt) => {
          const selected = mode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => select(opt.mode)}
              className={`group flex w-full gap-4 rounded-xl border-2 p-4 sm:p-5 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest ${
                selected
                  ? 'border-primary bg-primary/[0.07] shadow-[0_0_0_1px_rgba(107,56,212,0.12)] dark:bg-primary/15 dark:shadow-[0_0_0_1px_rgba(208,188,255,0.15)]'
                  : 'border-outline-variant/35 bg-surface-container-low/40 hover:border-outline-variant/55 hover:bg-surface-container-low/70 dark:border-outline-variant/25 dark:bg-surface-container-low/20'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected ? 'border-primary bg-primary' : 'border-outline-variant bg-transparent group-hover:border-outline'
                }`}
                aria-hidden
              >
                {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  selected
                    ? 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary-fixed-dim'
                    : 'bg-surface-container-high/80 text-on-surface-variant group-hover:text-on-surface'
                }`}
                aria-hidden
              >
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {opt.icon}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-on-surface">{opt.label}</span>
                  {selected ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary dark:bg-primary/25 dark:text-primary-fixed-dim">
                      Current
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm text-on-surface-variant leading-snug">{opt.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/15 pt-5">
        Tip: you can still switch anytime with the palette button in the bottom-right corner.
      </p>
    </section>
  );
}
