import './loadEnv';
import { REST, Routes } from 'discord.js';

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);
rest
  .put(Routes.applicationCommands(clientId), { body: [] })
  .then(() => {
    console.log('Removed all global application commands (bot will have no slash commands until you run register-commands or restart the bot).');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
