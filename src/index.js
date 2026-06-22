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
    AUTH_USERS: ["1349214233262297149", "1517002644676411592"], // الإدارة العليا
    CATEGORY_ID: "1517931620018159626", // آيدي الفئة الصحيح
    LOGS_ID: "1517942325383270502", // قناة الأرشيف
    STAFF_ROLES: ["1517002645666267197", "1517931426069348446", "1517931427600007258", "1517931425372962947"],
    TECH_ROLE: "1517931445149241356"
};

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ المتحدث الرسمي باسم One City متصل: ${c.user.tag}`);
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
        await guild.commands.set([{ name: 'setup', description: 'تجهيز لوحة نظام التذاكر المطور' }]);
    }
});

client.on(Events.InteractionCreate, async (int) => {
    
    // 1. أمر إعداد اللوحة (Setup)
    if (int.isChatInputCommand() && int.commandName === 'setup') {
        if (!CONFIG.AUTH_USERS.includes(int.user.id)) return int.reply({ content: "❌ هذا الأمر مخصص للإدارة العليا فقط.", ephemeral: true });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: 'ONE CITY ROLEPLAY | الـدعم الـفـنـي والـبـلاغـات', iconURL: int.guild.iconURL() })
            .setTitle('🌆 نـظام الـتـواصل الإداري والـفـني الـمـوحـد')
            .setDescription(`
                > **مـرحـباً بـك فـي مـديـنـة One City.. حـيـث نـصـنع الـواقـع**
                
                نـحن نـؤمـن بـأن الـعـدالة والـنـظـام هـما أساس الـتـمـيز. إذا كـنت تـواجـه مـشكلة أو تـود تـقـديـم بـلاغ، يـرجى اخـتـيار الـقـسم الـمـنـاسب لـحـالـتـك لـيتم مـعـالـجـتها مـن قـبـل الـمـختـصين.

                **『 الـخـدمات الـمـتـوفـرة 』**
                
                🟢 **بـلاغ ضـد لاعـب**
                *لـلإبلاغ عـن مـخالـفة قـوانـين أو سـلوك غـير لائـق.*
                
                🔴 **بـلاغ ضـد إداري**
                *لـلـشكاوي الـموجـهة للإدارة الـعـلـيـا بـخـصـوص طـاقـم الـعـمـل.*
                
                ⚫ **الـدعم الـفـنـي الـعـام**
                *لـلـمـساعدة، الـبوقات، الـتعـويضـات، أو الاسـتـفـسارات.*

                ─── ⋆⋅☆⋅⋆ ───
                **مـلاحـظـة:** يـجـب عـلـيـك تـعبئة نـمـوذج الـبـيـانـات بـدقـة بـعد الضـغـط عـلـى الـزر.
            `)
            .setColor("#FF0000") // أحمر لامع
            .setThumbnail(int.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'One City RP | Professionalism & Excellence', iconURL: int.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('btn_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('btn_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return int.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. إظهار النماذج الاحترافية (Modals)
    if (int.isButton()) {
        if (int.customId === 'btn_player') {
            const modal = new ModalBuilder().setCustomId('mod_player').setTitle('بلاغ سلوك / مخالفة قوانين');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i_name').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i_target').setLabel("آيدي الشخص المُبلغ عنه").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i_reason').setLabel("شرح الواقعة وما حدث بالتفصيل").setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('i_proof').setLabel("رابط الدليل (فيديو/صورة)").setPlaceholder("https://...").setStyle(TextInputStyle.Short).setRequired(true))
            );
            return int.showModal(modal);
        }

        if (int.customId === 'btn_staff') {
            const modal = new ModalBuilder().setCustomId('mod_staff').setTitle('شكوى إدارية رسمية');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_name').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_target').setLabel("اسم الإداري المعني").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s_details').setLabel("تفاصيل الشكوى والموقف").setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
            return int.showModal(modal);
        }

        if (int.customId === 'btn_tech') {
            const modal = new ModalBuilder().setCustomId('mod_tech').setTitle('طلب دعم فني / تعويض');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t_name').setLabel("الاسم والآيدي الخاص بك").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t_issue').setLabel("شرح المشكلة أو العناصر المفقودة").setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
            return int.showModal(modal);
        }
    }

    // 3. معالجة إرسال البيانات وفتح التذكرة
    if (int.isModalSubmit()) {
        await int.deferReply({ ephemeral: true });
        
        let setup = { label: "تذكرة", color: "#FF0000", roles: CONFIG.STAFF_ROLES, fields: [] };

        if (int.customId === 'mod_player') {
            setup = { label: "ضد-لاعب", color: "#00FF00", roles: CONFIG.STAFF_ROLES, 
                fields: [
                    { name: '👤 صاحب البلاغ:', value: int.fields.getTextInputValue('i_name'), inline: true },
                    { name: '🆔 المُبلغ عنه:', value: int.fields.getTextInputValue('i_target'), inline: true },
                    { name: '📝 التفاصيل:', value: `\`\`\`${int.fields.getTextInputValue('i_reason')}\`\`\`` },
                    { name: '🎬 الدليل:', value: int.fields.getTextInputValue('i_proof') }
                ] 
            };
        } else if (int.customId === 'mod_staff') {
            setup = { label: "ضد-اداري", color: "#FF0000", roles: CONFIG.STAFF_ROLES, 
                fields: [
                    { name: '👤 صاحب الشكوى:', value: int.fields.getTextInputValue('s_name'), inline: true },
                    { name: '👮 الإداري المعني:', value: int.fields.getTextInputValue('s_target'), inline: true },
                    { name: '📝 ما حدث:', value: `\`\`\`${int.fields.getTextInputValue('s_details')}\`\`\`` }
                ]
            };
        } else {
            setup = { label: "دعم-فني", color: "#000000", roles: [CONFIG.TECH_ROLE], 
                fields: [
                    { name: '👤 صاحب الطلب:', value: int.fields.getTextInputValue('t_name'), inline: true },
                    { name: '🛠️ المشكلة:', value: `\`\`\`${int.fields.getTextInputValue('t_issue')}\`\`\`` }
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

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`🎫 تـذكـرة جـديـدة | قـسم ${setup.label.toUpperCase()}`)
                .setColor(setup.color)
                .addFields(setup.fields)
                .setTimestamp()
                .setFooter({ text: 'One City RP Support System' });

            const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وأرشفة').setStyle(ButtonStyle.Danger));

            await channel.send({ content: `${int.user} | <@&${setup.roles[0]}>`, embeds: [ticketEmbed], components: [closeBtn] });
            return int.editReply(`✅ تم فتح تذكرتك بنجاح: ${channel}`);
        } catch (e) {
            console.error(e);
            return int.editReply(`❌ فشل الإنشاء. تأكد من أن البوت مسؤول وأن رتبته فوق الكاتجوري.\nالخطأ: ${e.message}`);
        }
    }

    // 4. نظام الإغلاق والأرشيف
    if (int.isButton() && int.customId === 'close_ticket') {
        await int.reply("🔒 جاري حفظ نسخة من المحادثة وإغلاق القناة...");
        const msgs = await int.channel.messages.fetch({ limit: 100 });
        let log = `Archive for Ticket: ${int.channel.name}\nGenerated at: ${new Date().toLocaleString()}\n\n`;
        msgs.reverse().forEach(m => { log += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`; });

        const logChan = client.channels.cache.get(CONFIG.LOGS_ID);
        if (logChan) {
            await logChan.send({ 
                content: `📁 **أرشيف تذكرة مغلقة: \`${int.channel.name}\`**\nبواسطة: ${int.user}`,
                files: [{ attachment: Buffer.from(log), name: `log-${int.channel.name}.txt` }] 
            });
        }
        setTimeout(() => int.channel.delete().catch(() => {}), 4000);
    }
});

client.login(CONFIG.TOKEN);
