const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, 
    PermissionsBitField, ChannelType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ]
});

// --- الإعدادات (تأكد من التوكن في Railway) ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658", // آيدي السيرفر
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"], // المدراء
    CATEGORY: "1517931717061771294", // كاتجوري التذاكر
    LOGS: "1517942325383270502", // قناة اللوج
    STAFF_ROLES: ["1517002645666267197", "1517931426069348446", "1517931427600007258", "1517931425372962947"],
    TECH_ROLE: "1517931445149241356"
};

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} جاهز للعمل!`);
    
    // تسجيل الأمر تلقائياً دون الحاجة لآيدي يدوي
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        await guild.commands.set([{
            name: 'setup',
            description: 'تجهيز لوحة تذاكر One City RP'
        }]);
        console.log('✅ تم تسجيل أمر /setup بنجاح');
    }
});

client.on('interactionCreate', async (int) => {
    // 1. أمر Setup
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ صلاحيات إدارة عليا فقط", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle("🌆 **ONE CITY ROLEPLAY | الـدعم الـفـنـي**")
            .setDescription(`
                \n**أهـلاً بـك فـي مـديـنـة One City.. حـيـث لـلـواقـعـيـة مـعـنى آخـر**\n
                نـحـن هـنـا لـنـسـمـعـك، نـسـاعـدك، ونـضـمـن لـك بـيـئـة لـعـب عـادلة ومـحـتـرفـة.
                اخـتـر الـقـسم الـمـنـاسب لـحـالـتـك وسـيـتـم الـرد عـلـيـك مـن قـبـل الـمـخـتـصـيـن:\n
                🟢 **بـلاغ ضـد لاعـب**
                🔴 **بـلاغ ضـد إداري**
                ⚫ **الـدعم الـفـنـي**
                \n─── ⋆⋅☆⋅⋆ ───
                **تـنـبـيـه:** بـعـد الضـغـط عـلـى الـزر، سـيـطـلـب مـنـك الـبوت إدخـال بـيـانـاتـك.
            `)
            .setColor("#FF0000") // أحمر لامع
            .setFooter({ text: "One City RP Management", iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('p_t').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('s_t').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('t_t').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return int.reply({ embeds: [embed], components: [buttons] });
    }

    // 2. فتح المودال فوراً
    if (int.isButton() && ['p_t', 's_t', 't_t'].includes(int.customId)) {
        const modal = new ModalBuilder().setCustomId(`mod_${int.customId}`).setTitle('تعبئة بيانات التذكرة');
        const input1 = new TextInputBuilder().setCustomId('name').setLabel("الاسم والآيدي").setStyle(TextInputStyle.Short).setRequired(true);
        const input2 = new TextInputBuilder().setCustomId('reason').setLabel("السبب").setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
        return int.showModal(modal);
    }

    // 3. معالجة البيانات وفتح التذكرة
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true });
        const name = int.fields.getTextInputValue('name');
        const reason = int.fields.getTextInputValue('reason');
        
        let setup = { label: "تذكرة", color: "#FFFFFF", roles: [] };
        if (int.customId.includes('p_t')) setup = { label: "لاعب", color: "#00FF00", roles: CONFIG.STAFF_ROLES };
        else if (int.customId.includes('s_t')) setup = { label: "اداري", color: "#FF0000", roles: CONFIG.STAFF_ROLES };
        else setup = { label: "دعم-فني", color: "#1A1A1A", roles: [CONFIG.TECH_ROLE] };

        try {
            const channel = await int.guild.channels.create({
                name: `${setup.label}-${int.user.username}`,
                parent: CONFIG.CATEGORY,
                permissionOverwrites: [
                    { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
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
            return int.editReply("❌ خطأ: تأكد من صلاحيات البوت ووجود الكاتجوري.");
        }
    }

    // 4. الإغلاق واللوج
    if (int.isButton() && int.customId === 'close') {
        await int.reply("🔒 يتم الحفظ والحذف...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let log = msgs.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');

        const logChan = client.channels.cache.get(CONFIG.LOGS);
        if (logChan) {
            await logChan.send({ content: `📁 أرشيف تذكرة: ${int.channel.name}\n\`\`\`text\n${log.substring(0, 1800)}\n\`\`\`` });
        }
        setTimeout(() => int.channel.delete(), 3000);
    }
});

client.login(CONFIG.TOKEN);
