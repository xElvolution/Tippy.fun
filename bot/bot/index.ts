import './loadEnv';
import {
  Client,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type Interaction,
} from 'discord.js';
import { commandData, registerSlashCommands } from './registerCommands';
import { isSupabaseConfigured, isEncryptionConfigured } from '../lib/env';
import { createUserFromDiscord, getUserByDiscordId, getPrivateKeyHexForUser } from '../lib/db/users';
import { recordTip } from '../lib/db/tips';
import * as pointsDb from '../lib/db/points';
import { sendNativeCfxTip, sendErc20HumanTip } from '../lib/conflux/transfer';
import { transactionExplorerUrl } from '../lib/conflux/explorer';
import { broadcastMasterTipRequestPointToken, masterTipContractAddress } from '../lib/conflux/masterTip';
import { resolveTipTokenInput, tipTokenAutocompleteChoices } from '../lib/discord/tipToken';
import { buildDiscordWalletBalanceText } from '../lib/discord/walletBalanceText';

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

if (!token || !clientId) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in .env');
  process.exit(1);
}

function configError(): string | null {
  if (!isSupabaseConfigured()) {
    return (
      'Database is not configured. Set the required database environment variables and apply migrations.'
    );
  }
  if (!isEncryptionConfigured()) {
    return (
      'Missing **ENCRYPTION_KEY** (64 hex characters). Generate with:\n`node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"`'
    );
  }
  return null;
}

