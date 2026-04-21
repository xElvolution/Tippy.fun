import './loadEnv';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { commandData, registerSlashCommands } from './registerCommands';

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  try {
    const guildIds = [...c.guilds.cache.keys()];
    await registerSlashCommands(token, clientId, guildIds);
    console.log(
      `Registered ${commandData.length} global slash commands; cleared guild overrides in ${guildIds.length} server(s).`,
    );
    console.log('Note: global command updates can take up to ~1 hour to appear in every server.');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.destroy();
    process.exit(process.exitCode ?? 0);
  }
});

client.login(token).catch((e) => {
  console.error(e);
  process.exit(1);
});
