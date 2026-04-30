'use client';

import React from 'react';
import {
  ArrowDown,
  Send,
  Download,
  Award,
  ExternalLink,
  Shield,
  AlertCircle,
  Landmark,
  Trash2,
  Plus,
  ChevronDown,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { Button, Card, AddressCopy, Badge } from './UI';
import type { Transaction } from '@/types/types';
import type { DashboardTipRow } from '@lib/db/tips';
import { getDiscordInviteUrl } from '@lib/discordInvite';

export type DepositPreview = {
  txHash: string;
  createdAt: string;
  amountHuman: string;
  fromAddress: string;
};

export type MeDashboardData = {
  registered: boolean;
  network: string;
  evmAddress: string | null;
  cfxBalance: string | null;
  /** Optional env token (`TEST_ERC20_CONTRACT`) shown as Test USDT. */
  testErc20Balance: string | null;
  /** User-added ERC-20 contracts from `user_dashboard_tokens` (stored as cw20). */
  customTokens: { id: string; label: string; tokenType: string; balance: string }[];
  otherTokenCount: number;
  points: { symbol: string; balance: string }[];
  tips: DashboardTipRow[];
  depositPreviews?: DepositPreview[];
  error?: string;
};

function formatPointsBalance(raw: string): string {
  try {
    const n = BigInt(raw);
    if (n >= 1000n) return `${(Number(n) / 1000).toFixed(1)}k`;
    return n.toString();
  } catch {
    return raw;
  }
}

type HoldingRow = {
  id: string;
  customTokenId?: string;
  letter: string;
  title: string;
  ticker: string;
  rail: string;
  amountLine: string;
  search: string;
};

function buildHoldingRows(d: MeDashboardData): HoldingRow[] {
  const rows: HoldingRow[] = [];
  const cfx = d.cfxBalance ?? '0';
  rows.push({
    id: 'native-cfx',
    letter: 'C',
    title: 'Conflux eSpace',
    ticker: 'CFX',
    rail: 'Native',
    amountLine: `${cfx} CFX`,
    search: 'conflux cfx native espace',
  });
  rows.push({
    id: 'test-erc20',
    letter: 'T',
    title: 'tUSDT0',
    ticker: 'USDT0',
    rail: 'USDT0 mock',
    amountLine: d.testErc20Balance ?? '0',
    search: 'tusdt0 usdt0 test erc20 env token',
  });
  for (const t of d.customTokens ?? []) {
    rows.push({
      id: `custom-${t.id}`,
      customTokenId: t.id,
      letter: (t.label || '?').slice(0, 1).toUpperCase(),
      title: t.label,
      ticker: t.tokenType === 'bank' ? 'Legacy' : 'ERC-20',
      rail: t.tokenType === 'bank' ? 'Legacy (not on eSpace)' : 'Custom ERC-20',
      amountLine: t.balance,
      search: `${t.label} ${t.tokenType} custom`.toLowerCase(),
    });
  }
  (d.points ?? []).forEach((p, idx) => {
    let amountLine: string;
    try {
      const n = BigInt(p.balance);
      amountLine = n === 0n ? `0 ${p.symbol}` : `${formatPointsBalance(p.balance)} ${p.symbol}`;
    } catch {
      amountLine = `${p.balance} ${p.symbol}`;
    }
    rows.push({
      id: `points-${idx}-${p.symbol}`,
      letter: p.symbol.slice(0, 1).toUpperCase(),
      title: `${p.symbol} points`,
      ticker: p.symbol,
      rail: 'Project points',
      amountLine,
      search: `${p.symbol} points discord guild`,
    });
  });
  return rows;
}

/** Uses dashboard `network` from the API. Conflux Scan (eSpace). */
function transactionExplorerUrlClient(network: string | undefined, txHash: string): string | undefined {
  if (!txHash || txHash === '-') return undefined;
  const net = (network ?? 'testnet').toLowerCase();
  const h = encodeURIComponent(txHash);
  const base = net === 'mainnet' ? 'https://evm.confluxscan.org' : 'https://evmtestnet.confluxscan.org';
  return `${base}/tx/${h}`;
}

function depositPreviewToTransaction(d: DepositPreview, network: string | undefined): Transaction {
  const created = new Date(d.createdAt);
  return {
    id: `deposit-${d.txHash}`,
    date: created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    time: created.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    type: 'Deposit',
    asset: 'CFX',
    assetRail: 'CFX',
    amount: `+ ${d.amountHuman} CFX`,
    fiatAmount: 'On-chain',
    counterparty: 'Incoming transfer',
    counterpartyAddress: d.fromAddress,
    txHash: d.txHash,
    explorerUrl: transactionExplorerUrlClient(network, d.txHash),
    status: 'COMPLETED',
  };
}

function tipRowsToTransactions(rows: DashboardTipRow[], network: string | undefined): Transaction[] {
  return rows.map((t) => {
    const d = new Date(t.createdAt);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const dl = t.denom.toLowerCase();
    const asset =
      dl === 'cfx' || dl === 'inj' ? 'CFX' : dl.startsWith('erc20:') || dl.startsWith('cw20:') ? 'ERC-20' : t.denom.toUpperCase();
    const sign = t.direction === 'sent' ? '-' : '+';
    const st = t.status.toUpperCase();
    let status: Transaction['status'] = 'PROCESSING';
    if (st === 'SUCCESS') status = 'CONFIRMED';
    else if (st === 'FAILED') status = 'FAILED';
    else if (st === 'PENDING') status = 'PROCESSING';
    return {
      id: t.id,
      date: dateStr,
      time: timeStr,
      type: t.direction === 'sent' ? 'Tip Sent' : 'Tip Received',
      asset,
      assetRail: 'CFX',
      amount: `${sign} ${t.amount} ${asset}`,
      fiatAmount: 'On-chain',
      counterparty: t.counterpartyUsername,
      counterpartyAddress: t.counterpartyAddress,
      txHash: t.txHash ?? '-',
      explorerUrl: t.txHash ? transactionExplorerUrlClient(network, t.txHash) : undefined,
      status,
    };
  });
}

export const Dashboard = ({
  onWithdraw,
  onDeposit,
  onRefresh,
  data,
  loading,
  loadError,
}: {
  onWithdraw: () => void;
  onDeposit: () => void;
  /** Reload dashboard after changing tracked tokens */
  onRefresh?: () => void;
  data: MeDashboardData | null;
  loading: boolean;
  loadError: string | null;
}) => {
  const [addType] = React.useState<'cw20'>('cw20');
  const [addRef, setAddRef] = React.useState('');
  const [addLabel, setAddLabel] = React.useState('');
  const [addDecimals, setAddDecimals] = React.useState('6');
  const [addBusy, setAddBusy] = React.useState(false);
  const [addErr, setAddErr] = React.useState<string | null>(null);
  const [holdingsOpen, setHoldingsOpen] = React.useState(false);
  const [holdingsSearch, setHoldingsSearch] = React.useState('');
  const holdingsPopoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!holdingsOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = holdingsPopoverRef.current;
      if (el && !el.contains(e.target as Node)) setHoldingsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHoldingsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [holdingsOpen]);

  const removeToken = async (id: string) => {
    try {
      const res = await fetch(`/api/me/dashboard-tokens?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error || res.statusText);
      onRefresh?.();
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : String(e));
    }
  };

  const addToken = async () => {
    setAddErr(null);
    setAddBusy(true);
    try {
      const decimals = Number.parseInt(addDecimals, 10);
      const res = await fetch('/api/me/dashboard-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenType: addType,
          ref: addRef.trim(),
          label: addLabel.trim() || 'Token',
          decimals: Number.isFinite(decimals) ? decimals : 6,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error || res.statusText);
      setAddRef('');
      setAddLabel('');
      onRefresh?.();
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : String(e));
    } finally {
      setAddBusy(false);
    }
  };
  const net = data?.network;
  const merged: { at: number; tx: Transaction }[] = [];
  if (data?.tips?.length) {
    for (const t of data.tips) {
      const tx = tipRowsToTransactions([t], net)[0];
      merged.push({ at: new Date(t.createdAt).getTime(), tx });
    }
  }
  if (data?.depositPreviews?.length) {
    for (const d of data.depositPreviews) {
      merged.push({ at: new Date(d.createdAt).getTime(), tx: depositPreviewToTransaction(d, net) });
    }
  }
  merged.sort((a, b) => b.at - a.at);
  const transactions: Transaction[] = merged.slice(0, 12).map((m) => m.tx);

  const holdingRows = React.useMemo(() => (data && data.registered ? buildHoldingRows(data) : []), [data]);

  const filteredHoldings = React.useMemo(() => {
    const q = holdingsSearch.trim().toLowerCase();
    if (!q) return holdingRows;
    return holdingRows.filter((r) => r.search.includes(q) || r.title.toLowerCase().includes(q) || r.ticker.toLowerCase().includes(q));
  }, [holdingRows, holdingsSearch]);

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-2xl p-8 min-h-[320px] bg-surface-container-low border border-outline-variant/5" />
          <div className="lg:col-span-4 rounded-2xl p-6 min-h-[280px] bg-surface-container-low border border-outline-variant/5" />
        </div>
        <div className="h-64 rounded-2xl bg-surface-container-low border border-outline-variant/5" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="p-8 flex gap-4 items-start border-error/30 bg-error-container/10">
        <AlertCircle className="text-error shrink-0 mt-0.5" size={22} />
        <div>
          <p className="font-headline font-bold text-error mb-1">Could not load wallet data</p>
          <p className="text-sm text-on-surface-variant">{loadError}</p>
        </div>
      </Card>
    );
  }

  if (data && !data.registered) {
    const discordInviteUrl = getDiscordInviteUrl();

    return (
      <Card className="p-10 text-center max-w-xl mx-auto">
        <p className="font-headline text-xl font-bold text-on-surface mb-3">No Tippy wallet yet</p>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
          Open Discord, go to a server with Tippy, and run <strong className="text-on-surface">/register</strong>. Then refresh this
          page - your Conflux eSpace address and CFX balance will show here.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button variant="secondary" className="min-w-[130px]" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          {discordInviteUrl ? (
            <Button variant="outline" className="min-w-[130px]" href={discordInviteUrl}>
              Add bot
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }

  const cfxBal = data?.cfxBalance ?? '0';
  const networkLabel =
    (data?.network ?? 'testnet').toLowerCase() === 'mainnet' ? 'Conflux eSpace mainnet' : 'Conflux eSpace testnet';

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-8 relative overflow-visible flex flex-col justify-between min-h-[280px]">
          <div className="relative z-10">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-headline font-bold tracking-wider uppercase text-[0.6875rem] text-on-surface-variant">CFX balance</p>
              <Button
                variant="ghost"
                className="!px-2.5 !py-2"
                onClick={() => {
                  if (onRefresh) onRefresh();
                  else window.location.reload();
                }}
                title="Refresh balance"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
            <h1 className="font-headline text-[3.5rem] font-extrabold text-on-surface tracking-tighter leading-none mb-2">
              {cfxBal} <span className="text-2xl text-on-surface-variant font-bold">CFX</span>
            </h1>
            <p className="text-sm text-on-surface-variant mb-6">{networkLabel} · live from chain</p>

            <div ref={holdingsPopoverRef} className="relative z-30">
              <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/80 flex items-stretch shadow-sm">
                <button
                  type="button"
                  onClick={() => setHoldingsOpen((o) => !o)}
                  className="flex-1 flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-surface-container-high/40 transition-colors min-w-0 rounded-l-xl"
                  aria-expanded={holdingsOpen}
                  aria-haspopup="listbox"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
                      Token & points holdings
                    </p>
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {holdingRows.length} asset{holdingRows.length === 1 ? '' : 's'} at this address
                      <span className="text-on-surface-variant font-normal"> · ERC-20, points</span>
                    </p>
                  </div>
                  <ChevronDown
                    size={22}
                    className={`shrink-0 text-on-surface-variant transition-transform ${holdingsOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                <div className="w-px bg-outline-variant/20 self-stretch" aria-hidden />
                <button
                  type="button"
                  onClick={() => setHoldingsOpen((o) => !o)}
                  className="flex items-center justify-center px-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 transition-colors rounded-r-xl"
                  title="Toggle holdings"
                  aria-label="Toggle token and points list"
                >
                  <Coins size={20} />
                </button>
              </div>

              {holdingsOpen ?
                <div
                  className="absolute left-0 right-0 top-full z-[100] mt-2 flex w-full flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-[0_16px_50px_-12px_rgba(0,0,0,0.55)] ring-1 ring-black/20 dark:ring-white/10"
                  role="listbox"
                >
                  <div className="shrink-0 border-b border-outline-variant/20 bg-surface-container-lowest/90 px-3 py-2.5">
                    <input
                      type="search"
                      value={holdingsSearch}
                      onChange={(e) => setHoldingsSearch(e.target.value)}
                      placeholder="Search token or points"
                      className="w-full rounded-lg bg-surface-container-high border border-outline-variant/25 px-3 py-2 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="max-h-[min(17.5rem,50vh)] overflow-y-auto overscroll-contain divide-y divide-outline-variant/10">
                    {filteredHoldings.length === 0 ?
                      <p className="px-4 py-8 text-center text-sm text-on-surface-variant">No matches.</p>
                    : filteredHoldings.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high/25 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center text-sm font-bold text-on-surface shrink-0">
                            {row.letter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {row.title}{' '}
                              <span className="text-on-surface-variant font-normal">({row.ticker})</span>
                            </p>
                            <p className="text-[11px] text-on-surface-variant truncate">{row.rail}</p>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <p className="text-sm font-bold font-mono text-on-surface tabular-nums">{row.amountLine}</p>
                            <p className="text-[10px] text-on-surface-variant">Wallet &amp; points</p>
                          </div>
                          {row.customTokenId ?
                            <button
                              type="button"
                              onClick={() => void removeToken(row.customTokenId!)}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
                              aria-label={`Remove ${row.title}`}
                              title="Remove from list"
                            >
                              <Trash2 size={16} />
                            </button>
                          : <span className="w-9 shrink-0" aria-hidden />}
                        </div>
                      ))
                    }
                  </div>
                  <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest/95 px-3 py-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Track another token</p>
                    {addErr ? <p className="text-xs text-error">{addErr}</p> : null}
                    <div className="flex flex-wrap gap-2 items-end">
                      <span className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-2 py-2 text-xs text-on-surface">
                        ERC-20
                      </span>
                      <input
                        className="flex-1 min-w-[120px] rounded-lg bg-surface-container-high border border-outline-variant/30 px-2 py-2 text-xs text-on-surface placeholder:text-outline/40"
                        placeholder="0x… contract"
                        value={addRef}
                        onChange={(e) => setAddRef(e.target.value)}
                      />
                      <input
                        className="w-24 rounded-lg bg-surface-container-high border border-outline-variant/30 px-2 py-2 text-xs text-on-surface placeholder:text-outline/40"
                        placeholder="Label"
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                      />
                      <input
                        className="w-12 rounded-lg bg-surface-container-high border border-outline-variant/30 px-1 py-2 text-xs text-on-surface"
                        placeholder="Dec"
                        value={addDecimals}
                        onChange={(e) => setAddDecimals(e.target.value)}
                      />
                      <Button
                        className="!px-3 !py-2 text-xs shrink-0"
                        disabled={addBusy || !addRef.trim()}
                        onClick={() => void addToken()}
                      >
                        <Plus size={14} />
                        {addBusy ? '…' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>
              : null}
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 bottom-0 z-0 w-64 h-64 bg-primary-container/10 blur-[100px] rounded-full -mr-20 -mb-20 overflow-hidden" />
        </Card>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Shield size={20} />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Deposit address</span>
            </div>
            <div className="mb-auto">
              <p className="text-xs text-on-surface-variant mb-2 font-medium">Your Conflux eSpace address</p>
              {data?.evmAddress ?
                <AddressCopy address={data.evmAddress} />
              : <p className="text-sm text-on-surface-variant">-</p>}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button className="w-full" onClick={onDeposit} disabled={!data?.evmAddress}>
                <ArrowDown size={18} />
                Deposit Assets
              </Button>
              <Button variant="secondary" className="w-full" onClick={onWithdraw} disabled={!data?.evmAddress}>
                Manage Wallet
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">Recent activity</h2>
        </div>

        <Card className="overflow-hidden">
          {transactions.length === 0 ?
            <p className="px-8 py-12 text-center text-sm text-on-surface-variant">
              No recent activity yet. Incoming transfers and tips will show here when they&apos;re detected for your wallet.
            </p>
          : <>
              <div className="grid grid-cols-12 px-8 py-4 border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <div className="col-span-3">Asset & Type</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-4">Counterparty</div>
                <div className="col-span-2 text-right">Status</div>
                <div className="col-span-1" />
              </div>
              <div className="divide-y divide-outline-variant/5">
                {transactions.map((tx) => (
                  <div key={tx.id} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-surface-container/50 transition-colors">
                    <div className="col-span-3 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.assetRail === 'CFX' ?
                            'bg-tertiary-container/20 text-tertiary'
                          : tx.assetRail === 'TOKEN' ?
                            'bg-secondary-container/20 text-secondary'
                          : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {tx.type === 'Deposit' ?
                          <Landmark size={16} />
                        : tx.type.includes('Sent') ?
                          <Send size={16} />
                        : tx.type.includes('Received') ?
                          <Download size={16} />
                        : <Award size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{tx.type}</span>
                        <Badge variant={tx.assetRail === 'CFX' ? 'tertiary' : tx.assetRail === 'TOKEN' ? 'secondary' : 'primary'}>
                          {tx.assetRail} Rail
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className={`text-sm font-bold ${tx.amount.startsWith('+') ? 'text-primary' : ''}`}>{tx.amount}</span>
                      <span className="text-[10px] text-on-surface-variant">{tx.fiatAmount}</span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield size={12} className="text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{tx.counterparty}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono truncate">{tx.counterpartyAddress}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <Badge
                        variant={
                          tx.status === 'CONFIRMED' || tx.status === 'SETTLED' || tx.status === 'COMPLETED' ?
                            'success'
                          : 'secondary'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-right">
                      {tx.explorerUrl ?
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-on-surface-variant hover:text-on-surface transition-colors inline-flex"
                          aria-label="View transaction"
                        >
                          <ExternalLink size={18} />
                        </a>
                      : <span className="text-outline">-</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          }
        </Card>
      </div>
    </div>
  );
};
