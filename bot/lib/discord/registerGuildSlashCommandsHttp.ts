import slashCommandsPayload from './slashCommandsPayload.json';
import { fetchBotGuildIds } from './fetchBotGuildIds';

const DISCORD_API = 'https://discord.com/api/v10';

/**
 * Pushes **global** slash commands and clears per-guild overrides everywhere the bot is in
 * (same as the bot on startup). `guildId` is only used as a fallback when the guild list
 * cannot be fetched (ensures at least the caller’s server is cleared).
 */
export async function registerSlashCommandsForGuildHttp(
  botToken: string,
  applicationId: string,
  guildId: string,
): Promise<void> {
  const globalUrl = `${DISCORD_API}/applications/${applicationId}/commands`;
  const res = await fetch(globalUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(slashCommandsPayload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}`);
  }

  let ids = [...new Set(await fetchBotGuildIds(botToken))];
  if (!ids.includes(guildId)) ids.push(guildId);

  for (const gid of ids) {
    try {
      const url = `${DISCORD_API}/applications/${applicationId}/guilds/${gid}/commands`;
      const r = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([]),
      });
      if (!r.ok) throw new Error((await r.text()) || `${r.status}`);
    } catch (e) {
      console.warn(`[tippy] Could not clear guild slash overrides for ${gid}:`, e);
    }
  }
}

/** Removes all global application slash commands (PUT []). */
export async function clearGlobalSlashCommandsHttp(botToken: string, applicationId: string): Promise<void> {
  const url = `${DISCORD_API}/applications/${applicationId}/commands`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}`);
  }
}

/** Removes all application slash commands registered for this guild (PUT []). */
export async function clearGuildSlashCommandsHttp(
  botToken: string,
  applicationId: string,
  guildId: string,
): Promise<void> {
  const url = `${DISCORD_API}/applications/${applicationId}/guilds/${guildId}/commands`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}`);
  }
}
