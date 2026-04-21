'use client';

import React from 'react';
import { Bell, ExternalLink, Landmark, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { ActivityItemJson } from '@/types/activity';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function iconFor(kind: ActivityItemJson['kind']) {
  switch (kind) {
    case 'deposit':
      return <Landmark size={18} className="text-secondary" />;
    case 'tip_received':
      return <ArrowDownLeft size={18} className="text-primary" />;
    case 'withdrawal':
      return <ArrowUpRight size={18} className="text-error" />;
    default:
      return <ArrowUpRight size={18} className="text-tertiary" />;
  }
}

export function NotificationsMenu({ onOpenActivity }: { onOpenActivity: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<ActivityItemJson[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setItems(null);
    fetch('/api/me/activity')
      .then(async (res) => {
        const j = (await res.json()) as { items?: ActivityItemJson[]; error?: string };
        if (!res.ok) throw new Error(j.error || res.statusText);
        return j.items ?? [];
      })
      .then((list) => {
        const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(sorted.slice(0, 12));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const hasItems = (items?.length ?? 0) > 0;

  const handleRowClick = () => {
    setOpen(false);
    onOpenActivity();
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant relative"
        title="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {hasItems ?
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        : null}
      </button>

      {open ?
        <div
          className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] max-h-[min(24rem,70vh)] overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-xl z-[60] flex flex-col"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
            <span className="text-sm font-bold text-on-surface">Notifications</span>
            <button
              type="button"
              className="text-xs font-bold text-primary hover:underline"
              onClick={() => {
                setOpen(false);
                onOpenActivity();
              }}
            >
              View all
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ?
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant">Loading…</p>
            : !hasItems ?
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant">No recent activity yet.</p>
            : items!.map((it) => (
                <div key={it.id} className="border-b border-outline-variant/5 last:border-0">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container-high/80 transition-colors"
                    onClick={handleRowClick}
                  >
                    <div className="shrink-0 mt-0.5">{iconFor(it.kind)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{it.typeLabel}</p>
                      <p className="text-xs text-on-surface-variant truncate">{it.amountPrimary}</p>
                      <p className="text-[10px] text-outline mt-1">{formatTime(it.createdAt)}</p>
                    </div>
                    {it.explorerUrl ?
                      <a
                        href={it.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                        title="View on explorer"
                        aria-label="View on explorer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                      </a>
                    : null}
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      : null}
    </div>
  );
}
