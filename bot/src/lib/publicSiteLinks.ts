/**
 * Client-safe outbound links (NEXT_PUBLIC_*). Keep NEXT_PUBLIC_CONFLUX_NETWORK aligned with CONFLUX_NETWORK for explorer.
 */
export function publicExplorerHomeUrl(): string {
  const custom = process.env.NEXT_PUBLIC_EXPLORER_URL?.trim();
  if (custom) return custom;
  const net = (process.env.NEXT_PUBLIC_CONFLUX_NETWORK ?? 'testnet').toLowerCase();
  return net === 'mainnet' ? 'https://evm.confluxscan.org' : 'https://evmtestnet.confluxscan.org';
}

/** Conflux community Discord (not the bot OAuth invite). */
export function publicCommunityDiscordUrl(): string {
  return process.env.NEXT_PUBLIC_COMMUNITY_DISCORD_URL?.trim() || 'https://discord.com/invite/conflux';
}

/** Official Conflux on X */
export function publicConfluxXUrl(): string {
  return process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || 'https://x.com/Conflux_Network';
}

/** Conflux docs / learn */
export function publicLearnUrl(): string {
  return process.env.NEXT_PUBLIC_LEARN_URL?.trim() || 'https://doc.confluxnetwork.org/';
}
