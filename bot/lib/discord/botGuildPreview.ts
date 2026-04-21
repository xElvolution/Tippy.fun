const DISCORD_API = 'https://discord.com/api/v10';

export async function fetchGuildApproximateMemberCount(
  botToken: string,
  guildId: string,
): Promise<number | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { approximate_member_count?: number };
  return typeof j.approximate_member_count === 'number' ? j.approximate_member_count : null;
}
