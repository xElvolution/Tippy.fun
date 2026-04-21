/** List guild ids the bot is in (REST). May return [] if the token cannot use this endpoint. */
export async function fetchBotGuildIds(botToken: string): Promise<string[]> {
  const auth = `Bot ${botToken.trim()}`;
  const ids: string[] = [];
  let after: string | undefined;
  for (;;) {
    const url = new URL('https://discord.com/api/v10/users/@me/guilds');
    url.searchParams.set('limit', '200');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url.toString(), { headers: { Authorization: auth } });
    if (!res.ok) return ids;
    const batch = (await res.json()) as unknown;
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const g of batch) {
      if (typeof g === 'object' && g !== null && 'id' in g && typeof (g as { id: unknown }).id === 'string') {
        ids.push((g as { id: string }).id);
      }
    }
    if (batch.length < 200) break;
    const last = batch[batch.length - 1] as { id?: string };
    if (typeof last?.id !== 'string') break;
    after = last.id;
  }
  return ids;
}
