'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo, useState } from 'react';
import { shortAddress, explorerAddressUrl, getActiveChain } from '@/lib/conflux';

export function ConnectWalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [open, setOpen] = useState(false);

  const activeWallet = useMemo(() => {
    if (!user) return null;
    const linked = user.wallet?.address;
    const fromWallets = wallets[0]?.address;
    return linked || fromWallets || null;
  }, [user, wallets]);

  const chain = getActiveChain();

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className="hero-gradient text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-lg opacity-70"
      >
        Connect wallet
      </button>
    );
  }

  if (!authenticated || !activeWallet) {
    return (
      <button
        type="button"
        onClick={() => login()}
        className="hero-gradient text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        Connect wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="h-2 w-2 rounded-full bg-tertiary" aria-hidden />
        <span className="hidden sm:inline">{shortAddress(activeWallet)}</span>
        <span className="sm:hidden">Wallet</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-64 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-xl dark:bg-surface-container-low"
        >
          <div className="px-4 py-3 border-b border-outline-variant/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Connected
            </p>
            <p className="mt-1 text-sm font-semibold text-on-surface break-all">
              {shortAddress(activeWallet, 6)}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">{chain.name}</p>
          </div>
          <div className="p-2 space-y-1">
            <a
              href={explorerAddressUrl(activeWallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container-high"
            >
              View on explorer
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container-high"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
