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

// --- إعدادات الأيدي (IDs) ---
const CONFIG = {
    GUILD_ID: "1381360453485334658",
    OWNER_ID: "1517002644676411592",
    CATEGORY_TICKETS: "1517931717061771294",
    LOG_CHANNEL: "1517942325383270502",
    // الفئات ضد (لاعب/إداري) - الأشخاص المسموح لهم بالرؤية
    STAFF_REPORT_ROLES: [
        "1517002645666267197",
        "1517931426069348446",
        "1517931427600007258",
        "1517931425372962947"
    ],
    // الدعم الفني
    TECH_SUPPORT_ROLE: "1517931445149241356"
};

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// أمر إنشاء لوحة التذاكر (اكتب !setup في الشات)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.author.id === CONFIG.OWNER_ID) {
        const embed = new EmbedBuilder()
            .setTitle("✨ One City RP | نظام الدعم الفني والشكاوي ✨")
            .setDescription(`
                \n**مرحباً بكم في One City RP**\n
                عالمٌ حيثُ تُصنع الأساطير وتُبنى الأمجاد.. نحن هنا لنضمن لك تجربة واقعية لا تُنسى.\n
                يرجى اختيار القسم المناسب لطلبك من الأسفل:\n
                🟢 **بلاغ ضد لاعب** : للتبليغ عن مخالفات القوانين.
                🔴 **بلاغ ضد إداري** : للتبليغ عن سوء استخدام السلطة.
                ⚫ **الدعم الفني** : للمشاكل التقنية والاستفسارات العامة.
            `)
            .setColor("#FF0000") // الأحمر اللامع للوصف
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: "One City RP - Management", iconURL: message.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [buttons] });
    }
});

// التعامل مع الضغط على الأزرار وفتح المودال
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_${interaction.customId}`)
            .setTitle('تقديم معلومات الطلب');

        const nameInput = new TextInputBuilder()
            .setCustomId('user_info')
            .setLabel("الاسم والآيدي الخاص بك")
            .setPlaceholder("مثال: احمد | 1234")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel("تفاصيل المشكلة / البلاغ")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    }

    // معالجة بيانات المودال وفتح التذكرة
    if (interaction.isModalSubmit()) {
        const userInfo = interaction.fields.getTextInputValue('user_info');
        const reason = interaction.fields.getTextInputValue('reason');
        let type = interaction.customId.split('_')[1]; // player, staff, or tech

        let channelName = "";
        let embedColor = "";
        let allowRoles = [CONFIG.OWNER_ID];

        if (type === 'player') {
            channelName = `player-${interaction.user.username}`;
            embedColor = "#00FF00"; // أخضر لامع
            allowRoles.push(...CONFIG.STAFF_REPORT_ROLES);
        } else if (type === 'staff') {
            channelName = `staff-${interaction.user.username}`;
            embedColor = "#FF0000"; // أحمر لامع
            allowRoles.push(...CONFIG.STAFF_REPORT_ROLES);
        } else {
            channelName = `tech-${interaction.user.username}`;
            embedColor = "#1A1A1A"; // أسود/رمادي غامق
            allowRoles.push(CONFIG.TECH_SUPPORT_ROLE);
        }

        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CONFIG.CATEGORY_TICKETS,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...allowRoles.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ]
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`تذكرة جديدة: ${type === 'player' ? 'بلاغ ضد لاعب' : type === 'staff' ? 'بلاغ ضد إداري' : 'دعم فني'}`)
            .setColor(embedColor)
            .addFields(
                { name: "👤 صاحب الطلب:", value: `${interaction.user} (${userInfo})`, inline: true },
                { name: "📝 التفاصيل:", value: reason }
            )
            .setTimestamp();

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user} تم فتح التذكرة بنجاح.`, embeds: [welcomeEmbed], components: [closeBtn] });
        await interaction.reply({ content: `تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // نظام الإغلاق واللوجز (نسخة نصية)
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        const channel = interaction.channel;
        await interaction.reply("جاري إغلاق التذكرة وحفظ الأرشيف...");

        let messages = await channel.messages.fetch({ limit: 100 });
        let logContent = `Log for ticket: ${channel.name}\nGenerated at: ${new Date().toLocaleString()}\n\n`;
        
        messages.reverse().forEach(msg => {
            logContent += `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
        });

        const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({
                content: `📄 **أرشيف التذكرة: ${channel.name}**`,
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`تم إغلاق التذكرة بواسطة: ${interaction.user.tag}`)
                        .setColor("#FF0000")
                ]
            });
            // إرسال اللوج كرسالة نصية طويلة (أو تقسيمها إذا كانت ضخمة)
            await logChannel.send({ content: `\`\`\`text\n${logContent.substring(0, 1900)}\n\`\`\`` });
        }

        setTimeout(() => channel.delete(), 5000);
    }
});

client.login
