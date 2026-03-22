/** Synced with inline script in `app/layout.tsx` and `ThemeToggle`. */
export const THEME_STORAGE_KEY = 'tippy-fun-theme';

export const THEME_CHANGED_EVENT = 'tippy-fun-theme-changed';

export type ThemeChangedDetail = { dark: boolean };

export function getStoredIsDark(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function setThemeIsDark(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  window.dispatchEvent(new CustomEvent<ThemeChangedDetail>(THEME_CHANGED_EVENT, { detail: { dark } }));
}
