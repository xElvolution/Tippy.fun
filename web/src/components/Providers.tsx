'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import React from 'react';
import { confluxEspace, confluxEspaceTestnet, getActiveChain } from '@/lib/conflux';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';
const activeChain = getActiveChain();

const wagmiConfig = createConfig({
  chains: [confluxEspaceTestnet, confluxEspace],
  transports: {
    [confluxEspaceTestnet.id]: http(),
    [confluxEspace.id]: http(),
  },
});

function InnerProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  if (!appId) {
    // Render without Privy in dev when app id is missing, so the UI still works for visual QA.
    // Real wallet actions will surface a clear error via the hooks.
    return <InnerProviders>{children}</InnerProviders>;
  }
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'twitter', 'discord'],
        defaultChain: activeChain,
        supportedChains: [confluxEspaceTestnet, confluxEspace],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        appearance: {
          theme: 'light',
          accentColor: '#6B38D4',
          logo: undefined,
          walletChainType: 'ethereum-only',
        },
      }}
    >
      <InnerProviders>{children}</InnerProviders>
    </PrivyProvider>
  );
}
