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

// --- الإعدادات النهائية بأيدياتك الصحيحة ---
const CONFIG = {
    TOKEN: process.env.TOKEN || "ضع_توكن_البوت_هنا",
    CLIENT_ID: "1381360453485334658", 
    GUILD_ID: "1381360453485334658",
    
    // الأيديات المسموح لها باستخدام أمر الـ Setup
    AUTHORIZED_USERS: [
        "1349214233262297149", // الآيدي الجديد الخاص بك
        "1517002644676411592"  
    ],

    CATEGORY_TICKETS: "1517931717061771294",
    LOG_CHANNEL: "1517942325383270502",
    
    // من يرى بلاغات اللاعبين والإداريين
    STAFF_ROLES: [
        "1517002645666267197",
        "1517931426069348446",
        "1517931427600007258",
        "1517931425372962947"
    ],
    
    // من يرى الدعم الفني
    TECH_ROLE: "1517931445149241356"
};

const commands = [{
    name: 'setup',
    description: 'تجهيز لوحة تذاكر مدينة One City RP'
}];

const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

client.once('ready', async () => {
    console.log(`✅ تم التشغيل بنجاح | المالك الحالي: Mad Max`);
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, CONFIG.GUILD_ID), { body: commands });
        console.log('✅ تم تسجيل أوامر الـ Slash بنجاح');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر السيت اب (Setup)
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!CONFIG.AUTHORIZED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ عذراً، هذا الأمر مخصص للإدارة العليا فقط.", ephemeral: true });
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle("🌆 **ONE CITY ROLEPLAY | الـدعم الـفـنـي**")
            .setDescription(`
                \n**أهـلاً بـك فـي مـديـنـة One City.. حـيـث لـلـواقـعـيـة مـعـنى آخـر**\n
                نـحـن هـنـا لـنـسـمـعـك، نـسـاعـدك، ونـضـمـن لـك بـيـئـة لـعـب عـادلة ومـحـتـرفـة.
                اخـتـر الـقـسم الـمـنـاسب لـحـالـتـك وسـيـتـم الـرد عـلـيـك مـن قـبـل الـمـخـتـصـيـن:\n
                🟢 **بـلاغ ضـد لاعـب**
                *لـتـقـديـم شكوى بـخـصوص مـخـالـفات الـقوانين داخـل الـمدينة.*

                🔴 **بـلاغ ضـد إداري**
                *لـلـتواصل مع الإدارة الـعـلـيا بـشأن أي مـلاحظات عـلى طـاقم الـعمل.*

                ⚫ **الـدعم الـفـنـي**
                *لـلـمساعدة في الـمشاكل الـتـقنية، الـبـوقات، أو الاسـتـفسارات.*
                \n─── ⋆⋅☆⋅⋆ ───
                **تـنـبـيـه:** بـعـد الضـغـط عـلـى الـزر، سـيـطـلـب مـنـك الـبوت إدخـال بـيـانـاتـك.
            `)
            .setColor("#FF0000") // أحمر لامع فخم
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: "One City RP Management", iconURL: interaction.guild.iconURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('op_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('op_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('op_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({ embeds: [mainEmbed], components: [buttons] });
    }

    // 2. إظهار المودال (الاستمارة)
    if (interaction.isButton() && interaction.customId.startsWith('op_')) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_${interaction.customId}`)
            .setTitle('نـمـوذج فـتـح تـذكـرة');

        const nameInput = new TextInputBuilder()
            .setCustomId('field_1')
            .setLabel("الاسم والآيدي الخاص بك")
            .setPlaceholder("مثال: احمد | 1349")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('field_2')
            .setLabel("شرح المشكلة أو البلاغ")
            .setPlaceholder("اكتب تفاصيل ما حدث هنا...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(reasonInput));
        return interaction.showModal(modal);
    }

    // 3. معالجة المودال وفتح القناة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });

        const uName = interaction.fields.getTextInputValue('field_1');
        const uReason = interaction.fields.getTextInputValue('field_2');
        const type = interaction.customId;

        let settings = { name: "تذكرة", color: "#FFFFFF", roles: [] };

        if (type.includes('player')) {
            settings = { name: "ضد-لاعب", color: "#00FF00", roles: CONFIG.STAFF_ROLES };
        } else if (type.includes('staff')) {
            settings = { name: "ضد-اداري", color: "#FF0000", roles: CONFIG.STAFF_ROLES };
        } else {
            settings = { name: "دعم-فني", color: "#000000", roles: [CONFIG.TECH_ROLE] };
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: `${settings.name}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.CATEGORY_TICKETS,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...settings.roles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
                ...CONFIG.AUTHORIZED_USERS.map(u => ({ id: u, allow: [PermissionsBitField.Flags.ViewChannel] }))
            ]
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة | ${settings.name}`)
            .setColor(settings.color)
            .addFields(
                { name: "👤 العضو:", value: `${interaction.user} (${uName})`, inline: true },
                { name: "📝 الموضوع:", value: uReason }
            )
            .setTimestamp()
            .setFooter({ text: "One City RP Ticket System" });

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket_now').setLabel('إغلاق وحفظ المحادثة').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `@here`, embeds: [welcomeEmbed], components: [closeBtn] });
        return interaction.editReply(`✅ تم إنشاء تذكرتك بنجاح: ${ticketChannel}`);
    }

    // 4. نظام الإغلاق والأرشفة النصية
    if (interaction.isButton() && interaction.customId === 'close_ticket_now') {
        const channel = interaction.channel;
        await interaction.reply("🔒 جاري حفظ نسخة من المحادثة وإغلاق القناة...");

        const messages = await channel.messages.fetch({ limit: 100 });
        let logStream = `--- LOG ARCHIVE FOR: ${channel.name} ---\n\n`;
        
        messages.reverse().forEach(m => {
            logStream += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({ content: `📁 **أرشيف تذكرة مغلقة**\nالقناة: \`${channel.name}\`\nالمسؤول: ${interaction.user}` });
            // إرسال النص (بحد أقصى 2000 حرف للرسالة الواحدة)
            await logChannel.send({ content: `\`\`\`text\n${logStream.substring(0, 1900)}\n\`\`\`` });
        }

        setTimeout(() => channel.delete().catch(() => {}), 5000);
    }
});

client.login(CONFIG.TOKEN);