function requireGuild(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    throw new Error('This command only works inside a server.');
  }
  return interaction.guild;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  const cfg = configError();
  if (cfg) console.warn('[tippy]', cfg);
  try {
    const guildIds = [...c.guilds.cache.keys()];
    await registerSlashCommands(token, clientId, guildIds);
    console.log(
      `[tippy] Registered ${commandData.length} **global** slash commands; cleared per-guild overrides in ${guildIds.length} server(s) (no DISCORD_GUILD_ID needed). Globals may take up to ~1h to refresh everywhere.`,
    );
  } catch (e) {
    console.error('Failed to register commands:', e);
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (interaction.isAutocomplete()) {
    try {
      if (interaction.commandName === 'tip' && interaction.options.getFocused(true).name === 'token') {
        const err = configError();
        if (err) {
          await interaction.respond([{ name: 'CFX (native)', value: 'cfx' }]);
          return;
        }
        const row = await getUserByDiscordId(interaction.user.id);
        const all = await tipTokenAutocompleteChoices(row?.id ?? null);
        const q = interaction.options.getFocused(true).value.trim().toLowerCase();
        const filtered =
          q.length === 0 ?
            all
          : all.filter(
              (c) => c.name.toLowerCase().includes(q) || String(c.value).toLowerCase().includes(q),
            );
        await interaction.respond(filtered.slice(0, 25));
      }
    } catch (e) {
      console.error(e);
      await interaction.respond([{ name: 'CFX (native)', value: 'cfx' }]).catch(() => {});
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'ping': {
        const sent = await interaction.reply({ content: 'Pong…', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Latency **${latency}ms** · API **${Math.round(client.ws.ping)}ms**`);
        break;
      }
      case 'help': {
        const embed = new EmbedBuilder()
          .setColor(0x0062ce)
          .setTitle('Tippy - Conflux eSpace')
          .setDescription(
            [
              '`/register` - create custodial **Conflux eSpace** wallet (stored securely)',
              '`/balance` - **CFX**, optional test ERC-20, dashboard watchlist, **project points**',
              '`/tip` - send **CFX** or **ERC-20** watchlist / env test token on-chain',
              '`/points` - capped **project points** for this server (owner: create/mint)',
              '`/wallet` - web dashboard URL',
              '`/ping` - latency',
              '',
              `Network: **Conflux eSpace ${(process.env.CONFLUX_NETWORK ?? 'testnet').toLowerCase()}**`,
            ].join('\n'),
          );
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'register': {
        const err = configError();
        if (err) {
          await interaction.reply({ content: err, ephemeral: true });
          break;
        }
        const u = interaction.user;
        const avatar = u.avatarURL({ size: 128 }) ?? null;
        const { user, created } = await createUserFromDiscord({
          discordId: u.id,
          username: u.username,
          globalName: u.globalName,
          avatarUrl: avatar,
        });
        await interaction.reply({
          content: created
            ? `Wallet created. **Conflux eSpace address:**\n\`${user.evm_address}\`\n\nFund it on **${
                process.env.CONFLUX_NETWORK ?? 'testnet'
              }** with CFX for gas + tips, then use \`/balance\` and \`/tip\`.`
            : `You already have a wallet: \`${user.evm_address}\``,
          ephemeral: true,
        });
        break;
      }
      case 'balance': {
        const err = configError();
        if (err) {
          await interaction.reply({ content: err, ephemeral: true });
          break;
        }
        const row = await getUserByDiscordId(interaction.user.id);
        if (!row) {
          await interaction.reply({ content: 'Use `/register` first.', ephemeral: true });
          break;
        }
        await interaction.deferReply({ ephemeral: true });
        try {
          const text = await buildDiscordWalletBalanceText({
            evmAddress: row.evm_address,
            userId: row.id,
          });
          if (text.length <= 2000) {
            await interaction.editReply({ content: text });
          } else {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(0xadc7ff)
                  .setTitle('Balances & points')
                  .setDescription(text),
              ],
            });
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await interaction.editReply({ content: `Could not load balances: ${msg}` });
        }
        break;
      }
      case 'tip': {
        const err = configError();
        if (err) {
          await interaction.reply({ content: err, ephemeral: true });
          break;
        }
        const target = interaction.options.getUser('user', true);
        const amount = interaction.options.getNumber('amount', true);
        const tokenRaw = interaction.options.getString('token');
        const fromDiscord = interaction.user.id;
        const toDiscord = target.id;

        await interaction.deferReply();

        const fromRow = await getUserByDiscordId(fromDiscord);
        const toRow = await getUserByDiscordId(toDiscord);
        if (!fromRow || !toRow) {
          await interaction.editReply('Both you and the recipient must run `/register` first.');
          break;
        }
        if (fromDiscord === toDiscord) {
          await interaction.editReply('You cannot tip yourself.');
          break;
        }

        let resolved;
        try {
          resolved = await resolveTipTokenInput(tokenRaw, fromRow.id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await interaction.editReply(msg);
          break;
        }

        const pk = await getPrivateKeyHexForUser(fromDiscord);
        if (!pk) {
          await interaction.editReply('Could not load signing key.');
          break;
        }

        try {
          const { txHash } =
            resolved.kind === 'native' ?
              await sendNativeCfxTip({
                privateKeyHex: pk,
                fromAddress: fromRow.evm_address,
                toAddress: toRow.evm_address,
                amountHuman: amount,
              })
            : await sendErc20HumanTip({
                privateKeyHex: pk,
                fromAddress: fromRow.evm_address,
                toAddress: toRow.evm_address,
                contractAddress: resolved.contract,
                decimals: resolved.decimals,
                amountHuman: amount,
              });

          await recordTip({
            fromUserId: fromRow.id,
            toUserId: toRow.id,
            denom: resolved.recordDenom,
            amount: String(amount),
            txHash,
            status: 'success',
          });
          const explorer = transactionExplorerUrl(txHash);
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xadc7ff)
                .setTitle('Tip broadcast')
                .setDescription(
                  `Sent **${amount} ${resolved.displayLabel}** to <@${toDiscord}>.\n**Tx:** \`${txHash}\`\n[Explorer](${explorer})`,
                ),
            ],
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await recordTip({
            fromUserId: fromRow.id,
            toUserId: toRow.id,
            denom: resolved.recordDenom,
            amount: String(amount),
            txHash: null,
            status: 'failed',
            error: msg,
          });
          await interaction.editReply(`Tip failed: ${msg}`);
        }
        break;
      }
      case 'wallet': {
        await interaction.reply({
          content: `Web app: **${appUrl}**\n(Set \`NEXT_PUBLIC_APP_URL\` if needed.)`,
          ephemeral: true,
        });
        break;
      }
      case 'points': {
        const err = configError();
        if (err) {
          await interaction.reply({ content: err, ephemeral: true });
          break;
        }
        const guild = requireGuild(interaction);
        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
          if (guild.ownerId !== interaction.user.id) {
            await interaction.reply({ content: 'Only the **guild owner** can create project points.', ephemeral: true });
            break;
          }
          const name = interaction.options.getString('name', true);
          const symbol = interaction.options.getString('symbol', true);
          const cap = interaction.options.getString('cap', true);

          await interaction.deferReply({ ephemeral: true });

          try {
            const row = await pointsDb.createPointCurrency({
              guildId: guild.id,
              channelId: interaction.channelId,
              ownerDiscordId: interaction.user.id,
              name,
              symbol,
              cap,
            });
            let chainLine = '';
            if (masterTipContractAddress() && isEncryptionConfigured()) {
              try {
                const ownerRow = await getUserByDiscordId(interaction.user.id);
                if (!ownerRow) {
                  chainLine = '\n_On-chain MasterTip skipped: run `/register` first._';
                } else {
                  const pk = await getPrivateKeyHexForUser(interaction.user.id);
                  if (!pk) {
                    chainLine = '\n_On-chain MasterTip skipped: could not decrypt wallet._';
                  } else {
                    const { transactionHash } = await broadcastMasterTipRequestPointToken({
                      privateKeyHex: pk,
                      senderAddress: ownerRow.evm_address,
                      guildId: guild.id,
                      displayName: name,
                      symbol,
                      supplyCap: cap,
                    });
                    chainLine = `\n**MasterTip tx:** ${transactionExplorerUrl(transactionHash)}`;
                  }
                }
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                chainLine = `\n_MasterTip call failed: ${msg.slice(0, 400)}_`;
              }
            } else if (!masterTipContractAddress()) {
              chainLine = '\n_Set `MASTER_TIP_CONTRACT` in .env to log this create on-chain._';
            }
            await interaction.editReply({
              content: `Created **${row.name} (${row.symbol})** · cap \`${row.cap}\` · id \`${row.id}\`${chainLine}`.slice(0, 1950),
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await interaction.editReply({ content: `Create failed: ${msg.slice(0, 1900)}` });
          }
          break;
        }

        if (sub === 'list') {
          const rows = await pointsDb.listPointCurrenciesForGuild(guild.id);
          if (!rows.length) {
            await interaction.reply({ content: 'No point currencies yet. Owner runs `/points create`.', ephemeral: true });
            break;
          }
          const lines = rows.map((r) => `• \`${r.id}\` - **${r.name}** (${r.symbol}) · minted ${r.minted_total}/${r.cap}`);
          await interaction.reply({ content: lines.join('\n').slice(0, 1900), ephemeral: true });
          break;
        }

        if (sub === 'mint') {
          if (guild.ownerId !== interaction.user.id) {
            await interaction.reply({ content: 'Only the **guild owner** can mint.', ephemeral: true });
            break;
          }
          const currencyId = interaction.options.getString('currency', true);
          const target = interaction.options.getUser('user', true);
          const amount = interaction.options.getString('amount', true);
          const targetRow = await getUserByDiscordId(target.id);
          if (!targetRow) {
            await interaction.reply({ content: 'Recipient must `/register` first.', ephemeral: true });
            break;
          }
          await interaction.deferReply({ ephemeral: true });
          try {
            await pointsDb.mintPoints({
              currencyId,
              guildId: guild.id,
              guildOwnerDiscordId: guild.ownerId,
              issuerDiscordId: interaction.user.id,
              toUserId: targetRow.id,
              amount,
            });
            await interaction.editReply({ content: `Minted **${amount}** to <@${target.id}>.` });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await interaction.editReply({ content: `Mint failed: ${msg.slice(0, 1900)}` });
          }
          break;
        }

        if (sub === 'send') {
          const currencyId = interaction.options.getString('currency', true);
          const target = interaction.options.getUser('user', true);
          const amount = interaction.options.getString('amount', true);
          const fromRow = await getUserByDiscordId(interaction.user.id);
          const toRow = await getUserByDiscordId(target.id);
          if (!fromRow || !toRow) {
            await interaction.reply({ content: 'Both users must `/register` first.', ephemeral: true });
            break;
          }
          await interaction.deferReply({ ephemeral: true });
          try {
            await pointsDb.transferPoints({
              currencyId,
              guildId: guild.id,
              fromUserId: fromRow.id,
              toUserId: toRow.id,
              amount,
            });
            await interaction.editReply({ content: `Sent **${amount}** points to <@${target.id}>.` });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await interaction.editReply({ content: `Send failed: ${msg.slice(0, 1900)}` });
          }
          break;
        }

        if (sub === 'balance') {
          const currencyId = interaction.options.getString('currency', true);
          const row = await getUserByDiscordId(interaction.user.id);
          if (!row) {
            await interaction.reply({ content: 'Use `/register` first.', ephemeral: true });
            break;
          }
          const b = await pointsDb.getPointBalance(currencyId, row.id);
          await interaction.reply({ content: `Your balance: **${b}**`, ephemeral: true });
          break;
        }

        await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        break;
      }
      default:
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Something went wrong running this command.';
    if (interaction.deferred) {
      await interaction.editReply({ content: msg }).catch(() =>
        interaction.followUp({ content: msg, ephemeral: true }).catch(() => {}),
      );
    } else if (interaction.replied) {
      await interaction.followUp({ content: msg, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

void client.login(token);
