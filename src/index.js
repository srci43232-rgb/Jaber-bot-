const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, 
    PermissionsBitField, ChannelType, Events 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ]
});

// --- إعدادات مدينة One City RP ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    CATEGORY_ID: "1517931620018159626",
    LOGS_ID: "1517942325383270502",
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"],

    // رتب استلام تذاكر (ضد لاعب)
    PLAYER_ROLES: [
        "1517931439054913596", "1517931433199669533", 
        "1517931427600007258", "1517931426069348446"
    ],

    // رتب استلام تذاكر (ضد إداري)
    STAFF_ROLES: [
        "1517931426069348446", "1517931425372962947", 
        "1517002645666267197", "1517164221329309727", 
        "1517144275836735628", "1517002643619446855", "1517002644676411592"
    ],

    // رتب استلام تذاكر (الدعم الفني)
    TECH_ROLES: ["1518455838858150058"]
};

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ One City RP System is Live: ${c.user.tag}`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        await guild.commands.set([{ name: 'setup', description: 'تجهيز اللوحة المركزية للدعم والبلاغات' }]);
    }
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. أمر Setup الفخم جداً
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ عذراً، هذا الأمر مخصص للإدارة العليا فقط.", ephemeral: true });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | مـنـصـة الـخـدمـات الـعـامـة', iconURL: int.guild.iconURL() })
            .setTitle('⚠️ بـوابـة الـتـواصل الـرسـمـيـة لـلـسـكـان')
            .setDescription(`
                \n**عـزيـزي الـمـواطـن.. مـرحـباً بـك فـي بـيـئـتـك الـرقمـية الآمـنـة**\n
                فـي مـديـنـة **One City**، نـؤمـن بـأن الـنـظام هـو الـحـصـن الـمـنـيع لـتـجـربة واقـعـيـة مـثـالـيـة. لـذلك، نـضـع بـين يـديـك هـذه الـمـنـصة لـضـمـان تـلـبـية احـتـيـاجـاتـك وتـحـقـيق الـعـدالة الـنـاجـزة.

                **『 الـخـدمـات الـمـتـوفـرة 』**
                
                🟢 **قـسم الـنـزاعات الـقـانـونـية (ضد لاعب)**
                *لـلإبلاغ عـن تـجاوزات الـقوانـين الـعـامـة لـلـمدينة.*
                
                🔴 **ديـوان الـمـظالـم (ضد إداري)**
                *لـتـقديم الـشكاوى الـرسـمـية بـحق طـاقـم الـعـمل للإدارة الـعـلـيا.*
                
                ⚫ **مـركـز الـدعم الـتـقـني (الدعم الفني)**
                *لـمـعالجة الـمشاكل الـتـقـنية، الـبوقات، أو طـلـبات الـتـعويـض.*

                ─── ⋆⋅☆⋅⋆ ───
                **📝 مـلاحـظـة هـامـة:**
                بـمجرد الضـغـط عـلـى الـخدمة، سـيـطلب مـنـك الـنـظام تـعـبـئة بـيـانـات الـطـلـب لـضـمان سرعة الـمـعـالـجـة.
            `)
            .setColor("#FF0000") // الأحمر اللامع
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setImage('https://share.creavite.co/66766468798e4f55979f42a7.gif') // صورة فخمة في الوصف
            .setFooter({ text: 'One City RP | Excellence in Every Action', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('op_player').setLabel('بلاغ ضد لاعب').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('op_staff').setLabel('بلاغ ضد اداري').setStyle(ButtonStyle.Danger).setEmoji('🔴'),
            new ButtonBuilder().setCustomId('op_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary).setEmoji('⚫')
        );

        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. النماذج الاحترافية (Modals)
    if (int.isButton()) {
        const modalConfigs = {
            'op_player': { id: 'm_player', title: 'إسـتـمـارة بـلاغ ضـد لاعـب' },
            'op_staff': { id: 'm_staff', title: 'إسـتـمـارة شـكوى إداريـة' },
            'op_tech': { id: 'm_tech', title: 'إسـتـمـارة الـدعم الـفـنـي' }
        };

        if (modalConfigs[int.customId]) {
            const config = modalConfigs[int.customId];
            const modal = new ModalBuilder().setCustomId(config.id).setTitle(config.title);
            
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('in_1').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('in_2').setLabel("تفاصيل الموضوع / البلاغ").setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('in_3').setLabel("رابط الدليل (اختياري)").setStyle(TextInputStyle.Short).setRequired(false))
            );
            return int.showModal(modal);
        }
    }

    // 3. معالجة إرسال البيانات وفتح التذكرة بالأرقام
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true });
        
        const f1 = int.fields.getTextInputValue('in_1');
        const f2 = int.fields.getTextInputValue('in_2');
        const f3 = int.fields.getTextInputValue('in_3') || "لا يوجد";

        let settings = { label: "TICKET", color: "#FF0000", roles: [] };
        if (int.customId === 'm_player') settings = { label: "PLAYER", color: "#00FF00", roles: CONFIG.PLAYER_ROLES };
        else if (int.customId === 'm_staff') settings = { label: "STAFF", color: "#FF0000", roles: CONFIG.STAFF_ROLES };
        else settings = { label: "TECH", color: "#000000", roles: CONFIG.TECH_ROLES };

        // إنشاء رقم عشوائي للتذكرة (مثل ticket-4821)
        const ticketNum = Math.floor(1000 + Math.random() * 9000);

        try {
            const channel = await int.guild.channels.create({
                name: `${settings.label.toLowerCase()}-${ticketNum}`,
                parent: CONFIG.CATEGORY_ID,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...settings.roles.map(rid => ({ id: rid, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                    ...CONFIG.AUTH_USERS.map(uid => ({ id: uid, allow: [PermissionsBitField.Flags.ViewChannel] }))
                ]
            });

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`🎫 تـذكـرة جـديـدة | ${settings.label}`)
                .setColor(settings.color)
                .setDescription(`مـرحـباً بـك ${int.user}، سـيتم الـرد عـلـيـك مـن قـبل الـمـخـتـصـين قـريـباً.`)
                .addFields(
                    { name: '👤 صـاحـب الـطـلـب:', value: `\`${f1}\``, inline: true },
                    { name: '🆔 رَقـم الـتـذكـرة:', value: `\`#${ticketNum}\``, inline: true },
                    { name: '📝 الـمـوضـوع:', value: `\`\`\`${f2}\`\`\`` },
                    { name: '🔗 الـدلـيـل:', value: f3 }
                )
                .setTimestamp()
                .setFooter({ text: 'One City Support System' });

            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_tk').setLabel('إغلاق').setStyle(ButtonStyle.Danger));

            await channel.send({ content: `${int.user} | ${settings.roles.map(r => `<@&${r}>`).join(' ')}`, embeds: [ticketEmbed], components: [row] });
            return int.editReply(`✅ تـم فـتح تـذكـرتـك بـنـجـاح: ${channel}`);
        } catch (e) {
            console.error(e);
            return int.editReply(`❌ فـشل فـتـح الـتـذكـرة. تـأكد مـن صـلاحـيـات الـبوت وآيـدي الـكـاتـجـوري.`);
        }
    }

    // 4. نظام الإغلاق والأرشفة
    if (int.isButton() && int.customId === 'close_tk') {
        await int.reply("🔒 جـاري حـفظ الـسـجلات وإغـلاق الـقـناة...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let log = `Log Archive for ${int.channel.name}\n\n` + msgs.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');

        const logChan = client.channels.cache.get(CONFIG.LOGS_ID);
        if (logChan) {
            await logChan.send({ 
                content: `📁 **أرشـيف الـتـذكـرة: \`${int.channel.name}\`**\nالـمـسؤول: ${int.user}`,
                files: [{ attachment: Buffer.from(log), name: `log-${int.channel.name}.txt` }] 
            });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 4000);
    }
});

client.login(CONFIG.TOKEN);
