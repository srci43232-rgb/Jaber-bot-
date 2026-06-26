const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, 
    PermissionsBitField, ChannelType, Events 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildModeration
    ]
});

// --- إعدادات Golden State Role Play ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1508591646374232196",
    TICKET_CATEGORY: "1508591646906781745",
    SETUP_CHANNEL: "1520208744007467118",
    
    // الرتب التلقائية للأعضاء الجدد
    AUTO_ROLES: ["1508591646374232204", "1520212565039255572"],

    // لوجز التذاكر
    LOGS_TICKET_CAT: "1520207106471629021",
    LOGS_TICKET_MSG: "1520207208430702684",

    // لوجز السيرفر
    LOGS_CHANNELS: "1520207298956492932",
    LOGS_VOICE: "1520207416002740436",
    LOGS_JOIN_LEAVE: "1520207543102607404",
    
    // لوجز العقوبات
    LOGS_KICK: "1520207710149152891",
    LOGS_BAN: "1520207818127446188",
    LOGS_TIMEOUT: "1520207953901125712",

    // رتب الإدارة (8 رتب)
    STAFF_ROLES: [
        "1508591646411980895", "1508591646428889121", "1508591646411980896", 
        "1508591646428889120", "1508591646411980899", "1508591646428889119", 
        "1508591646428889118", "1508591646411980898"
    ],
    OWNER_IDS: ["1349214233262297149", "1517002644676411592"]
};

// وظيفة فحص الإدارة
const isStaff = (member) => member.roles.cache.hasAny(...CONFIG.STAFF_ROLES) || CONFIG.OWNER_IDS.includes(member.id);

client.once(Events.ClientReady, async () => {
    console.log(`✅ GSRP System Online: ${client.user.tag}`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) await guild.commands.set([{ name: 'setup', description: 'تجهيز المنصة الإدارية لـ GSRP' }]);
});

// --- نظام الترحيب والرتب التلقائية ---
client.on(Events.GuildMemberAdd, async (member) => {
    // 1. إرسال لوج الدخول
    const logChan = member.guild.channels.cache.get(CONFIG.LOGS_JOIN_LEAVE);
    if (logChan) {
        const welcomeLog = new EmbedBuilder()
            .setTitle('📥 عضو جديد في القائمة')
            .setDescription(`**المواطن:** ${member}\n**الآيدي:** \`${member.id}\`\n**الرقم الحالي:** \`${member.guild.memberCount}\``)
            .setColor('#00FF00')
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        logChan.send({ embeds: [welcomeLog] });
    }

    // 2. إعطاء الرتب التلقائية
    try {
        await member.roles.add(CONFIG.AUTO_ROLES);
        console.log(`✅ تم إعطاء الرتب التلقائية لـ ${member.user.tag}`);
    } catch (err) {
        console.error(`❌ فشل إعطاء الرتب لـ ${member.user.tag}: تأكد من رتبة البوت.`);
    }
});

// --- نظام الحماية (Anti-Link) ---
client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild) return;
    if (/(https?:\/\/|discord\.gg|www\.)/i.test(msg.content) && !isStaff(msg.member)) {
        try {
            await msg.delete().catch(() => {});
            await msg.member.kick("إرسال روابط محظورة").catch(() => {});
            const kickLog = msg.guild.channels.cache.get(CONFIG.LOGS_KICK);
            if (kickLog) {
                kickLog.send({ embeds: [new EmbedBuilder().setTitle('🛡️ حماية GSRP').setDescription(`تم طرد **${msg.author.tag}** بسبب إرسال روابط.\nالآيدي: \`${msg.author.id}\``).setColor('#FF0000').setTimestamp()] });
            }
        } catch (e) { console.log(e); }
    }
});

