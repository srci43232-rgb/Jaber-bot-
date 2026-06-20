const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, PermissionsBitField, ChannelType, REST, Routes, ActivityType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences
    ]
});

// --- قاعدة البيانات السيادية لـ One City ---
const ONE_CITY = {
    TOKEN: process.env.TOKEN, 
    SERVER_NAME: "One City",
    // الأدوار الأربعة التي يمكنها رؤية والتحكم في التذاكر
    STAFF_ROLES: [
        "1515819140697559140",
        "1515819136251465740",
        "1515819147508842586",
        "1515819139506110555"
    ],
    CATEGORIES: {
        OPEN: "1515819288542580736",    // كاتجوري فتح التذاكر
        LOGS: "1515848735530160219",    // كاتجوري حفظ التذاكر
        TRANSCRIPT: "1516067345116958780" // قناة النسخ المزخرفة
    },
    ASSETS: {
        COLOR: "#FF0000",
        GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // رابط الـ GIF
    }
};

// وظيفة فحص الصلاحيات الإدارية
const isStaff = (member) => {
    return ONE_CITY.STAFF_ROLES.some(id => member.roles.cache.has(id)) || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    client.user.setPresence({ status: 'dnd', activities: [{ name: `${ONE_CITY.SERVER_NAME} Management`, type: ActivityType.Watching }] });
    console.log(`[SYSTEM] 🛡️ بوت One City متصل: ${client.user.tag}`);
    
    const commands = [{ name: 'setup', description: 'تثبيت المنظومة الإدارية لخدمات One City' }];
    const rest = new REST({ version: '10' }).setToken(ONE_CITY.TOKEN);
    try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); } catch (e) { console.error(e); }
});

