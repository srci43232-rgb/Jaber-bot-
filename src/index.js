const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    PermissionsBitField,
    ChannelType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- الإعدادات (تأكد من صحة الأيديات) ---
const CONFIG = {
    GUILD_ID: "1381360453485334658",
    OWNER_ID: "1517002644676411592",
    CATEGORY_TICKETS: "1517931717061771294",
    LOG_CHANNEL: "1517942325383270502",
    STAFF_REPORT_ROLES: [
        "1517002645666267197",
        "1517931426069348446",
        "1517931427600007258",
        "1517931425372962947"
    ],
    TECH_SUPPORT_ROLE: "1517931445149241356"
};

client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

// أمر إنشاء لوحة التذاكر
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.author.id === CONFIG.OWNER_ID) {
        const embed = new EmbedBuilder()
            .setTitle("🌆 One City RP | نظام التذاكر الموحد")
            .setDescription(`
                \n**مرحباً بك في مدينة One City**\n
                نحن هنا لخدمتكم وضمان أفضل تجربة لعب واقعي. يرجى اختيار القسم الذي تريده وسيقوم طاقم العمل بالرد عليك في أقرب وقت.\n
                🟢 **قسم البلاغات ضد اللاعبين**
                🔴 **قسم الشكاوي ضد الإدارة**
                ⚫ **قسم الدعم الفني العام**
                \n*يرجى تعبئة البيانات بدقة بعد الضغط على الزر.*
            `)
            .setColor("#FF0000") // الأحمر اللامع
            .setImage('https://i.imgur.com/your-image.png') // يمكنك وضع رابط صورة لوحة السيرفر هنا
            .setFooter({ text: "One City RP - Management System", iconURL: message.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [buttons] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'close_ticket') return handleClose(interaction);

        // مودال تعبئة البيانات
        const modal = new ModalBuilder()
            .setCustomId(`modal_${interaction.customId}`)
            .setTitle('استمارة فتح تذكرة');

        const input1 = new TextInputBuilder()
            .setCustomId('info_user')
            .setLabel("الاسم الرباعي والآيدي")
            .setPlaceholder("مثال: خالد محمد | 151700")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const input2 = new TextInputBuilder()
            .setCustomId('info_reason')
            .setLabel("شرح مفصل للطلب/البلاغ")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        const userInfo = interaction.fields.getTextInputValue('info_user');
        const reason = interaction.fields.getTextInputValue('info_reason');
        const type = interaction.customId.replace('modal_ticket_', '');

        await interaction.deferReply({ ephemeral: true });

        let color, roleToMention, title;
        if (type === 'player') {
            color = "#00FF00"; title = "بلاغ ضد لاعب"; roleToMention = CONFIG.STAFF_REPORT_ROLES[0];
        } else if (type === 'staff') {
            color = "#FF0000"; title = "بلاغ ضد إداري"; roleToMention = CONFIG.STAFF_REPORT_ROLES[0];
        } else {
            color = "#000000"; title = "دعم فني"; roleToMention = CONFIG.TECH_SUPPORT_ROLE;
        }

        const channel = await interaction.guild.channels.create({
            name: `${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.CATEGORY_TICKETS,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                { id: CONFIG.OWNER_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
                // إضافة صلاحية الرؤية للإداريين أو الدعم
                ...(type === 'tech' ? [{ id: CONFIG.TECH_SUPPORT_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }] : CONFIG.STAFF_REPORT_ROLES.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel] })))
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة: ${title}`)
            .setColor(color)
            .addFields(
                { name: "👤 العضو:", value: `${interaction.user} \n(${userInfo})`, inline: true },
                { name: "📝 الموضوع:", value: reason }
            )
            .setTimestamp();

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `<@&${roleToMention}> تذكرة جديدة من ${interaction.user}`, embeds: [ticketEmbed], components: [closeRow] });
        await interaction.editReply({ content: `تم فتح تذكرتك بنجاح: ${channel}` });
    }
});

async function handleClose(interaction) {
    const channel = interaction.channel;
    await interaction.reply("⏳ جاري أرشفة التذكرة وحذفها خلال 5 ثوانٍ...");

    const messages = await channel.messages.fetch({ limit: 100 });
    let logMsg = `--- أرشيف تذكرة: ${channel.name} ---\n\n`;
    messages.reverse().forEach(m => {
        logMsg += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
    });

    const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
    if (logChannel) {
        await logChannel.send({
            content: `🔒 **تذكرة مغلقة**\nالاسم: \`${channel.name}\`\nبواسطة: ${interaction.user}`,
        });
        // إرسال السجل كرسالة
        await logChannel.send({ content: `\`\`\`text\n${logMsg.substring(0, 1900)}\n\`\`\`` });
    }

    setTimeout(() => channel.delete().catch(() => {}), 5000);
}

// استخدام التوكن من Variables في Railway
client.login(process.env.TOKEN || "ضـع_تـوكـن_هـنـا_للتـجـربـة_فـقـط");
