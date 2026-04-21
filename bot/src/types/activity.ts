export type ActivityItemJson = {
  id: string;
  kind: 'tip_sent' | 'tip_received' | 'withdrawal' | 'deposit';
  createdAt: string;
  typeLabel: string;
  asset: string;
  assetRail: 'CFX' | 'TOKEN' | 'POINTS';
  amountPrimary: string;
  amountSecondary: string;
  counterparty: string;
  txHash: string | null;
  explorerUrl: string | null;
  status: string;
};
