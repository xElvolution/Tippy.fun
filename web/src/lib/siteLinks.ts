/** Optional outbound links; set in `.env.local` for production. */
export function publicDocsUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_DOCS_URL?.trim() || 'https://tippy.fun';
}

export function publicDiscordUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_DISCORD_URL?.trim() || '#';
}

export function publicExplorerUrl(): string {
  return process.env.NEXT_PUBLIC_EXPLORER_URL?.trim() || 'https://etherscan.io';
}
