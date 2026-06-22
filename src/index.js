const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, 
    PermissionsBitField, ChannelType, REST, Routes 
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// --- الإعدادات الثابتة ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    CLIENT_ID: "1381360453485334658",
    GUILD_ID: "1381360453485334658",
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"],
    CATEGORY: "1517931717061771294",
    LOGS: "1517942325383270502",
    STAFF_ROLES: ["1517002645666267197", "1517931426069348446", "1517931427600007258", "1517931425372962947"],
    TECH_ROLE: "1517931445149241356"
};

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID), {
            body: [{ name: 'setup', description: 'تجهيز لوحة تذاكر One City RP' }]
        });
        console.log('✅ Bot is Online & Commands Registered');
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async (int) => {
    // 1. استجابة فورية لأمر Setup
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ إدارة عليا فقط", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle("🌆 **ONE CITY ROLEPLAY | الـدعم الـفـنـي**")
            .setDescription(`\n**مـرحـباً بـك فـي مـديـنـة One City**\n\n🟢 **بـلاغ ضـد لاعـب**\n🔴 **بـلاغ ضـد إداري**\n⚫ **الـدعم الـفـنـي**\n\n*اضغط على الزر المناسب وسيفتح لك نموذج تعبئة البيانات.*`)
            .setColor("#FF0000").setFooter({ text: "One City RP Management" });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('p_t').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('s_t').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('t_t').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return int.reply({ embeds: [embed], components: [buttons] });
    }

    // 2. استجابة فورية للأزرار (بدون تفكير)
    if (int.isButton() && (int.customId === 'p_t' || int.customId === 's_t' || int.customId === 't_t')) {
        const modal = new ModalBuilder().setCustomId(`mod_${int.customId}`).setTitle('تعبئة بيانات التذكرة');
        const input1 = new TextInputBuilder().setCustomId('name').setLabel("الاسم والآيدي").setStyle(TextInputStyle.Short).setRequired(true);
        const input2 = new TextInputBuilder().setCustomId('reason').setLabel("السبب").setStyle(TextInputStyle.Paragraph).setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
        return int.showModal(modal); // يظهر المودال فوراً
    }

    // 3. معالجة إرسال البيانات (المودال)
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true }); // رد مخفي فوراً لكسر حالة "Thinking"

        const name = int.fields.getTextInputValue('name');
        const reason = int.fields.getTextInputValue('reason');
        const type = int.customId;

        let setup = { label: "تذكرة", color: "#FFFFFF", roles: [] };
        if (type.includes('p_t')) setup = { label: "لاعب", color: "#00FF00", roles: CONFIG.STAFF_ROLES };
        else if (type.includes('s_t')) setup = { label: "اداري", color: "#FF0000", roles: CONFIG.STAFF_ROLES };
        else setup = { label: "دعم-فني", color: "#1A1A1A", roles: [CONFIG.TECH_ROLE] };

        try {
            const channel = await int.guild.channels.create({
                name: `${setup.label}-${int.user.username}`,
                parent: CONFIG.CATEGORY,
                permissionOverwrites: [
                    { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...setup.roles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                    ...CONFIG.AUTH_USERS.map(u => ({ id: u, allow: [PermissionsBitField.Flags.ViewChannel] }))
                ]
            });

            const welcome = new EmbedBuilder()
                .setTitle(`🎫 تذكرة جديدة: ${setup.label}`)
                .setColor(setup.color)
                .addFields({ name: "👤 العضو:", value: `${int.user} (${name})` }, { name: "📝 السبب:", value: reason });

            const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setStyle(ButtonStyle.Danger));

            await channel.send({ content: `@here`, embeds: [welcome], components: [closeBtn] });
            return int.editReply(`✅ تم فتح تذكرتك: ${channel}`);
        } catch (e) {
            return int.editReply("❌ حدث خطأ أثناء إنشاء القناة، تأكد من صلاحيات البوت.");
        }
    }

    // 4. إغلاق فوري وأرشفة نصية
    if (int.isButton() && int.customId === 'close') {
        await int.reply("🔒 يتم الحفظ والحذف...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let log = `Archive: ${int.channel.name}\n\n` + msgs.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');

        const logChan = client.channels.cache.get(CONFIG.LOGS);
        if (logChan) {
            await logChan.send({ content: `📁 أرشيف التذكرة: ${int.channel.name}` });
            await logChan.send({ content: `\`\`\`text\n${log.substring(0, 1900)}\n\`\`\`` });
        }
        setTimeout(() => int.channel.delete(), 3000);
    }
});

client.login(CONFIG.TOKEN);
