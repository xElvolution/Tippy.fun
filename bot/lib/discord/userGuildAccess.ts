const DISCORD_API = 'https://discord.com/api/v10';

const ADMINISTRATOR = 1n << 3n;
const MANAGE_GUILD = 1n << 5n;

export type DiscordUserGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string | number;
};

function parsePermissions(permissions: string | number): bigint {
  try {
    return BigInt(typeof permissions === 'number' ? permissions : permissions);
  } catch {
    return 0n;
  }
}

export function guildEntryIsManageable(g: Pick<DiscordUserGuild, 'owner' | 'permissions'>): boolean {
  if (g.owner) return true;
  const p = parsePermissions(g.permissions);
  return (p & ADMINISTRATOR) === ADMINISTRATOR || (p & MANAGE_GUILD) === MANAGE_GUILD;
}

export async function fetchDiscordUserGuilds(accessToken: string): Promise<DiscordUserGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord guilds request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as DiscordUserGuild[];
}

export async function userCanManageGuild(accessToken: string, guildId: string): Promise<boolean> {
  const guilds = await fetchDiscordUserGuilds(accessToken);
  const g = guilds.find((x) => x.id === guildId);
  return g != null && guildEntryIsManageable(g);
}
