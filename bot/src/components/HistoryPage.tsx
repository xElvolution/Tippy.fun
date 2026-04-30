'use client';

import React from 'react';
import { Search, ExternalLink, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';
import { Card, Badge, Button } from './UI';
import type { ActivityItemJson } from '@/types/activity';

type Filter = 'all' | 'tips' | 'withdrawals' | 'deposits';

export const HistoryPage = () => {
  const [items, setItems] = React.useState<ActivityItemJson[]>([]);
  const [registered, setRegistered] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>('all');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/me/activity')
      .then(async (res) => {
        const json = (await res.json()) as { items?: ActivityItemJson[]; registered?: boolean; error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setRegistered(json.registered !== false);
        setItems(json.items ?? []);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    let list = items;
    if (filter === 'tips') list = list.filter((i) => i.kind === 'tip_sent' || i.kind === 'tip_received');
    if (filter === 'withdrawals') list = list.filter((i) => i.kind === 'withdrawal');
    if (filter === 'deposits') list = list.filter((i) => i.kind === 'deposit');
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.counterparty.toLowerCase().includes(q) ||
        i.typeLabel.toLowerCase().includes(q) ||
        i.amountPrimary.toLowerCase().includes(q) ||
        (i.txHash && i.txHash.toLowerCase().includes(q)),
    );
  }, [items, filter, search]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-surface-container-low rounded-xl w-1/3" />
        <div className="h-64 bg-surface-container-low rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-error/30">
        <p className="font-bold text-error mb-2">Could not load activity</p>
        <p className="text-sm text-on-surface-variant">{error}</p>
      </Card>
    );
  }

  if (!registered) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <p className="text-on-surface font-headline font-bold mb-2">No wallet on file</p>
        <p className="text-sm text-on-surface-variant">Use /register in Discord, then refresh.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface">Activity history</h1>
          <p className="text-on-surface-variant text-lg">
            Tips and withdrawals tied to your account, plus incoming CFX deposits when we can associate them with your wallet.
          </p>
        </div>
        <div className="w-full md:w-96">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handle, amount, tx hash…"
              className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/50 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {(
          [
            ['all', 'All'],
            ['tips', 'Tips'],
            ['withdrawals', 'Withdrawals'],
            ['deposits', 'Deposits'],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'secondary'}
            className="px-6 py-2 rounded-full text-sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="px-8 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label">Date</th>
                <th className="px-6 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label">Type</th>
                <th className="px-6 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label">Asset</th>
                <th className="px-6 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label">Amount</th>
                <th className="px-6 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label">From / To</th>
                <th className="px-6 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label text-center">Tx</th>
                <th className="px-8 py-6 text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.length === 0 ?
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-sm text-on-surface-variant">
                    No rows match this filter.
                  </td>
                </tr>
              : filtered.map((tx) => {
                  const d = new Date(tx.createdAt);
                  const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                  const isRecv = tx.kind === 'tip_received';
                  const isWd = tx.kind === 'withdrawal';
                  const isDep = tx.kind === 'deposit';
                  return (
                    <tr key={tx.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-8 whitespace-nowrap">
                        <span className="text-on-surface font-medium block">{dateStr}</span>
                        <span className="text-on-surface-variant/60 text-xs">{timeStr}</span>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex items-center gap-3">
                          {isDep ?
                            <Landmark className="text-secondary" size={20} />
                          : isRecv ?
                            <ArrowDownLeft className="text-primary" size={20} />
                          : isWd ?
                            <ArrowUpRight className="text-error" size={20} />
                          : <ArrowUpRight className="text-tertiary" size={20} />}
                          <span className="text-on-surface font-semibold">{tx.typeLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <Badge variant={tx.assetRail === 'CFX' ? 'tertiary' : 'secondary'}>{tx.asset}</Badge>
                      </td>
                      <td className="px-6 py-8">
                        <span className="text-on-surface font-headline text-lg font-bold">{tx.amountPrimary}</span>
                        <span className="text-on-surface-variant/40 text-xs block">{tx.amountSecondary}</span>
                      </td>
                      <td className="px-6 py-8">
                        <span className="text-on-surface font-medium">{tx.counterparty}</span>
                      </td>
                      <td className="px-6 py-8 text-center">
                        {tx.explorerUrl ?
                          <a
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:opacity-80 inline-flex"
                            aria-label="View on explorer"
                          >
                            <ExternalLink size={20} />
                          </a>
                        : <span className="text-outline text-xs">-</span>}
                      </td>
                      <td className="px-8 py-8 text-right">
                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'FAILED' ? 'error' : 'secondary'}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-on-surface-variant/60 text-sm px-1">
        Showing {filtered.length} of {items.length} recorded events
      </p>
    </div>
  );
};
