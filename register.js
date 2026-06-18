import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const commands = [];
const folders = readdirSync(join(__dirname, 'src/commands'));
for (const folder of folders) {
  const files = readdirSync(join(__dirname, `src/commands/${folder}`)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const { default: cmd } = await import(`./src/commands/${folder}/${file}`);
    if (cmd.data) commands.push(cmd.data.toJSON());
  }
}
const rest = new REST().setToken(process.env.TOKEN);
await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
console.log('Commands registered successfully!');
