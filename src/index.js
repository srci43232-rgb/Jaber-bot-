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
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration // ضروري للحظر
    ]
});

// --- إعدادات مدينة One City RP ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    CATEGORY_ID: "1517931620018159626",
    LOGS_ID: "1517942325383270502",
    NEW_USER_ROLE: "1518613075140284446", // رتبة الأعضاء الجدد
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"],

    PLAYER_ROLES: ["1517931439054913596", "1517931433199669533", "1517931427600007258", "1517931426069348446"],
    STAFF_ROLES: ["1517931426069348446", "1517931425372962947", "1517002645666267197", "1517164221329309727", "1517144275836735628", "1517002643619446855", "1517002644676411592"],
    TECH_ROLES: ["1518455838858150058"]
};

// وظيفة للتحقق إذا كان الشخص إداري
function isStaff(member) {
    if (!member) return false;
    const allStaffRoles = [...CONFIG.PLAYER_ROLES, ...CONFIG.STAFF_ROLES, ...CONFIG.TECH_ROLES];
    return member.roles.cache.hasAny(...allStaffRoles) || CONFIG.AUTH_USERS.includes(member.id);
}

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ One City Royal System is Live: ${c.user.tag}`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        await guild.commands.set([{ name: 'setup', description: 'تجهيز المنصة الإدارية الملكية' }]);
        
        // إعطاء الرتبة للأعضاء الحاليين غير الإداريين عند تشغيل البوت
        const members = await guild.members.fetch();
        members.forEach(member => {
            if (!isStaff(member) && !member.user.bot && !member.roles.cache.has(CONFIG.NEW_USER_ROLE)) {
                member.roles.add(CONFIG.NEW_USER_ROLE).catch(() => {});
            }
        });
    }
});

// إعطاء الرتبة للقادمين الجدد
client.on(Events.GuildMemberAdd, (member) => {
    if (!isStaff(member) && !member.user.bot) {
        member.roles.add(CONFIG.NEW_USER_ROLE).catch(() => {});
    }
});

// نظام حماية الروابط (Anti-Link) مع الحظر الفوري
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    
    const linkRegex = /(https?:\/\/|discord\.gg|www\.)/i;
    if (linkRegex.test(message.content) && !isStaff(message.member)) {
        try {
            await message.delete();
            const logChan = message.guild.channels.cache.get(CONFIG.LOGS_ID);
            
            await message.member.ban({ reason: "إرسال روابط في القنوات العامة (نظام الحماية)" });

            if (logChan) {
                const banEmbed = new EmbedBuilder()
                    .setTitle('🛡️ نـظـام الـحـمـايـة | حـظر فـوري')
                    .setColor("#FF0000")
                    .setDescription(`
                        > **تـم اكـتـشاف مـخـالـفة مـن قـبـل نـظام الـحمـاية**
                        
                        👤 **الـلاعب:** ${message.author.tag}
                        🆔 **الآيدي:** \`${message.author.id}\`
                        ⚠️ **الـمخالـفة:** إرسـال روابـط مـحـظورة
                        ⚖️ **الإجـراء:** طـرد نـهائي مـن الـمـديـنة (Ban)
                    `)
                    .setTimestamp();
                await logChan.send({ embeds: [banEmbed] });
            }
        } catch (err) { console.error(err); }
    }
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. لوحة الـ Setup الملكية
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ إدارة عليا فقط", ephemeral: true });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | الـقـيادة الـعـلـيـا لـلـمـديـنـة', iconURL: int.guild.iconURL() })
            .setTitle('🏛️ الـمـركـز الإداري الـمـوحـد لـلـمـواطـنـيـن')
            .setDescription(`
                \n**مـرحـباً بـك فـي أروقـة نـظـام One City الـمـلكـي**\n
                نـحـن هـنـا لـنـرسخ مـفاهـيم الـعـدالة والـواقـعـية الـمـثـلـى. إذا كـنـت تـبـحـث عـن الإنـصاف أو الـدعم، فـأنت فـي الـمـكان الـصـحيح. يـرجى اخـتـيار الـديـوان الـمـنـاسب لـمـظـلـمـتـك:

                **『 الـدوائـر الإداريـة الـمـتـاحـة 』**
                
                🟢 **ديـوان الـنـزاعات (ضد لاعب)**
                🔴 **ديـوان الـمـظالـم الـعـلـيا (ضد إداري)**
                ⚫ **مـركـز الـصـيـانة والـدعم (الدعم الفني)**

                ─── ⋆⋅☆⋅⋆ ───
                **📝 إرشاد:** اضـغط عـلى الـزر لـتـقـديـم بـيـانـاتـك لـلإدارة.
            `)
            .setColor("#FF0000").setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Quality & Majesty', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('op_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('op_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger).setEmoji('🔴'),
            new ButtonBuilder().setCustomId('op_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary).setEmoji('⚫')
        );
        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. النماذج
    if (int.isButton() && int.customId.startsWith('op_')) {
        const modal = new ModalBuilder().setCustomId(`m_${int.customId}`).setTitle('إسـتـمـارة الـطـلـب الـرسـمـيـة');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i1').setLabel("الاسم والآيدي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i2').setLabel("شرح الموقف بالتفصيل").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        return int.showModal(modal);
    }

    // 3. فتح التذكرة الواقعية جداً
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
            permissionOverwrites: [
                { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...set.roles.map(rid => ({ id: rid, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ]
        });

        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({ name: `طـلـب مـواطـن: ${int.user.username}`, iconURL: int.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true }))
            .setTitle(`🏛️ ديـوان الـخدمـة | ${set.label} #${ticketNum}`)
            .setColor(set.color)
            .setDescription(`
                ◈ **بـيـانـات مـقـدم الـطـلـب**
                ┃ 👤 **الـهـويـة:** ${int.user}
                ┃ 🆔 **الـسـجـل:** \`${f1}\`
                ┃ 🔢 **الـتـسـلـسـل:** \`#${ticketNum}\`
                ┃
                ◈ **مـوضـوع الـطـلـب**
                ┃ \`\`\`${f2}\`\`\`
                ─── ⋆⋅☆⋅⋆ ───
                *بـانـتـظار مـعـالـجـة الـمـوظف الـمـسؤول.*
            `);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_tk').setLabel('استلام التذكرة').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${int.user} | ${set.roles.map(r => `<@&${r}>`).join(' ')}`, embeds: [welcomeEmbed], components: [row] });
        return int.editReply(`✅ تـم فـتـح طـلـبك بـنـجـاح: ${channel}`);
    }

    // 4. استلام التذكرة
    if (int.isButton() && int.customId === 'claim_tk') {
        const claimEmbed = EmbedBuilder.from(int.message.embeds[0])
            .addFields({ name: '👮 الـموظـف الـمسؤول:', value: `┃ ${int.user}`, inline: false })
            .setColor("#5865F2");

        await int.update({ embeds: [claimEmbed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger))] });
    }

    // 5. التقييم والإغلاق مع الأرشفة الملكية
    if (int.isButton() && int.customId === 'register_tk') {
        const stars = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
        );
        return int.reply({ content: "⭐ **يـرجـى تـقـيـيـم خـدمـتـنا قـبـل الإغـلاق:**", components: [stars] });
    }

    if (int.isButton() && int.customId.startsWith('rate_')) {
        const rating = int.customId === 'rate_5' ? '⭐⭐⭐⭐⭐' : '⭐';
        await int.update({ content: '🔒 **جـاري الأرشفـة والـتـسجـيل...**', components: [] });

        const msgs = await int.channel.messages.fetch({ limit: 50 });
        const history = msgs.reverse().filter(m => !m.author.bot).map(m => `┃ **${m.author.username}**: ${m.content}`).join('\n');
        
        // جلب رتب العضو
        const member = await int.guild.members.fetch(int.channel.name.split('-')[1]).catch(() => null);
        const roles = int.member.roles.cache.map(r => r.name).join(', ');

        const logChan = client.channels.cache.get(CONFIG.LOGS_ID);
        if (logChan) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: 'سـجـلات One City الـرسمـيـة', iconURL: int.guild.iconURL() })
                .setColor("#FF0000")
                .setDescription(`
                    ◈ **تـفـاصـيـل الأرشـيـف**
                    ┃
                    ┃ 📄 **الـقـسم:** \`${int.channel.name.split('-')[0].toUpperCase()}\`
                    ┃ 🆔 **الـتـسـلـسـل:** \`#${int.channel.name.split('-')[1]}\`
                    ┃ 👤 **الـمُـغـلـق:** ${int.user}
                    ┃ 🎖️ **رتب الـمغـلـق:** \`${roles}\`
                    ┃ ⭐ **الـتـقـيـيـم:** ${rating}
                    ┃
                    ◈ **الـسـجـل الـنـصـي**
                    ┃
                    ${history.substring(0, 1500)}
                    ┃
                    ─── ⋆⋅☆⋅⋆ ───
                `)
                .setTimestamp();
            await logChan.send({ embeds: [logEmbed] });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 3000);
    }
});

client.login(CONFIG.TOKEN);
