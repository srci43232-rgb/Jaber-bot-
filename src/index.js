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
        GatewayIntentBits.GuildVoiceStates
    ]
});

// --- إعدادات مدينة One City RP ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    CATEGORY_ID: "1517931620018159626",
    LOGS_ID: "1517942325383270502",
    WELCOME_ID: "1517931611994193980",
    NEW_USER_ROLE: "1518613075140284446",
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"],

    PLAYER_ROLES: ["1517931439054913596", "1517931433199669533", "1517931427600007258", "1517931426069348446"],
    STAFF_ROLES: ["1517931426069348446", "1517931425372962947", "1517002645666267197", "1517164221329309727", "1517144275836735628", "1517002643619446855", "1517002644676411592"],
    TECH_ROLES: ["1518455838858150058"]
};

// وظيفة التحقق من الإدارة
function isStaff(member) {
    if (!member) return false;
    const allStaffRoles = [...CONFIG.PLAYER_ROLES, ...CONFIG.STAFF_ROLES, ...CONFIG.TECH_ROLES];
    return member.roles.cache.hasAny(...allStaffRoles) || CONFIG.AUTH_USERS.includes(member.id);
}

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ One City Royal System Activated: ${c.user.tag}`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) await guild.commands.set([{ name: 'setup', description: 'تجهيز المنصة الإدارية الملكية' }]);
});

// --- نظام الترحيب الفخم ---
client.on(Events.GuildMemberAdd, async (member) => {
    if (!isStaff(member) && !member.user.bot) {
        await member.roles.add(CONFIG.NEW_USER_ROLE).catch(() => {});
    }

    const welcomeChan = member.guild.channels.cache.get(CONFIG.WELCOME_ID);
    if (welcomeChan) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ name: `سِجِل القادمين الجدد | One City RP`, iconURL: member.guild.iconURL() })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTitle(`✨ أهلاً بك في مدينة النخبة ✨`)
            .setDescription(`
                ╭─── · · 🏙️ · · ───╮
                  **مرحباً بك عزيزي المواطن**
                  ${member}
                ╰─── · · 🏙️ · · ───╯

                > **تـشـرفـنـا بـانـضـمـامـك إلـى أفـخـم بـيـئـة لـعـب واقـعـي.. نـتـمـنـى لـك إقـامـة مـمـتـعـة داخـل أسـوار مـديـنـتـنـا.**

                ◈ **مـعـلـومـات الـدخـول:**
                ┃ 🆔 **الآيدي:** \`${member.id}\`
                ┃ 📅 **انضمام:** <t:${Math.floor(Date.now() / 1000)}:R>
                ┃ 🔢 **الرقم:** \`#${member.guild.memberCount}\`

                ─── ⋆⋅☆⋅⋆ ───
                📜 يرجى مراجعة القوانين لتجنب العقوبات.
                🏛️ لأي استفسار، توجه لقسم التذاكر.
            `)
            .setFooter({ text: `One City RP - Management`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        await welcomeChan.send({ content: `||${member}||`, embeds: [welcomeEmbed] });
    }
});