// --- البنل الرئيسي الفخم ---
async function sendLuxuryPanel(channel) {
    const icon = channel.guild.iconURL({ size: 1024, dynamic: true });
    const panel = new EmbedBuilder()
        .setAuthor({ name: `${ONE_CITY.SERVER_NAME} Digital Services`, iconURL: icon })
        .setTitle("♛ مـنـظـومـة الـنـخـبـة لـلـخـدمـات والـبـلاغـات ♛")
        .setDescription(`
        **« بـروتوكول الـتـعـامـلات الـرسـمية لـمـديـنة ${ONE_CITY.SERVER_NAME} »**
        
        مرحباً بك في الوجهة الرسمية والوحيدة. تم تصميم هذا النظام لضمان الدقة والسرعة تحت إشراف طاقم الإدارة العليا.
        
        ━━━━━━━━━━━━━━━━━━━━━━
        **💠 بـوابـات الـخـدمـة الـمـتـاحة :**
        
        🟢 **بـوابة الـبلاغـات ضـد لـاعـب (Player Report)**
        *لـتـقـديـم الـشـكـاوى ضـد الـمـواطـنـين الـمـخـالـفـين.*

        🔴 **بـوابة الـبلاغـات ضـد إداري (Staff Report)**
        *قـسـم مـشـفـر لـلـتـظلمـات الإداريـة بـحـمـاية عـالـية.*

        🔵 **بـوابـة الـدعـم الـفـنـي (Technical Core)**
        *تـواصـل حـصـري مـع كـبـار الـمـسـؤولـيـن لـلـمسـاعدة.*
        ━━━━━━━━━━━━━━━━━━━━━━
        
        *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
        `)
        .setColor(ONE_CITY.ASSETS.COLOR)
        .setImage(ONE_CITY.ASSETS.GIF)
        .setThumbnail(icon)
        .setFooter({ text: `${ONE_CITY.SERVER_NAME} High Priority Protocol • 2026` });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('city_gate').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
            .addOptions([
                { label: 'بلاغ ضد لاعب', value: 'v_player', emoji: '🟢' },
                { label: 'بلاغ ضد إداري', value: 'v_staff', emoji: '🔴' },
                { label: 'الدعم الفني', value: 'v_support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [panel], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!isStaff(interaction.member)) return interaction.reply({ content: "⚠️ للإدارة فقط.", ephemeral: true });
        await sendLuxuryPanel(interaction.channel);
        return interaction.reply({ content: "✅ تم تفعيل المنظومة.", ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'city_gate') {
        const modal = new ModalBuilder().setCustomId(`mod_${interaction.values[0]}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fn').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fd').setLabel("تـفـاصـيـل الـطلب / الـبلاغ").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('mod_')) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        let s = { c: "#00FF00", l: "ضد-لاعب", e: "🟢" };
        if (type === 'v_staff') s = { c: "#FF0000", l: "ضد-إداري", e: "🔴" };
        if (type === 'v_support') s = { c: "#0080FF", l: "دعم-فني", e: "🔵" };

        const channel = await interaction.guild.channels.create({
            name: `${s.e}-${s.l}-${interaction.user.username}`,
            parent: ONE_CITY.CATEGORIES.OPEN,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                // السماح للأدوار الأربعة برؤية التذكرة والتحكم بها
                ...ONE_CITY.STAFF_ROLES.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder()
            .setTitle(`${s.e} مـذكـرة خـدمـة رسـمـية - ${ONE_CITY.SERVER_NAME}`)
            .setColor(s.c)
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📝 الـاسـم", value: `> ${interaction.fields.getTextInputValue('fn')}`, inline: true },
                { name: "📄 الـمـلـف الـمُـقـدم", value: `\`\`\`text\n${interaction.fields.getTextInputValue('fd')}\n\`\`\`` }
            ).setThumbnail(interaction.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_v').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close_v').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${ONE_CITY.STAFF_ROLES[0]}>`, embeds: [welcome], components: [row] });
        return interaction.followUp({ content: `✅ تم تفعيل بوابتك: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton()) {
        if (!isStaff(interaction.member)) return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً.", ephemeral: true });

        if (interaction.customId === 'claim_v') {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تم استلام المهمة بواسطة: ${interaction.user}`)] });
        }

        if (interaction.customId === 'close_v') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_city').setPlaceholder('🌟 تقييم جودة الخدمة (للمسؤول)...')
                    .addOptions([{ label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' }, { label: 'ضعيف ⭐', value: '1' }])
            );
            await interaction.reply({ content: "يرجى التقييم قبل الحفظ النهائي:", components: [row] });
        }

        if (interaction.customId === 'save_final_city') {
            await interaction.reply("⏳ جاري تسجيل الأرشيف المزخرف...");
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            
            // سجل عمودي مزخرف كما طلبت
            const transcript = msgs.filter(m => !m.author.bot)
                .map(m => `╭╼━━━━━━╾╮\n┃ 👤 [${m.author.tag}]\n┃ 🕒 [${m.createdAt.toLocaleTimeString()}]\n┃ 💬 : ${m.content}\n╰╼━━━━━━╾╯`)
                .reverse().join('\n\n');

            const archEmbed = new EmbedBuilder().setTitle("📂 مـلـف أرشـيـف: One City").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "المسؤول", value: interaction.user.tag, inline: true }).setTimestamp();

            const transChan = client.channels.cache.get(ONE_CITY.CATEGORIES.TRANSCRIPT);
            const logsChan = client.channels.cache.get(ONE_CITY.CATEGORIES.LOGS);

            if (transChan) {
                await transChan.send({ embeds: [archEmbed] });
                if (transcript) await transChan.send({ content: `📜 **سـجل مـحادثـة عـمـودي:**\n\n${transcript.slice(0, 1900)}` });
            }
            if (logsChan) await logsChan.send({ embeds: [archEmbed] });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_city') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('save_final_city').setLabel('💾 تسجيل وحفظ التذكرة (إدارة)').setStyle(ButtonStyle.Primary));
        await interaction.update({ content: `✅ تـم تسجيل التقييم. للمسؤول: إضـغط لـلأرشفة والـحـذف.`, components: [row] });
    }
});

client.login(ONE_CITY.TOKEN);
