const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const express = require('express');
const app = express();

// ====== إعدادات البوت ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// ====== بيانات البانل - هتتغير من لوحة التحكم ======
let panelConfig = {
  title: '👑│نظام التذاكر الأسطوري│👑',
  description: `**أهلاً بك في إمبراطورية الدعم الفني** ✨

**▬▬▬**

> **🎯 اختر نوع تذكرتك بعناية فائقة**
> **⚡ فريقنا الأسطوري في انتظارك 24/7**
> **🔥 سرعة، احترافية، وخصوصية تامة**

**▬▬▬**

**📌 ملاحظة هامة:**
افتح تذكرتك وسيتم الرد عليك فوراً`,
  color: 'FFD700'
};

// ====== سيرفر الويب + لوحة التحكم ======
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم البوت</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
           .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #1e1e2e; 
                padding: 30px; 
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 { 
                color: #FFD700; 
                text-align: center; 
                margin-bottom: 30px;
                font-size: 28px;
            }
            label { 
                color: #cdd6f4; 
                display: block; 
                margin-top: 20px; 
                margin-bottom: 8px;
                font-weight: bold;
            }
            input, textarea { 
                width: 100%; 
                padding: 12px; 
                background: #313244; 
                border: 2px solid #45475a; 
                border-radius: 10px; 
                color: #cdd6f4;
                font-size: 16px;
                transition: all 0.3s;
            }
            input:focus, textarea:focus {
                outline: none;
                border-color: #FFD700;
            }
            textarea { 
                min-height: 200px; 
                resize: vertical;
                font-family: inherit;
            }
            button { 
                width: 100%;
                background: linear-gradient(135deg, #FFD700, #FFA500); 
                color: #1e1e2e; 
                padding: 15px; 
                border: none; 
                border-radius: 10px; 
                font-size: 18px;
                font-weight: bold;
                cursor: pointer; 
                margin-top: 25px;
                transition: transform 0.2s;
            }
            button:hover {
                transform: translateY(-2px);
            }
           .success {
                background: #a6e3a1;
                color: #1e1e2e;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                text-align: center;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>👑 لوحة تحكم بانل التذاكر</h1>
            ${req.query.success? '<div class="success">✅ تم الحفظ! البوت هيعمل ريستارت دلوقتي</div>' : ''}
            <form method="POST" action="/update">
                <label>عنوان البانل:</label>
                <input type="text" name="title" value="${panelConfig.title}" required>
                
                <label>الوصف:</label>
                <textarea name="description" required>${panelConfig.description}</textarea>
                
                <label>اللون Hex بدون #:</label>
                <input type="text" name="color" value="${panelConfig.color}" placeholder="FFD700" required>
                
                <button type="submit">💾 حفظ وتحديث البوت</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

app.post('/update', (req, res) => {
  panelConfig.title = req.body.title;
  panelConfig.description = req.body.description;
  panelConfig.color = req.body.color.replace('#', '');
  res.redirect('/?success=true');
  setTimeout(() => process.exit(0), 1000); // ريستارت عشان يحدث البوت
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 لوحة التحكم شغالة على بورت ${PORT}`));

// ====== كود البوت ======
client.once('ready', () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.on('messageCreate', async message => {
  if (message.content === '/setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const embed = new EmbedBuilder()
     .setTitle(panelConfig.title)
     .setDescription(panelConfig.description)
     .setColor(parseInt(panelConfig.color, 16));

    const row = new ActionRowBuilder()
     .addComponents(
        new ButtonBuilder()
         .setCustomId('create_ticket')
         .setLabel('🎫 فتح تذكرة')
         .setStyle(ButtonStyle.Success)
      );

    await message.channel.send({ embeds: [embed], components: [row] });
    await message.delete();
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  
  if (interaction.customId === 'create_ticket') {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });
    
    await interaction.reply({ content: `✅ تذكرتك اتفتحت: ${channel}`, ephemeral: true });
    
    const embed = new EmbedBuilder()
     .setTitle('🎫 تذكرتك اتفتحت')
     .setDescription(`أهلاً ${interaction.user}\nفريق الدعم هيرد عليك قريباً`)
     .setColor(0x00FF00);
      
    await channel.send({ content: `${interaction.user}`, embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