// --- أوامر الإدارة وحماية الروابط ---
client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    // حماية الروابط (Kick)
    const linkRegex = /(https?:\/\/|discord\.gg|www\.)/i;
    if (linkRegex.test(msg.content) && !isStaff(msg.member)) {
        await msg.delete().catch(() => {});
        await msg.member.kick("إرسال روابط محظورة").catch(() => {});
        return;
    }

    // أوامر الإدارة الصويتة
    const args = msg.content.split(' ');
    const command = args[0].toLowerCase();

    if (command === '!move' && isStaff(msg.member)) {
        const target = msg.mentions.members.first();
        const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[2]);
        if (target && channel && channel.type === ChannelType.GuildVoice) {
            await target.voice.setChannel(channel);
            msg.reply(`✅ تم نقل **${target.user.username}** إلى **${channel.name}** بنجاح.`);
        } else {
            msg.reply(`❌ يرجى منشن العضو ثم تحديد الروم الصوتي. مثال: \`!move @عضو #روم\``);
        }
    }

    if (command === '!dc' && isStaff(msg.member)) {
        const target = msg.mentions.members.first();
        if (target && target.voice.channel) {
            await target.voice.disconnect();
            msg.reply(`✅ تم طرد **${target.user.username}** من الروم الصوتي.`);
        } else {
            msg.reply(`❌ العضو ليس متواجداً في روم صوتي.`);
        }
    }
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. لوحة الـ Setup الملكية الفخمة
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ إدارة عليا فقط", ephemeral: true });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | الـقـيادة الـعـلـيـا لـلـمـديـنـة', iconURL: int.guild.iconURL() })
            .setTitle('🏛️ الـمـركـز الإداري والـقـضـائـي الـمـوحـد')
            .setDescription(`
                ╭─── · · 🏛️ · · ───╮
                  **مـرحـبـاً بـك عـزيـزي الـمـواطـن**
                  **فـي مـديـنـة One City**
                ╰─── · · 🏛️ · · ───╯

                ┃ نـحـن هـنـا لـنـرسـخ مـفـاهـيـم الـعـدالة والـفـخـامـة الـمـثـلـى.
                ┃ إذا كـنـت تـبـحـث عـن الإنـصـاف أو الـدعم، فـأنت فـي
                ┃ الـمـكـان الـصـحـيـح. يـرجى اخـتـيار الـديـوان الـمـنـاسب:

                ◈ **الـدوائـر الإداريـة الـمـتـاحـة:**
                
                🟢 **ديـوان الـنـزاعات الـعـامـة (لاعب)**
                🔴 **ديـوان الـمـظالـم الـعـلـيـا (إداري)**
                ⚫ **مـركـز الـصـيـانـة والـدعم (فني)**

                ─── ⋆⋅☆⋅⋆ ───
                **📝 إرشاد:** اضـغط عـلى الـزر لـتـقـديـم بـيـانـاتـك لـلإدارة.
            `)
            .setColor("#FF0000")
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Excellence & Majesty', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('op_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('op_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger).setEmoji('🔴'),
            new ButtonBuilder().setCustomId('op_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary).setEmoji('⚫')
        );
        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. المودال المحسن
    if (int.isButton() && int.customId.startsWith('op_')) {
        const modal = new ModalBuilder().setCustomId(`m_${int.customId}`).setTitle('إسـتـمـارة الـطـلـب الـرسـمـيـة');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i1').setLabel("الاسم (مثال: Jaber)").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i2').setLabel("شرح المشكلة بالتفصيل").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        return int.showModal(modal);
    }

    // 3. فتح التذكرة
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
            .setTitle(`🏛️ ديـوان الـخدمـة | ${set.label} #${ticketNum}`)
            .setColor(set.color)
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`◈ **بـيـانـات مـقـدم الـطـلـب**\n┃ 👤 **الأسـم:** \`${f1}\`\n┃ 🆔 **الـهـويـة:** ${int.user}\n┃ 🔢 **الـتـسـلـسـل:** \`#${ticketNum}\`\n\n◈ **مـوضـوع الـطـلـب**\n┃ \`\`\`${f2}\`\`\`\n─── ⋆⋅☆⋅⋆ ───\n*بـانـتـظار مـعـالـجـة الـمـوظف الـمـسؤول.*`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_tk').setLabel('استلام التذكرة').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${int.user} | ${set.roles.map(r => `<@&${r}>`).join(' ')}`, embeds: [welcomeEmbed], components: [row] });
        return int.editReply(`✅ تم فتح طلبك بنجاح: ${channel}`);
    }

    // 4. حماية الأزرار
    if (int.isButton() && (int.customId === 'claim_tk' || int.customId === 'register_tk' || int.customId.startsWith('rate_'))) {
        if (!isStaff(int.member)) return int.reply({ content: "⚠️ هذا الزر مخصص لطاقم الإدارة فقط.", ephemeral: true });
    }

    // 5. الاستلام والأرشفة
    if (int.isButton() && int.customId === 'claim_tk') {
        const claimEmbed = EmbedBuilder.from(int.message.embeds[0])
            .addFields({ name: '👮 الـموظـف الـمسؤول:', value: `┃ ${int.user}`, inline: false }).setColor("#5865F2");
        await int.update({ embeds: [claimEmbed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('register_tk').setLabel('تسجيل وإغلاق').setStyle(ButtonStyle.Danger))] });
    }

    if (int.isButton() && int.customId === 'register_tk') {
        const stars = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
        );
        return int.reply({ content: "⭐ يـرجـى تـقـيـيـم خـدمـتـنا قـبـل الإغـلاق نـهـائـيـاً:", components: [stars] });
    }

    if (int.isButton() && int.customId.startsWith('rate_')) {
        const rating = int.customId === 'rate_5' ? '⭐⭐⭐⭐⭐' : '⭐';
        await int.update({ content: '🔒 جـاري الأرشفـة والـحـذف...', components: [] });

        const msgs = await int.channel.messages.fetch({ limit: 50 });
        const history = msgs.reverse().filter(m => !m.author.bot).map(m => `┃ **${m.author.username}**: ${m.content}`).join('\n');
        
        const logChan = client.channels.cache.get(CONFIG.LOGS_ID);
        if (logChan) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: 'سـجـلات One City الـرسمـيـة', iconURL: int.guild.iconURL() })
                .setColor("#FF0000")
                .setDescription(`
                    ◈ **تـفـاصـيـل الأرشـيـف الـعـمـودي**
                    ┃
                    ┃ 📄 **الـقـسم:** \`${int.channel.name.split('-')[0].toUpperCase()}\`
                    ┃ 🆔 **الـتـسـلـسـل:** \`#${int.channel.name.split('-')[1]}\`
                    ┃ 👤 **الـمُـغـلـق:** ${int.user}
                    ┃ 🎖️ **الرتب:** \`${int.member.roles.cache.map(r => r.name).join(', ')}\`
                    ┃ ⭐ **الـتـقـيـيـم:** ${rating}
                    ┃
                    ◈ **سـجـل الـمـحـادثـة**
                    ┃
                    ${history.substring(0, 1800)}
                    ┃
                    ─── ⋆⋅☆⋅⋆ ───
                `).setTimestamp();
            await logChan.send({ embeds: [logEmbed] });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 3000);
    }
});

client.login(CONFIG.TOKEN);
