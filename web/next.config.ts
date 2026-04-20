import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: '/campaign_detail_judging_audit', destination: '/campaign/overview', permanent: false },
      { source: '/treasury_tx_history', destination: '/campaign/funds', permanent: false },
      { source: '/payout_portal', destination: '/campaign/payout', permanent: false },
      { source: '/account_settings', destination: '/settings/profile', permanent: false },
    ];
  },
};

export default nextConfig;
