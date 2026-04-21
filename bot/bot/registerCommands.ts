import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { fetchBotGuildIds } from '../lib/discord/fetchBotGuildIds';

const points = new SlashCommandBuilder()
  .setName('points')
  .setDescription('Project points for this server (capped supply, stored in Supabase)')
  .addSubcommand((sc) =>
    sc
      .setName('create')
      .setDescription('Create a new points currency (guild owner only)')
      .addStringOption((o) => o.setName('name').setDescription('Display name').setRequired(true))
      .addStringOption((o) => o.setName('symbol').setDescription('Short symbol').setRequired(true))
      .addStringOption((o) => o.setName('cap').setDescription('Max supply (whole number as text)').setRequired(true)),
  )
  .addSubcommand((sc) => sc.setName('list').setDescription('List point currencies in this server'))
  .addSubcommand((sc) =>
    sc
      .setName('mint')
      .setDescription('Mint points to a member (guild owner only)')
      .addStringOption((o) => o.setName('currency').setDescription('Currency id from /points list').setRequired(true))
      .addUserOption((o) => o.setName('user').setDescription('Recipient').setRequired(true))
      .addStringOption((o) => o.setName('amount').setDescription('Amount to mint').setRequired(true)),
  )
  .addSubcommand((sc) =>
    sc
      .setName('send')
      .setDescription('Send your points to another member')
      .addStringOption((o) => o.setName('currency').setDescription('Currency id from /points list').setRequired(true))
      .addUserOption((o) => o.setName('user').setDescription('Recipient').setRequired(true))
      .addStringOption((o) => o.setName('amount').setDescription('Amount').setRequired(true)),
  )
  .addSubcommand((sc) =>
    sc
      .setName('balance')
      .setDescription('Show your balance for one currency')
      .addStringOption((o) => o.setName('currency').setDescription('Currency id from /points list').setRequired(true)),
  );

export const commandData = [
  new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  new SlashCommandBuilder().setName('help').setDescription('List Tippy commands'),
  new SlashCommandBuilder()
    .setName('register')
    .setDescription('Create your custodial Conflux eSpace wallet (stored encrypted in Supabase)'),
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('CFX, optional test ERC-20, dashboard ERC-20 watchlist, and project points'),
  new SlashCommandBuilder()
    .setName('tip')
    .setDescription('Send CFX or dashboard ERC-20 watchlist tokens to a registered member')
    .addUserOption((o) => o.setName('user').setDescription('Recipient (must /register)').setRequired(true))
    .addNumberOption((o) =>
      o.setName('amount').setDescription('Amount in human units (e.g. CFX or token decimals)').setRequired(true).setMinValue(0.00000001),
    )
    .addStringOption((o) =>
      o
        .setName('token')
        .setDescription('Token to send (default CFX). Type to search; add ERC-20 via web dashboard watchlist.')
        .setRequired(false)
        .setAutocomplete(true),
    ),
  new SlashCommandBuilder().setName('wallet').setDescription('Link to the web dashboard'),
  points,
].map((c) => c.toJSON());

/**
 * Registers **global** slash commands, then clears per-guild command overrides in every server
 * we can see (so `/ping` etc. do not appear twice). Discord merges global + guild definitions.
 *
 * @param guildIdsToClear — from `client.guilds.cache` when the bot is connected (best).
 *   If omitted or empty, uses `GET /users/@me/guilds` (may be empty for some bot tokens).
 */
export async function registerSlashCommands(
  token: string,
  clientId: string,
  guildIdsToClear?: string[],
): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(clientId), { body: commandData });

  let ids = [...new Set((guildIdsToClear ?? []).filter(Boolean))];
  if (ids.length === 0) {
    ids = await fetchBotGuildIds(token);
  }

  for (const gid of ids) {
    try {
      await rest.put(Routes.applicationGuildCommands(clientId, gid), { body: [] });
    } catch (e) {
      console.warn(`[tippy] Could not clear guild slash overrides for ${gid}:`, e);
    }
  }
}
