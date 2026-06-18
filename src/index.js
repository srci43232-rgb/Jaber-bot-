const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// بيانات البانل - هتتعدل من الموقع
let panelData = {
    title: '👑│نظام التذاكر الأسطوري│👑',
    description: '> **أهلاً بك في إمبراطورية الدعم الفني** ✨\n> \n> **▬▬▬**\n> \n> **⚡ اختر خدمتك من الأزرار بالأسفل وسيتم فتح تذكرة خاصة بك فوراً**\n> \n> **🎨 طلب بنر** ⇢ تصميم بنرات احترافية بمقاسات مخصصة\n> **✨ طلب استيكر** ⇢ ستكرات ديسكورد فخمة بستايلك\n> **🛠️ الدعم الفني** ⇢ حل جميع مشاكلك التقنية\n> \n> **▬▬▬**',
    color: '#FFD700'
};

// تحميل البيانات لو موجودة
if (fs.existsSync('./panel.json')) {
    panelData = JSON.parse(fs.readFileSync('./panel.json', 'utf8'));
}

app.use(express.urlencoded({ extended: true }));

// صفحة الويب للتعديل
app.get('/', (req, res) => {
    res.send(`
    <html dir="rtl">
    <head>
        <title>لوحة تحكم البوت</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: sans-serif; background: #1a1a1a; color: #fff; padding: 20px; max-width: 600px; margin: auto; }
            input, textarea { width: 100%; padding: 10px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: #fff; border-radius: 5px; }
            textarea { height: 200px; }
            button { background: #5865F2; color: white; padding: 15px; border: none; border-radius: 5px; width: 100%; font-size: 18px; cursor: pointer; }
            label { font-weight: bold; display: block; margin-top: 15px; }
        </style>
    </head>
    <body>
        <h1>👑 لوحة تحكم بانل التذاكر</h1>
        <form method="POST" action="/save">
            <label>عنوان البانل:</label>
            <input name="title" value="${panelData.title}" required>

            <label>الوصف:</label>
            <textarea name="description" required>${panelData.description}</textarea>

            <label>اللون Hex بدون #:</label>
            <input name="color" value="${panelData.color.replace('#', '')}" placeholder="FFD700" required>

            <button type="submit">💾 حفظ وتحديث البوت</button>
        </form>
        <p style="text-align:center;margin-top:20px;">بعد الحفظ البوت هيعمل ريستارت لوحده خلال 3 ثواني</p>
    </body>
    </html>
    `);
});

// حفظ التعديلات
app.post('/save', (req, res) => {
    panelData = {
        title: req.body.title,
        description: req.body.description,
        color: '#' + req.body.color
    };

    fs.writeFileSync('./panel.json', JSON.stringify(panelData, null, 2));
    res.send('<h1 style="text-align:center;font-family:sans-serif;">✅ تم الحفظ! البوت هيعمل ريستارت دلوقتي...</h1>');

    setTimeout(() => process.exit(0), 3000);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web panel running on port ${PORT}`));

// بوت الديسكورد
client.once('ready', () => {
    console.log(`Bot: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        const embed = new EmbedBuilder()
         .setTitle(panelData.title)
         .setDescription(panelData.description)
         .setColor(panelData.color)
         .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
         .setFooter({ text: `⚡ ${interaction.guild.name}`, iconURL: client.user.displayAvatarURL() })
         .setTimestamp();

        const row = new ActionRowBuilder()
         .addComponents(
                new ButtonBuilder().setCustomId('banner').setLabel('🎨 طلب بنر').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('sticker').setLabel('✨ طلب استيكر').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('support').setLabel('🛠️ الدعم الفني').setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

// تسجيل أمر /setup
client.on('ready', async () => {
    const { REST, Routes, SlashCommandBuilder } = require('discord.js');
    const commands = [new SlashCommandBuilder().setName('setup').setDescription('Create ticket panel')];
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    } catch (err) {}
});

client.login(process.env.TOKEN);
