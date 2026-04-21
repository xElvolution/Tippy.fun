export type AssetRail = 'CFX' | 'TOKEN' | 'POINTS';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: 'Tip Sent' | 'Tip Received' | 'Deposit' | 'Withdrawal' | 'Airdrop' | 'Reward Distributed';
  asset: string;
  assetRail: AssetRail;
  amount: string;
  fiatAmount?: string;
  counterparty: string;
  counterpartyAddress?: string;
  txHash: string;
  /** Block explorer link when `txHash` is a real chain hash */
  explorerUrl?: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'SETTLED' | 'CONFIRMED';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  ticker: string;
  /** Discord approximate member count when bot is in the server */
  members: number | null;
  pointsIssued: string;
  activeCampaigns: number;
  status: 'active' | 'inactive';
  rails: AssetRail[];
}

export type PointCurrencySummary = {
  id: string;
  guild_id: string;
  name: string;
  symbol: string;
  cap: string;
  minted_total: string;
  created_at: string;
};

export type ConsoleEcosystem = Project & { currencies: PointCurrencySummary[] };

export type ConsoleOverviewPayload = {
  needsReauth: boolean;
  network: string;
  envGuildId: string | null;
  stats: {
    aggregatedMembers: number;
    aggregatedMembersKnown: boolean;
    globalPointsSupplyFormatted: string;
    activeCampaigns: number;
    serverCount: number;
  };
  ecosystems: ConsoleEcosystem[];
};
