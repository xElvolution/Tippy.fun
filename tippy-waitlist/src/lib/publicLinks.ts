/** Client-safe defaults; override with NEXT_PUBLIC_* in .env.local */

export function docsUrl(): string {
  return process.env.NEXT_PUBLIC_LEARN_URL?.trim() || "https://doc.confluxnetwork.org/";
}

export function communityDiscordUrl(): string {
  return process.env.NEXT_PUBLIC_COMMUNITY_DISCORD_URL?.trim() || "https://discord.com/invite/conflux";
}

export function confluxXUrl(): string {
  return process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || "https://x.com/Conflux_Network";
}

export function tippyAppUrl(): string {
  return process.env.NEXT_PUBLIC_TIPPY_APP_URL?.trim() || "http://localhost:3000";
}
