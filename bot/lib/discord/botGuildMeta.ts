const DISCORD_API = 'https://discord.com/api/v10';

export type BotGuildPreview = {
  id: string;
  name: string;
  approximate_member_count: number | null;
};

export async function fetchGuildOwnerIdFromBot(token: string, guildId: string): Promise<string | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { owner_id?: string };
  return typeof j.owner_id === 'string' ? j.owner_id : null;
}

export async function fetchGuildFromBot(token: string, guildId: string): Promise<BotGuildPreview | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    id?: string;
    name?: string;
    approximate_member_count?: number;
  };
  return {
    id: j.id ?? guildId,
    name: j.name ?? guildId,
    approximate_member_count:
      typeof j.approximate_member_count === 'number' ? j.approximate_member_count : null,
  };
}
