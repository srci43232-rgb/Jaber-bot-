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

// --- الإعدادات الخاصة بك ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"], 
    CATEGORY: "1517931717061771294", 
    LOGS: "1517942325383270502", 
    STAFF_ROLES: ["1517002645666267197", "1517931426069348446", "1517931427600007258", "1517931425372962947"],
    TECH_ROLE: "1517931445149241356"
};

// تشغيل البوت وتسجيل أمر setup فقط
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Is Online!`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        // تسجيل أمر السيت اب فقط
        await guild.commands.set([{
            name: 'setup',
            description: 'إنشاء لوحة التحكم الفخمة لمدينة One City RP'
        }]);
    }
});

client.on('interactionCreate', async (int) => {
    
    // 1. تنفيذ أمر /setup
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) {
            return int.reply({ content: "❌ عذراً، هذا الأمر مخصص للإدارة العليا فقط.", ephemeral: true });
        }

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | مـركـز الـدعم والـبـلاغـات', iconURL: int.guild.iconURL() })
            .setTitle('🌆 نـظام الـتـذاكـر الـمـوحـد لـلـمـديـنـة')
            .setDescription(`
                > **مـرحـباً بـك فـي مـديـنـة One City.. حـيـث نـصـنع الـواقـع**
                
                نـحن هـنا لـنوفـر لـك أفـضل بـيئة لـعب مـمكنة. إذا كـنت تـواجـه أي مـشكلة أو تـود تـقديم بـلاغ، يـرجى اخـتـيار الـقـسم الـمـنـاسب أدناه:

                **『 الأقـسـام الـمـتـوفـرة 』**
                
                🟢 **بـلاغ ضـد لاعـب**
                *لـلإبـلاغ عـن مـخـالـفي الـقـوانـين داخـل الـمـديـنة.*
                
                🔴 **بـلاغ ضـد إداري**
                *لـلـتـواصـل مـع الإدارة الـعـلـيـا بـخـصـوص طـاقـم الـعـمـل.*
                
                ⚫ **الـدعم الـفـنـي الـعـام**
                *لـلـمـساعدة الـتـقـنـية، الـتـعـويضـات، والاسـتـفسـارات.*

                ─── ⋆⋅☆⋅⋆ ───
                **تـنـبـيـه:** بـعـد الـضـغـط عـلـى الـزر، يـجـب عـلـيـك تـعبئة بـيـاناتك لـتـتمكن مـن فـتح الـتـذكـرة.
            `)
            .setColor("#FF0000") // أحمر لامع فخم للوصف
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Quality & Professionalism', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('p_t').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('s_t').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('t_t').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. إظهار المودال عند الضغط على الأزرار
    if (int.isButton() && ['p_t', 's_t', 't_t'].includes(int.customId)) {
        const modal = new ModalBuilder().setCustomId(`mod_${int.customId}`).setTitle('إسـتـمـارة فـتـح الـتـذكـرة');
        
        const input1 = new TextInputBuilder()
            .setCustomId('user_info')
            .setLabel("الاسم والآيدي الخاص بك")
            .setPlaceholder('مثال: صقر | 1349')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const input2 = new TextInputBuilder()
            .setCustomId('issue_info')
            .setLabel("شرح البلاغ أو المشكلة")
            .setPlaceholder('يرجى كتابة التفاصيل هنا...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
        return int.showModal(modal);
    }

    // 3. معالجة المودال وفتح التذكرة
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true });
        
        const uInfo = int.fields.getTextInputValue('user_info');
        const uIssue = int.fields.getTextInputValue('issue_info');
        
        let setup = { label: "تذكرة", color: "#FFFFFF", roles: [] };
        if (int.customId.includes('p_t')) setup = { label: "ضد-لاعب", color: "#00FF00", roles: CONFIG.STAFF_ROLES };
        else if (int.customId.includes('s_t')) setup = { label: "ضد-اداري", color: "#FF0000", roles: CONFIG.STAFF_ROLES };
        else setup = { label: "دعم-فني", color: "#2B2D31", roles: [CONFIG.TECH_ROLE] };

        try {
            const channel = await int.guild.channels.create({
                name: `${setup.label}-${int.user.username}`,
                parent: CONFIG.CATEGORY,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...setup.roles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                    ...CONFIG.AUTH_USERS.map(u => ({ id: u, allow: [PermissionsBitField.Flags.ViewChannel] }))
                ]
            });

            const welcome = new EmbedBuilder()
                .setTitle(`🎫 تـذكـرة جـديـدة | قـسم ${setup.label}`)
                .setColor(setup.color)
                .addFields(
                    { name: '👤 الـعـضـو:', value: `${int.user} (${uInfo})`, inline: true },
                    { name: '📝 الـمـوضـوع:', value: `\`\`\`${uIssue}\`\`\`` }
                )
                .setTimestamp()
                .setFooter({ text: 'One City RP Support System' });

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_now').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger)
            );

            await channel.send({ content: `${int.user} | <@&${setup.roles[0] || CONFIG.AUTH_USERS[0]}>`, embeds: [welcome], components: [closeRow] });
            return int.editReply(`✅ تم فتح تذكرتك بنجاح: ${channel}`);
        } catch (e) {
            return int.editReply("❌ حدث خطأ: تأكد من صلاحيات البوت (Administrator) ووجود الكاتجوري.");
        }
    }

    // 4. نظام الإغلاق والأرشيف
    if (int.isButton() && int.customId === 'close_now') {
        await int.reply("🔒 جاري أرشفة المحادثة وإغلاق القناة...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let logData = `--- ARCHIVE FOR: ${int.channel.name} ---\n\n`;
        msgs.reverse().forEach(m => {
            logData += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        const logChan = client.channels.cache.get(CONFIG.LOGS);
        if (logChan) {
            await logChan.send({ 
                content: `📁 **أرشيف تذكرة: \`${int.channel.name}\`**\nتم الإغلاق بواسطة: ${int.user}`,
                files: [{ attachment: Buffer.from(logData), name: `log-${int.channel.name}.txt` }] 
            });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 4000);
    }
});

client.login(CONFIG.TOKEN);
