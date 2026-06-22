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

// --- الإعدادات (تأكد من دقتها) ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"], 
    CATEGORY: "1517931717061771294", 
    LOGS: "1517942325383270502", 
    STAFF_ROLES: ["1517002645666267197", "1517931426069348446", "1517931427600007258", "1517931425372962947"],
    TECH_ROLE: "1517931445149241356"
};

// استخدام حدث ClientReady لإزالة التحذير
client.once(Events.ClientReady, async (c) => {
    console.log(`✅ ${c.user.tag} جاهز للعمل على السيرفر!`);
    
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        try {
            await guild.commands.set([{
                name: 'setup',
                description: 'إنشاء لوحة التحكم الفخمة لمدينة One City RP'
            }]);
            console.log('✅ تم تحديث أمر /setup بنجاح.');
        } catch (err) {
            console.error('❌ خطأ في تسجيل الأوامر:', err);
        }
    } else {
        console.error('❌ لم يتم العثور على السيرفر! تأكد من صحة الآيدي.');
    }
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. أمر /setup
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
            .setColor("#FF0000")
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Quality & Professionalism', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('p_t').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('s_t').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('t_t').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. إظهار المودال (الاستمارة)
    if (int.isButton() && ['p_t', 's_t', 't_t'].includes(int.customId)) {
        const modal = new ModalBuilder().setCustomId(`mod_${int.customId}`).setTitle('إسـتـمـارة فـتـح الـتـذكـرة');
        
        const input1 = new TextInputBuilder().setCustomId('u_info').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true);
        const input2 = new TextInputBuilder().setCustomId('u_issue').setLabel("شرح البلاغ أو المشكلة").setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
        return int.showModal(modal);
    }

    // 3. معالجة المودال وفتح القناة
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true });
        
        const uInfo = int.fields.getTextInputValue('u_info');
        const uIssue = int.fields.getTextInputValue('u_issue');
        
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
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_now').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger)
            );

            await channel.send({ content: `${int.user} | <@&${setup.roles[0] || CONFIG.AUTH_USERS[0]}>`, embeds: [welcome], components: [row] });
            return int.editReply(`✅ تم فتح تذكرتك بنجاح: ${channel}`);
        } catch (e) {
            console.error(e);
            return int.editReply("❌ خطأ: تأكد أن رتبة البوت عالية ولديه صلاحية Administrator.");
        }
    }

    // 4. نظام الإغلاق
    if (int.isButton() && int.customId === 'close_now') {
        await int.reply("🔒 جاري الحفظ والإغلاق...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let log = msgs.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');

        const logChan = client.channels.cache.get(CONFIG.LOGS);
        if (logChan) {
            await logChan.send({ 
                content: `📁 أرشيف تذكرة: ${int.channel.name}`,
                files: [{ attachment: Buffer.from(log), name: `log-${int.channel.name}.txt` }] 
            });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 3000);
    }
});

client.login(CONFIG.TOKEN);
