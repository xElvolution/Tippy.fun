'use client';

import React from 'react';
import { THEME_CHANGED_EVENT, getStoredIsDark, setThemeIsDark, type ThemeChangedDetail } from '@/lib/themePreference';

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setDark(getStoredIsDark());

    const onTheme = (e: Event) => {
      const d = (e as CustomEvent<ThemeChangedDetail>).detail;
      setDark(d.dark);
    };
    window.addEventListener(THEME_CHANGED_EVENT, onTheme);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, onTheme);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    setThemeIsDark(next);
  };

  const base =
    'fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full ' +
    'border transition-all duration-200 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
    'hover:scale-[1.04] active:scale-[0.97]';

  const surface =
    'bg-white text-neutral-900 border-neutral-200/90 ' +
    'shadow-[0_4px_16px_rgba(15,23,42,0.10)] hover:bg-neutral-50 hover:border-neutral-300/90 hover:shadow-[0_6px_22px_rgba(15,23,42,0.14)] ' +
    'focus-visible:ring-offset-white ' +
    'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-600/70 ' +
    'dark:shadow-[0_4px_20px_rgba(0,0,0,0.55)] dark:hover:bg-neutral-700 dark:hover:border-neutral-500/70 dark:hover:shadow-[0_6px_28px_rgba(0,0,0,0.5)] ' +
    'dark:focus-visible:ring-offset-neutral-900';

  if (!mounted) {
    return <div className={`${base} ${surface} pointer-events-none opacity-90`} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${base} ${surface}`}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className="material-symbols-outlined text-2xl text-current"
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden
      >
        palette
      </span>
    </button>
  );
}
