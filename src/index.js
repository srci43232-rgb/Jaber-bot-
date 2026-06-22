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

// --- الإعدادات الخاصة بك ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    GUILD_ID: "1381360453485334658",
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"], 
    CATEGORY_ID: "1517931717061771294", 
    LOGS_ID: "1517942325383270502", 
    STAFF_ROLES: ["1517002645666267197", "1517931426069348446", "1517931427600007258", "1517931425372962947"],
    TECH_ROLE_ID: "1517931445149241356"
};

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ ${c.user.tag} متصل وجاهز!`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        await guild.commands.set([{ name: 'setup', description: 'تجهيز لوحة تذاكر One City RP' }]);
    }
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. أمر Setup الفخم
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ للإدارة العليا فقط", ephemeral: true });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | المـركـز الـمـوحـد لـلـبـلاغـات', iconURL: int.guild.iconURL() })
            .setTitle('🌆 نـظام الـتـواصل الإداري والـفـني الـمـتـطور')
            .setDescription(`
                > **أهـلاً بـك فـي مـديـنـة One City.. حـيـث نـصـنع الـواقـع**
                
                لـضمان تـجربة لـعب عـادلة ونـقية مـن الـمـخالـفات، وفـرنا لـكم هـذا الـنظام الـمـتـكامل. يـرجى اخـتـيار الـقـسم الـمـنـاسب لـحـالـتـك لـيتم مـعـالـجـتها مـن قـبـل الـمـختـصين.

                **『 الـخـدمات الـمـتـوفـرة 』**
                
                🟢 **بـلاغ ضـد لاعـب**
                *لـلإبلاغ عـن مـخالـفة قـوانـين أو سـلوك غـير لائـق.*
                
                🔴 **بـلاغ ضـد إداري**
                *لـلـشكاوي الـموجـهة للإدارة الـعـلـيـا بـخـصـوص طـاقـم الـعـمـل.*
                
                ⚫ **الـدعم الـفـنـي الـعـام**
                *لـلـمـساعدة، الـبوقات، الـتعـويضـات، أو الاسـتـفـسارات.*

                ─── ⋆⋅☆⋅⋆ ───
                **مـلاحـظـة:** كـل قـسم يـحتوي عـلى نـمـوذج بـيـانـات خـاص يـجب تـعبئـته بدقة.
            `)
            .setColor("#FF0000") // أحمر لامع
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Professionalism & Quality', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. إظهار النماذج الفخمة (Modals)
    if (int.isButton()) {
        if (int.customId === 'ticket_player') {
            const modal = new ModalBuilder().setCustomId('mod_player').setTitle('بلاغ سلوك غير لائق / مخالفة');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('p_name').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('p_target').setLabel("آيدي الشخص المُبلغ عنه").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('p_type').setLabel("نوع المخالفة (VDM, RDM, الخ...)").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('p_details').setLabel("شرح الواقعة بالتفصيل").setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('p_proof').setLabel("رابط الدليل (فيديو/صورة)").setPlaceholder("https://...").setStyle(TextInputStyle.Short).setRequired(true))
            );
            return int.showModal(modal);
        }

        if (int.customId === 'ticket_staff') {
            const modal = new ModalBuilder().setCustomId('mod_staff').setTitle('شكوى إدارية رسمية');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_name').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_target').setLabel("اسم الإداري المعني بالشكوى").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_details').setLabel("وصف الموقف وما حدث بالتفصيل").setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_proof').setLabel("رابط الدليل (إن وجد)").setStyle(TextInputStyle.Short).setRequired(false))
            );
            return int.showModal(modal);
        }

        if (int.customId === 'ticket_tech') {
            const modal = new ModalBuilder().setCustomId('mod_tech').setTitle('طلب دعم فني / تعويض');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t_name').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t_type').setLabel("نوع المشكلة (بوق، تعويض، استفسار)").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t_details').setLabel("شرح المشكلة أو العناصر المفقودة").setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t_proof').setLabel("رابط الدليل (إلزامي للتعويضات)").setStyle(TextInputStyle.Short).setRequired(false))
            );
            return int.showModal(modal);
        }
    }

    // 3. معالجة إرسال البيانات وفتح التذكرة
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true });
        
        let setup = { label: "تذكرة", color: "#FFFFFF", roles: CONFIG.STAFF_ROLES, fields: [] };

        if (int.customId === 'mod_player') {
            setup = { 
                label: "بلاغ-لاعب", color: "#00FF00", roles: CONFIG.STAFF_ROLES,
                fields: [
                    { name: '👤 صاحب البلاغ:', value: int.fields.getTextInputValue('p_name'), inline: true },
                    { name: '🆔 آيدي المُبلغ عنه:', value: int.fields.getTextInputValue('p_target'), inline: true },
                    { name: '⚖️ نوع المخالفة:', value: int.fields.getTextInputValue('p_type'), inline: true },
                    { name: '📝 التفاصيل:', value: `\`\`\`${int.fields.getTextInputValue('p_details')}\`\`\`` },
                    { name: '🎬 الدليل:', value: int.fields.getTextInputValue('p_proof') }
                ]
            };
        } else if (int.customId === 'mod_staff') {
            setup = { 
                label: "شكوى-إدارية", color: "#FF0000", roles: CONFIG.STAFF_ROLES,
                fields: [
                    { name: '👤 صاحب الشكوى:', value: int.fields.getTextInputValue('s_name'), inline: true },
                    { name: '👮 الإداري المعني:', value: int.fields.getTextInputValue('s_target'), inline: true },
                    { name: '📝 الموقف:', value: `\`\`\`${int.fields.getTextInputValue('s_details')}\`\`\`` },
                    { name: '🎬 الدليل:', value: int.fields.getTextInputValue('s_proof') || "لا يوجد" }
                ]
            };
        } else if (int.customId === 'mod_tech') {
            setup = { 
                label: "دعم-فني", color: "#000000", roles: [CONFIG.TECH_ROLE_ID],
                fields: [
                    { name: '👤 صاحب الطلب:', value: int.fields.getTextInputValue('t_name'), inline: true },
                    { name: '🛠️ نوع الطلب:', value: int.fields.getTextInputValue('t_type'), inline: true },
                    { name: '📝 الشرح:', value: `\`\`\`${int.fields.getTextInputValue('t_details')}\`\`\`` },
                    { name: '🎬 الدليل:', value: int.fields.getTextInputValue('t_proof') || "لا يوجد" }
                ]
            };
        }

        try {
            const channel = await int.guild.channels.create({
                name: `${setup.label}-${int.user.username}`,
                parent: CONFIG.CATEGORY_ID,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: int.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: int.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...setup.roles.map(id => ({ id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                    ...CONFIG.AUTH_USERS.map(id => ({ id, allow: [PermissionsBitField.Flags.ViewChannel] }))
                ]
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`🎫 إسـتـمارة تـذكـرة جـديـدة | قـسم ${setup.label}`)
                .setColor(setup.color)
                .addFields(setup.fields)
                .setTimestamp()
                .setFooter({ text: 'One City RP Support System' });

            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_now').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger));

            await channel.send({ content: `${int.user} | <@&${setup.roles[0]}>`, embeds: [welcomeEmbed], components: [row] });
            return int.editReply(`✅ تم فتح تذكرتك بنجاح: ${channel}`);
        } catch (e) {
            return int.editReply(`❌ فشل إنشاء التذكرة. تأكد من صلاحيات البوت. الخطأ: ${e.message}`);
        }
    }

    // 4. نظام الإغلاق والأرشيف
    if (int.isButton() && int.customId === 'close_now') {
        await int.reply("🔒 جاري حفظ البيانات وإغلاق القناة...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let logStream = `--- ARCHIVE: ${int.channel.name} ---\n\n`;
        msgs.reverse().forEach(m => { logStream += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`; });

        const logChan = client.channels.cache.get(CONFIG.LOGS_ID);
        if (logChan) {
            await logChan.send({ 
                content: `📁 **أرشيف تذكرة: \`${int.channel.name}\`**\nبواسطة: ${int.user}`,
                files: [{ attachment: Buffer.from(logStream), name: `log-${int.channel.name}.txt` }] 
            });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 4000);
    }
});

client.login(CONFIG.TOKEN);
