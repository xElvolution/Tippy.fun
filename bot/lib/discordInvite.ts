/**
 * OAuth invite for adding the bot to a server (public - safe to expose in the browser).
 * Matches docs/DISCORD_SETUP.md §2c: View Channels, Send Messages, Embed Links,
 * Read Message History, Use Slash Commands.
 */
export const DISCORD_BOT_PERMISSIONS = 2_147_568_640;

export function getDiscordInviteUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim();
  if (explicit) return explicit;

  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID?.trim();
  if (!clientId) return null;

  const q = new URLSearchParams({
    client_id: clientId,
    permissions: String(DISCORD_BOT_PERMISSIONS),
    scope: 'bot applications.commands',
  });
  return `https://discord.com/oauth2/authorize?${q.toString()}`;
}
