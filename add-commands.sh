mkdir -p src/commands/ticket src/selectMenus src/modals src/buttons src/config

cat > src/config/colors.js << 'C1'
export const COLORS = { PRIMARY: 0x5865F2, SUCCESS: 0x57F287, ERROR: 0xED4245 };
export const CATEGORY_CONFIG = {
  support: { name: 'Support', emoji: '🎫', color: 0x5865F2, modalId: 'ticket_modal_support', questions: [{ id: 'problem', label: 'Describe problem', style: 2, max: 1000 }] }
};
C1

cat > src/commands/ticket/setup.js << 'C2'
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { db } from '../../utils/db.js';
export default {
  data: new SlashCommandBuilder().setName('setup').setDescription('Setup ticket system').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addChannelOption(o => o.setName('category').setDescription('Tickets category').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
.addChannelOption(o => o.setName('logs').setDescription('Logs channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
.addRoleOption(o => o.setName('staff').setDescription('Staff role').setRequired(true)),
  async execute(interaction) {
    db.set(`settings.${interaction.guild.id}`, {
      categoryId: interaction.options.getChannel('category').id,
      logChannelId: interaction.options.getChannel('logs').id,
      staffRole: interaction.options.getRole('staff').id
    });
    await interaction.reply({ content: 'Setup done! Now use /panel', ephemeral: true });
  }
};
C2

cat > src/commands/ticket/panel.js << 'C3'
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, CATEGORY_CONFIG } from '../../config/colors.js';
export default {
  data: new SlashCommandBuilder().setName('panel').setDescription('Send ticket panel').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const embed = new EmbedBuilder().setColor(COLORS.PRIMARY).setTitle('Create a Ticket').setDescription('Choose category below');
    const menu = new StringSelectMenuBuilder().setCustomId('ticket_category_select').setPlaceholder('Select category').addOptions(
      Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ label: v.name, value: k, emoji: v.emoji }))
    );
    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
  }
};
C3

cat > src/selectMenus/ticket_category_select.js << 'C4'
import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from 'discord.js';
import { CATEGORY_CONFIG } from '../config/colors.js';
export default {
  customId: 'ticket_category_select',
  async execute(interaction) {
    const category = interaction.values[0];
    const config = CATEGORY_CONFIG[category];
    const modal = new ModalBuilder().setCustomId(config.modalId).setTitle(config.name);
    config.questions.forEach(q => {
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId(q.id).setLabel(q.label).setStyle(TextInputStyle.Paragraph).setMaxLength(q.max).setRequired(true)
      ));
    });
    await interaction.showModal(modal);
  }
};
C4

cat > src/modals/ticket_modal_support.js << 'C5'
import { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { db } from '../utils/db.js';
import { COLORS } from '../config/colors.js';
export default {
  customId: 'ticket_modal_support',
  async execute(interaction) {
    const settings = db.get(`settings.${interaction.guild.id}`);
    if (!settings) return interaction.reply({ content: 'Run /setup first', ephemeral: true });
    
    const problem = interaction.fields.getTextInputValue('problem');
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: settings.categoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: settings.staffRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });
    
    db.push('tickets', { channelId: channel.id, userId: interaction.user.id, status: 'open', category: 'support', formData: { problem } });
    
    const embed = new EmbedBuilder().setColor(COLORS.PRIMARY).setTitle('Support Ticket').setDescription(problem)
   .addFields({ name: 'User', value: `${interaction.user}` });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒')
    );
    await channel.send({ content: `${interaction.user} <@&${settings.staffRole}>`, embeds: [embed], components: [row] });
    await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
  }
};
C5

cat > src/buttons/ticket_close.js << 'C6'
import { EmbedBuilder } from 'discord.js';
import { db } from '../utils/db.js';
import { COLORS } from '../config/colors.js';
export default {
  customId: 'ticket_close',
  async execute(interaction) {
    const tickets = db.get('tickets') || [];
    const ticket = tickets.find(t => t.channelId === interaction.channel.id);
    if (ticket) {
      ticket.status = 'closed';
      db.set('tickets', tickets);
    }
    const embed = new EmbedBuilder().setColor(COLORS.ERROR).setDescription(`Ticket closed by ${interaction.user}`);
    await interaction.reply({ embeds: [embed] });
    setTimeout(() => interaction.channel.delete().catch(()=>{}), 5000);
  }
};
C6

cat > register.js << 'REG'
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
REG

node register.js
