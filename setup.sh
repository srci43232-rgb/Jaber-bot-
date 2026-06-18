#!/data/data/com.termux/files/usr/bin/bash
pkg install nodejs-lts -y

cat > package.json << 'PKG'
{
  "name": "jaber-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": { "start": "node src/index.js" },
  "dependencies": {
    "discord.js": "^14.21.0",
    "dotenv": "^16.4.5",
    "fs-extra": "^11.2.0"
  }
}
PKG

cat >.env << 'ENV'
TOKEN=PUT_YOUR_TOKEN_HERE
CLIENT_ID=PUT_YOUR_CLIENT_ID_HERE
GUILD_ID=PUT_YOUR_GUILD_ID_HERE
ENV

cat > src/index.js << 'F1'
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection(); client.buttons = new Collection(); client.modals = new Collection(); client.selectMenus = new Collection();
const handlers = readdirSync(join(__dirname, 'handlers')).filter(f => f.endsWith('.js'));
for (const file of handlers) { const { default: handler } = await import(`./handlers/${file}`); handler(client); }
client.login(process.env.TOKEN);
console.log('Bot Ready - No Database');
F1

cat > src/utils/db.js << 'F2'
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/db.json');

function readDB() {
  if (!existsSync(dbPath)) writeFileSync(dbPath, JSON.stringify({ tickets: [], settings: {} }));
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

function writeDB(data) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export const db = {
  get: (key) => {
    const data = readDB();
    return key.split('.').reduce((o, k) => o?.[k], data);
  },
  set: (key, value) => {
    const data = readDB();
    const keys = key.split('.');
    const last = keys.pop();
    const obj = keys.reduce((o, k) => (o[k] = o[k] || {}), data);
    obj[last] = value;
    writeDB(data);
  },
  push: (key, value) => {
    const arr = db.get(key) || [];
    arr.push(value);
    db.set(key, arr);
  }
};
F2

cat > src/handlers/eventHandler.js << 'F3'
import { readdirSync } from 'fs'; import { join, dirname } from 'path'; import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export default (client) => {
  const events = readdirSync(join(__dirname, '../events')).filter(f => f.endsWith('.js'));
  for (const file of events) {
    import(`../events/${file}`).then(({ default: event }) => {
      if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));
    });
  }
};
F3

cat > src/handlers/commandHandler.js << 'F4'
import { readdirSync } from 'fs'; import { join, dirname } from 'path'; import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export default (client) => {
  const folders = readdirSync(join(__dirname, '../commands'));
  for (const folder of folders) {
    const files = readdirSync(join(__dirname, `../commands/${folder}`)).filter(f => f.endsWith('.js'));
    for (const file of files) { import(`../commands/${folder}/${file}`).then(({ default: cmd }) => { if (cmd.data) client.commands.set(cmd.data.name, cmd); }); }
  }
};
F4

cat > src/handlers/componentHandler.js << 'F5'
import { readdirSync } from 'fs'; import { join, dirname } from 'path'; import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export default (client) => {
  const components = ['buttons', 'modals', 'selectMenus'];
  for (const type of components) {
    const files = readdirSync(join(__dirname, `../${type}`)).filter(f => f.endsWith('.js'));
    for (const file of files) { import(`../${type}/${file}`).then(({ default: comp }) => { client[type].set(comp.customId, comp); }); }
  }
};
F5

cat > src/events/ready.js << 'F6'
export default { name: 'ready', once: true, execute(client) { console.log(`Logged in as ${client.user.tag}`); } };
F6

cat > src/events/interactionCreate.js << 'F7'
export default { name: 'interactionCreate', async execute(interaction, client) {
  if (interaction.isChatInputCommand()) { const cmd = client.commands.get(interaction.commandName); if (cmd) await cmd.execute(interaction, client); }
  else if (interaction.isButton()) { const btn = client.buttons.get(interaction.customId); if (btn) await btn.execute(interaction, client); }
  else if (interaction.isModalSubmit()) { const modal = client.modals.get(interaction.customId); if (modal) await modal.execute(interaction, client); }
  else if (interaction.isStringSelectMenu()) { const menu = client.selectMenus.get(interaction.customId); if (menu) await menu.execute(interaction, client); }
}};
F7

echo '{"tickets":[],"settings":{}}' > data/db.json

npm install
echo "=== DONE ==="
echo "1. nano.env وحط TOKEN + CLIENT_ID + GUILD_ID"
echo "2. npm start"
