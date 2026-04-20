'use client';

import { useSearchParams } from 'next/navigation';
import { formatUnits } from 'viem';
import { OnChainLedger } from '@/components/OnChainLedger';
import { useCampaign } from '@/hooks/useTippyCampaigns';
import { explorerAddressUrl, getActiveChain, shortAddress } from '@/lib/conflux';
import { getTippyAddress, MODE_BOUNTY } from '@/lib/contracts';

export function CampaignFundsClient() {
  const params = useSearchParams();
  const idParam = params.get('id');
  const configured = Boolean(getTippyAddress());
  const chain = getActiveChain();
  const idBig = idParam
    ? (() => {
        try {
          return BigInt(idParam);
        } catch {
          return undefined;
        }
      })()
    : undefined;
  const { campaign } = useCampaign(idBig);

  const token = campaign?.tokenInfo;
  const symbol = token?.key ?? chain.nativeCurrency.symbol;
  const decimals = token?.decimals ?? 18;
  const fmt = (v?: bigint) => (v === undefined ? '—' : `${formatUnits(v, decimals)} ${symbol}`);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-headline text-on-surface mb-2">Funds &amp; ledger</h2>
        <p className="text-on-surface-variant max-w-xl body-md leading-relaxed">
          <strong className="text-on-surface">Inflows, outflows, and audit trail</strong> for this
          campaign pool. Verifiable on-chain via {chain.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <Tile label="Current pool" value={fmt(campaign?.prizePool)} accent />
        <Tile label="Distributed" value={fmt(campaign?.totalPaidOut)} />
        <Tile
          label="Reserved for winners"
          value={fmt(campaign?.totalEntitled)}
          hint={
            campaign && Number(campaign.mode) === MODE_BOUNTY
              ? 'Awaiting claim'
              : 'N/A for Tip mode'
          }
        />
        <Tile label="Total funded" value={fmt(campaign?.totalFunded)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <OnChainLedger campaignId={idParam ?? null} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <h4 className="text-xl font-bold font-headline text-on-surface">Escrow details</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Funds are held by the non-custodial <code className="font-mono">TippyMaker</code>{' '}
              contract on {chain.name}. Only the organizer can settle winners, trigger tip
              payouts, reclaim unclaimed prizes, or finalize the campaign.
            </p>
            <div className="pt-4 space-y-3">
              <Row label="Contract">
                {configured ? (
                  <a
                    href={explorerAddressUrl(
                      (process.env.NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS as string) ?? '',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    {shortAddress(process.env.NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS)}
                  </a>
                ) : (
                  <span className="text-on-surface-variant text-xs">Not deployed</span>
                )}
              </Row>
              <Row label="Prize token">
                <span className="font-semibold">{symbol}</span>
              </Row>
              <Row label="Organizer">
                {campaign ? (
                  <a
                    href={explorerAddressUrl(campaign.organizer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    {shortAddress(campaign.organizer)}
                  </a>
                ) : (
                  <span className="text-on-surface-variant text-xs">—</span>
                )}
              </Row>
              <Row label="Campaign">
                <span className="font-bold">
                  {campaign ? `#${campaign.id.toString()}` : '—'}
                </span>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(17,28,45,0.06)] min-w-0">
      <p className="text-on-surface-variant text-xs font-medium mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-headline ${
          accent ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {value}
      </p>
      {hint ? <p className="text-[10px] text-on-surface-variant mt-1">{hint}</p> : null}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      {children}
    </div>
  );
}
