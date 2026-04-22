import { getActiveChain } from '@/lib/conflux';

/**
 * Outbound links for the public shell (header / sidebar / footer). All of these
 * are overridable via `.env.local`, but the defaults point at real Conflux
 * endpoints so nothing on the site links to a placeholder.
 */
export function publicDocsUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_DOCS_URL?.trim() || 'https://doc.confluxnetwork.org/';
}

export function publicDiscordUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_DISCORD_URL?.trim() || '';
}

export function publicTelegramUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_TELEGRAM_URL?.trim() || '';
}

/**
 * Where the "Install bot" / "Integrations & bots" buttons point.
 * Leave unset to hide those CTAs; set in `.env.local` when the hosted bot page
 * is live.
 */
export function publicBotInstallUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_BOT_INSTALL_URL?.trim() || '';
}

/** Active Conflux chain explorer. Never falls back to Etherscan. */
export function publicExplorerUrl(): string {
  const override = process.env.NEXT_PUBLIC_EXPLORER_URL?.trim();
  if (override) return override;
  return getActiveChain().blockExplorers.default.url;
}
