export function CampaignRulesBody() {
  return (
    <ul className="space-y-6">
      <li className="group flex gap-6">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-xl font-bold text-primary">
          1
        </div>
        <div>
          <h3 className="mb-1 text-lg font-bold">Verify Identity</h3>
          <p className="leading-relaxed text-on-surface-variant">
            Connect your wallet and link your Discord account to verify participant status.
          </p>
        </div>
      </li>
      <li className="group flex gap-6">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-xl font-bold text-primary">
          2
        </div>
        <div>
          <h3 className="mb-1 text-lg font-bold">Complete Quests</h3>
          <p className="leading-relaxed text-on-surface-variant">
            Engage in weekly tasks ranging from social sharing to technical testing on the testnet.
          </p>
        </div>
      </li>
      <li className="group flex gap-6">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-xl font-bold text-primary">
          3
        </div>
        <div>
          <h3 className="mb-1 text-lg font-bold">Claim Rewards</h3>
          <p className="leading-relaxed text-on-surface-variant">
            Accumulate points to climb the leaderboard and unlock tiered reward distributions.
          </p>
        </div>
      </li>
    </ul>
  );
}
