'use client';

import React from 'react';

type Row = { id: string; title: string; description: string; defaultOn: boolean };

const ROWS: Row[] = [
  {
    id: 'email',
    title: 'Email updates',
    description: 'Weekly summaries of campaign performance and treasury activity.',
    defaultOn: true,
  },
  {
    id: 'inapp',
    title: 'In-app alerts',
    description: 'Real-time notices for submissions, judging conflicts, and payouts.',
    defaultOn: true,
  },
  {
    id: 'discovery',
    title: 'Campaign discovery',
    description: 'Occasional suggestions based on channels you use (Telegram / Discord).',
    defaultOn: false,
  },
];

function Toggle({
  pressed,
  onToggle,
  label,
}: {
  pressed: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest ${
        pressed ? 'bg-primary' : 'bg-surface-container-highest dark:bg-surface-container-high'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          pressed ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function SettingsNotificationsForm() {
  const [states, setStates] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(ROWS.map((r) => [r.id, r.defaultOn]))
  );
  const [savedFlash, setSavedFlash] = React.useState(false);

  const toggle = (id: string) => {
    setStates((s) => ({ ...s, [id]: !s[id] }));
  };

  const save = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-headline text-on-surface tracking-tight">Notification settings</h2>
        <p className="mt-1.5 text-sm text-on-surface-variant max-w-xl leading-relaxed">
          Control how Tippy reaches you. Changes apply to this account on this device.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ROWS.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 dark:bg-surface-container-low/25"
          >
            <div className="min-w-0 space-y-1 pr-2">
              <h3 className="font-bold text-on-surface">{row.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{row.description}</p>
            </div>
            <Toggle pressed={states[row.id]} onToggle={() => toggle(row.id)} label={`${row.title} notifications`} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-outline-variant/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm font-medium transition-opacity ${savedFlash ? 'text-tertiary opacity-100' : 'text-on-surface-variant opacity-0 sm:opacity-100'}`}
          aria-live="polite"
        >
          {savedFlash ? 'Preferences saved (demo).' : ''}
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
