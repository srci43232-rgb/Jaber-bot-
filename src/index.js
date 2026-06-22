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
    ChannelType,
    REST,
    Routes
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- الإعدادات المحدثة ---
const CONFIG = {
    TOKEN: process.env.TOKEN || "ضـع_تـوكـن_هـنـا",
    CLIENT_ID: "1381360453485334658", 
    GUILD_ID: "1381360453485334658",
    
    // القائمة المسموح لها باستخدام أمر /setup
    AUTHORIZED_USERS: [
        "1517002644676411592", // الآيدي الخاص بك (المالك)
        // يمكنك إضافة آيديات أخرى هنا بنفس التنسيق
    ],

    CATEGORY_TICKETS: "1517931717061771294",
    LOG_CHANNEL: "1517942325383270502",
    
    // الرتب التي ترى بلاغات (لاعب/إداري)
    STAFF_ROLES: [
        "1517002645666267197",
        "1517931426069348446",
        "1517931427600007258",
        "1517931425372962947"
    ],
    
    // رتبة الدعم الفني
    TECH_ROLE: "1517931445149241356"
};

const commands = [{
    name: 'setup',
    description: 'إنشاء لوحة التذاكر الاحترافية'
}];

const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

client.once('ready', async () => {
    console.log(`✅ البوت متصل: ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, CONFIG.GUILD_ID), { body: commands });
        console.log('✅ تم تحديث أوامر Slash');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    // التحقق من أمر /setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!CONFIG.AUTHORIZED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: `❌ نعتذر ${interaction.user}، هذا الأمر مخصص للإدارة العليا فقط.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("🌆 One City RP | نـظـام الـبـلاغـات والـدعم")
            .setDescription(`
                \n**أهلاً بـك فـي مـديـنـة One City**\n
                نـحن نـقـدر تـواجـدك مـعـنا، ونـسـعى لـتوفـير أفـضل تـجـربـة لـعـب.
                إذا كـنـت تـواجـه مـشـكـلـة أو تـود تـقـديـم بـلاغ، اخـتـر الـقـسـم الـمـنـاسـب:\n
                🟢 **بـلاغ ضـد لاعـب** : لـتـقـديـم بـلاغ عـن مـخـالـف لـلـقـوانـيـن.
                🔴 **بـلاغ ضـد إداري** : لـلـتـوجـه لـلإدارة الـعـلـيا بـشأن طـاقـم الـعـمـل.
                ⚫ **الـدعم الـفـنـي** : لـلـمـسـاعـدة الـتـقـنـية أو الاسـتـفـسـارات الـعـامـة.
                \n*يـرجـى الـتـأكـد مـن إدخـال بـيـانـاتـك الـصـحـيـحـة عـنـد الـضـغـط عـلـى الـزر.*
            `)
            .setColor("#FF0000") // أحمر لامع فخم
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: "One City RP - Quality Service", iconURL: interaction.guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('p_ticket').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('s_ticket').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('t_ticket').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({ embeds: [embed], components: [row] });
    }

    // التعامل مع الأزرار والمودال
    if (interaction.isButton() && interaction.customId.endsWith('_ticket')) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_${interaction.customId}`)
            .setTitle('تـعـبـئـة بـيـانـات الـتـذكـرة');

        const input1 = new TextInputBuilder()
            .setCustomId('user_data')
            .setLabel("الاسم والآيدي الخاص بك")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const input2 = new TextInputBuilder()
            .setCustomId('reason_data')
            .setLabel("تـفـاصـيـل الـطـلـب / الـبـلاغ")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
        return interaction.showModal(modal);
    }

    // فتح التذكرة بعد إرسال المودال
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const userData = interaction.fields.getTextInputValue('user_data');
        const reasonData = interaction.fields.getTextInputValue('reason_data');
        const type = interaction.customId;

        let info = { name: "ticket", color: "#FFFFFF", roles: [CONFIG.AUTHORIZED_USERS[0]] };
        
        if (type.includes('p_ticket')) {
            info = { name: "player", color: "#00FF00", roles: [...CONFIG.STAFF_ROLES] };
        } else if (type.includes('s_ticket')) {
            info = { name: "staff", color: "#FF0000", roles: [...CONFIG.STAFF_ROLES] };
        } else {
            info = { name: "tech", color: "#1A1A1A", roles: [CONFIG.TECH_ROLE] };
        }

        const channel = await interaction.guild.channels.create({
            name: `${info.name}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.CATEGORY_TICKETS,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...info.roles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                ...CONFIG.AUTHORIZED_USERS.map(u => ({ id: u, allow: [PermissionsBitField.Flags.ViewChannel] }))
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة | ${info.name.toUpperCase()}`)
            .setColor(info.color)
            .addFields(
                { name: "👤 العضو:", value: `${interaction.user} (${userData})`, inline: true },
                { name: "📝 السبب:", value: reasonData }
            )
            .setTimestamp();

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وحفظ').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `@here`, embeds: [ticketEmbed], components: [closeBtn] });
        return interaction.editReply(`✅ تم فتح تذكرتك بنجاح: ${channel}`);
    }

    // نظام الإغلاق واللوج النصي
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        const channel = interaction.channel;
        await interaction.reply("🔒 جاري حفظ المحادثة وإغلاق التذكرة...");

        const messages = await channel.messages.fetch({ limit: 100 });
        let logText = `--- ARCHIVE: ${channel.name} ---\n`;
        messages.reverse().forEach(m => {
            logText += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({ content: `📁 **تم إغلاق تذكرة: ${channel.name}**\nبواسطة: ${interaction.user}` });
            await logChannel.send({ content: `\`\`\`text\n${logText.substring(0, 1900)}\n\`\`\`` });
        }

        setTimeout(() => channel.delete(), 5000);
    }
});

client.login(CONFIG.TOKEN);
