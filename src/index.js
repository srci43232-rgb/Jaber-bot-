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

// --- الإعدادات الشاملة لمدينة One City RP ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    CATEGORY_ID: "1517931620018159626",
    LOGS_ID: "1517942325383270502",
    
    // المستخدمين المسموح لهم بأمر السيت اب
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"],

    // رتب استلام تذاكر (ضد لاعب)
    PLAYER_ROLES: ["1517931439054913596", "1517931433199669533", "1517931427600007258", "1517931426069348446"],

    // رتب استلام تذاكر (ضد إداري)
    STAFF_ROLES: ["1517931426069348446", "1517931425372962947", "1517002645666267197", "1517164221329309727", "1517144275836735628", "1517002643619446855", "1517002644676411592"],

    // رتب استلام تذاكر (الدعم الفني)
    TECH_ROLES: ["1518455838858150058"]
};

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ One City RP System Online: ${c.user.tag}`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) await guild.commands.set([{ name: 'setup', description: 'تجهيز المنصة الإدارية الفخمة' }]);
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. لوحة الـ Setup (الوصف الفخم باللون الأحمر اللامع)
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ عذراً، هذا الأمر مخصص للإدارة العليا فقط.", ephemeral: true });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | بـوابـة الـتـواصـل الـرسـمـيـة', iconURL: int.guild.iconURL() })
            .setTitle('⚠️ المـركـز الـمـوحـد لـلـبـلاغـات والـدعم')
            .setDescription(`
                \n**مـرحـباً بـك عـزيزي الـمواطـن فـي مـديـنة One City**\n
                نـحن نـؤمـن بـأن الـعـدالة والـنـظـام هـما أساس الـتـمـيز فـي مـديـنـتنا. إذا كـنت تـواجـه مـشكلة أو تـود تـقـديـم بـلاغ، يـرجى اخـتـيار الـقـسم الـمـنـاسب لـحـالـتـك أدناه:\n
                🟢 **قـسم الـبلاغـات (ضد لاعب)**
                🔴 **ديـوان الـمظالـم (ضد إداري)**
                ⚫ **الـدعم الـفني والـتقـني**
                \n─── ⋆⋅☆⋅⋆ ───
                **تـنـبـيـه:** بـعد الـضـغـط عـلـى الـزر، سـيـتم فـتـح نـمـوذج بـيـانـات لـتـعبئـته قـبـل فـتـح الـتـذكـرة.
            `)
            .setColor("#FF0000") // أحمر لامع
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Excellence & Professionalism', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('op_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('op_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger).setEmoji('🔴'),
            new ButtonBuilder().setCustomId('op_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary).setEmoji('⚫')
        );

        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. النماذج الاحترافية (Modals)
    if (int.isButton() && int.customId.startsWith('op_')) {
        const modal = new ModalBuilder().setCustomId(`m_${int.customId}`).setTitle('إسـتـمـارة تـأكـيـد الـبـيـانـات');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i1').setLabel("الاسم والآيدي الخاص بك").setPlaceholder("مثال: صقر | 1349").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i2').setLabel("تـفـاصـيـل الـطـلـب / الـبـلاغ").setPlaceholder("اشرح ما حدث معك بالتفصيل...").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        return int.showModal(modal);
    }

    // 3. فتح التذكرة (بترقيم رقمي وصورة العضو وتنسيق فخم)
    if (int.isModalSubmit() && int.customId.startsWith('m_op_')) {
        await int.deferReply({ ephemeral: true });
        const type = int.customId.split('_')[2];
        const f1 = int.fields.getTextInputValue('i1');
        const f2 = int.fields.getTextInputValue('i2');

        let set = { label: "TICKET", color: "#FFFFFF", roles: [] };
        if (type === 'player') set = { label: "PLAYER", color: "#00FF00", roles: CONFIG.PLAYER_ROLES };
        else if (type === 'staff') set = { label: "STAFF", color: "#FF0000", roles: CONFIG.STAFF_ROLES };
        else set = { label: "TECH", color: "#1A1A1A", roles: CONFIG.TECH_ROLES };

        const ticketNum = Math.floor(1000 + Math.random() * 9000);
        const channel = await int.guild.channels.create({
            name: `${set.label.toLowerCase()}-${ticketNum}`,
            parent: CONFIG.CATEGORY_ID,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...set.roles.map(rid => ({ id: rid, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                ...CONFIG.AUTH_USERS.map(u => ({ id: u, allow: [PermissionsBitField.Flags.ViewChannel] }))
            ]
        });

        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({ name: `تـذكـرة جـديـدة بـإسـم: ${int.user.username}`, iconURL: int.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTitle(`🎫 إسـتـقـبال الـطـلـب | ${set.label} #${ticketNum}`)
            .setColor(set.color)
            .setDescription(`
                ◈ **مـعـلـومـات مـقـدم الـطـلـب**
                ┃
                ┃ 👤 **الـعـضـو:** ${int.user}
                ┃ 🆔 **الـبـيـانـات:** \`${f1}\`
                ┃ 🔢 **رقم الـتذكرة:** \`#${ticketNum}\`
                ┃
                ◈ **تـفـاصـيـل الـمـوضـوع**
                ┃
                ┃ \`\`\`${f2}\`\`\`
                ┃
                ─── ⋆⋅☆⋅⋆ ───
                *سـيـتم الـرد عـلـيـك مـن قـبـل الـمـسؤولـين قـريـباً.*
            `);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_tk').setLabel('استلام التذكرة').setStyle(ButtonStyle.Primary).setEmoji('📩'),
            new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger).setEmoji('📂')
        );

        await channel.send({ content: `${int.user} | ${set.roles.map(r => `<@&${r}>`).join(' ')}`, embeds: [welcomeEmbed], components: [row] });
        return int.editReply(`✅ تـم فـتح تـذكـرتـك: ${channel}`);
    }

    // 4. نظام استلام التذكرة
    if (int.isButton() && int.customId === 'claim_tk') {
        const claimEmbed = EmbedBuilder.from(int.message.embeds[0])
            .addFields({ name: '👮 حـالـة الاسـتـلام:', value: `┃ تـم الاسـتـلام بـواسـطـة: ${int.user}`, inline: false })
            .setColor("#5865F2");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claimed').setLabel('مُـسـتـلـمـة').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger).setEmoji('📂')
        );

        await int.update({ embeds: [claimEmbed], components: [row] });
        return int.followUp({ content: `✅ الـمـسؤول ${int.user} قـام بـاسـتـلام الـتـذكـرة لـمـتـابـعـتها.` });
    }

    // 5. نظام التقييم الخرافي
    if (int.isButton() && int.customId === 'register_tk') {
        const rateEmbed = new EmbedBuilder()
            .setTitle('⭐ تـقـيـيـم جـودة الـخـدمـة')
            .setDescription(`عـزيزي الـمواطن، تـقـيـيمـك لـلإدارة يـساعـدنا عـلـى الـتـطور وضـمان جـودة الـعـمل.`)
            .setColor("#FFD700");

        const stars = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
        );

        return int.reply({ embeds: [rateEmbed], components: [stars] });
    }

    // 6. الأرشيف العمودي المزخرف (بدون ملفات)
    if (int.isButton() && int.customId.startsWith('rate_')) {
        const rating = int.customId === 'rate_5' ? '⭐⭐⭐⭐⭐' : int.customId === 'rate_3' ? '⭐⭐⭐' : '⭐';
        await int.update({ content: '🔒 جـاري أرشفـة الـبـيـانـات وحـذف الـقـناة مـن الـنـظام...', embeds: [], components: [] });

        const msgs = await int.channel.messages.fetch({ limit: 100 });
        const history = msgs.reverse().filter(m => !m.author.bot).map(m => `┃ **${m.author.username}**: ${m.content}`).join('\n') || "┃ لا توجد رسائل مسجلة";

        const logChan = client.channels.cache.get(CONFIG.LOGS_ID);
        if (logChan) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: `أرشيـف الـتـذكـرة الـرسـمي | ${int.channel.name}`, iconURL: int.guild.iconURL() })
                .setColor("#FF0000")
                .setDescription(`
                    ◈ **مـعـلـومـات الـتـذكـرة**
                    ┃
                    ┃ **الـقـسـم:** \`${int.channel.name.split('-')[0].toUpperCase()}\`
                    ┃ **الـرقم:** \`#${int.channel.name.split('-')[1]}\`
                    ┃ **الـمُـغـلـق:** ${int.user}
                    ┃ **الـتـقـيـيـم:** ${rating}
                    ┃
                    ◈ **سـجـل الـمـحـادثـة الـعـمـودي**
                    ┃
                    ${history.substring(0, 1800)}
                    ┃
                    ◈ **نـهـايـة الأرشـيـف الـرسـمي**
                    ─── ⋆⋅☆⋅⋆ ───
                `)
                .setTimestamp();

            await logChan.send({ embeds: [logEmbed] });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 3000);
    }
});

client.login(CONFIG.TOKEN);