// --- لوحة التذاكر (Setup) ---
client.on(Events.InteractionCreate, async (int) => {
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!isStaff(int.member)) return int.reply({ content: "❌ عذراً، هذا الأمر مخصص لطاقم الإدارة فقط.", ephemeral: true });

        const setupEmbed = new EmbedBuilder()
            .setAuthor({ name: 'GOLDEN STATE ROLEPLAY | الإدارة العليا', iconURL: int.guild.iconURL() })
            .setTitle('🏛️ المـركـز الإداري والـتـقـني الـمـوحـد')
            .setDescription(`
                ╭─── · · 🏛️ · · ───╮
                  **مرحباً بك في Golden State**
                  **نحن هنا لخدمتكم وضمان نظام المدينة**
                ╰─── · · 🏛️ · · ───╯

                ┃ يرجى اختيار القسم المناسب لطلبك لضمان سرعة الرد:
                ┃
                ┃ 🟢 **بلاغ ضد لاعب**
                ┃ 🔴 **بلاغ ضد إداري**
                ┃ ⚫ **الدعم الفني والتقني**

                ─── ⋆⋅☆⋅⋆ ───
                **📝 إرشاد:** اضـغط عـلى الـزر لـتـقـديـم بـيـانـاتـك لـلإدارة.
            `)
            .setColor("#FF0000")
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Golden State RP | Quality Service', iconURL: int.guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('op_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('op_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger).setEmoji('🔴'),
            new ButtonBuilder().setCustomId('op_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary).setEmoji('⚫')
        );
        return int.reply({ embeds: [setupEmbed], components: [row] });
    }

    // --- النماذج (Modals) ---
    if (int.isButton() && int.customId.startsWith('op_')) {
        const modal = new ModalBuilder().setCustomId(`m_${int.customId}`).setTitle('إسـتـمـارة الـطـلـب الـرسـمـيـة');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i1').setLabel("الأسم والآيدي داخل المدينة").setPlaceholder("مثال: صقر | 1005").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i2').setLabel("شرح المشكلة بالتفصيل").setPlaceholder("اكتب هنا ما حدث معك...").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        return int.showModal(modal);
    }

    // --- معالجة إنشاء التذكرة ---
    if (int.isModalSubmit() && int.customId.startsWith('m_op_')) {
        await int.deferReply({ ephemeral: true });
        const type = int.customId.split('_')[2];
        const f1 = int.fields.getTextInputValue('i1');
        const f2 = int.fields.getTextInputValue('i2');

        let settings = { label: "TICKET", color: "#FF0000" };
        if (type === 'player') settings = { label: "PLAYER", color: "#00FF00" };
        else if (type === 'staff') settings = { label: "STAFF", color: "#FF0000" };
        else settings = { label: "TECH", color: "#1A1A1A" };

        const ticketNum = Math.floor(1000 + Math.random() * 9000);
        const channel = await int.guild.channels.create({
            name: `${settings.label.toLowerCase()}-${ticketNum}`,
            parent: CONFIG.TICKET_CATEGORY,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...CONFIG.STAFF_ROLES.map(id => ({ id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setAuthor({ name: `GSRP | طلب جديد من: ${int.user.username}`, iconURL: int.user.displayAvatarURL() })
            .setTitle(`🎫 ${settings.label} TICKET #${ticketNum}`)
            .setColor(settings.color)
            .setThumbnail(int.user.displayAvatarURL())
            .setDescription(`◈ **البيانات:** \`${f1}\`\n◈ **الموضوع:**\n\`\`\`${f2}\`\`\``)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_tk').setLabel('استلام').setStyle(ButtonStyle.Primary).setEmoji('📩'),
            new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger).setEmoji('📂')
        );

        await channel.send({ content: `${int.user} | <@&${CONFIG.STAFF_ROLES[0]}>`, embeds: [ticketEmbed], components: [row] });
        return int.editReply(`✅ تم فتح طلبك بنجاح في القناة: ${channel}`);
    }

    // --- الاستلام والإغلاق ---
    if (int.isButton() && (int.customId === 'claim_tk' || int.customId === 'register_tk' || int.customId.startsWith('rate_'))) {
        if (!isStaff(int.member)) return int.reply({ content: "⚠️ هذا الإجراء مخصص لطاقم الإدارة فقط.", ephemeral: true });
    }

    if (int.isButton() && int.customId === 'claim_tk') {
        const claimEmbed = EmbedBuilder.from(int.message.embeds[0]).setColor("#5865F2");
        await int.update({ embeds: [claimEmbed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger))] });
        return int.channel.send(`👮 **تـم اسـتـلام الـتـذكـرة بـواسـطـة: ${int.user}**`);
    }

    if (int.isButton() && int.customId === 'register_tk') {
        const stars = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
        );
        return int.reply({ content: "⭐ **يـرجـى تـقـيـيـم الـخـدمـة قـبـل الإغـلاق:**", components: [stars] });
    }

    // --- الأرشفة النهائية ---
    if (int.isButton() && int.customId.startsWith('rate_')) {
        const rating = int.customId === 'rate_5' ? '5 نجوم (ممتاز)' : 'نجمة واحدة (سيء)';
        await int.update({ content: '🔒 **جـاري الأرشفـة والـتـسجـيل...**', components: [] });
        
        const msgs = await int.channel.messages.fetch({ limit: 50 });
        const history = msgs.reverse().filter(m => !m.author.bot).map(m => `┃ **${m.author.username}**: ${m.content}`).join('\n');
        
        const logChan = client.channels.cache.get(CONFIG.LOGS_TICKET_MSG);
        if (logChan) {
            const logEmbed = new EmbedBuilder()
                .setTitle(`📁 أرشـيـف تـذكـرة | ${int.channel.name}`)
                .setColor("#FF0000")
                .setDescription(`
                    ┃ **المسؤول المُغلق:** ${int.user}
                    ┃ **التقييم:** ${rating}
                    
                    **سجل المحادثة العمودي:**
                    ${history.substring(0, 1800)}
                    
                    ─── ⋆⋅☆⋅⋆ ───
                `)
                .setTimestamp();
            await logChan.send({ embeds: [logEmbed] });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 3000);
    }
});

client.login(CONFIG.TOKEN);
