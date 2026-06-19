const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    StringSelectMenuBuilder, 
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
        GatewayIntentBits.GuildMembers,
    ]
});

// إعدادات البيانات والايديهات
const SETTINGS = {
    TOKEN: "ضع_توكن_البوت_هنا",
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    STAFF_ROLES: ["1517120729559203931", "1516441626384269343"],
    TECH_SUPPORT_STAFF: "1517120729559203931", // المسؤولين عن الدعم الفني
    CLAIM_LOGS: "1516441752716709970",
    GENERAL_LOGS: "1516499096796664030",
    TRANSCRIPT_LOGS: "1516508105704214629",
    PANEL_IMAGE: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // تأكد من صحة الرابط
};

client.once('ready', () => {
    console.log(`✅ البوت جاهز! سجل دخول باسم: ${client.user.tag}`);
});

// أمر إنشاء البنل (اكتب !setup في الشات)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const panelEmbed = new EmbedBuilder()
            .setTitle("⚜️ مـركـز خـدمـات جـابـر بـاشـا ⚜️")
            .setDescription(`
            **أهلاً بك في أرقى أنظمة الدعم الفني**
            
            نحن هنا لنقدم لك تجربة فريدة واحترافية. يرجى اختيار القسم المناسب لطلبك من القائمة أدناه:
            
            🔴 **قـسـم طـلـب الـبـنـرات**: للحصول على تصاميم احترافية.
            ⚫ **قـسـم طـلـب الاسـتـيـكـرات**: لطلبات الاستيكرات الخاصة.
            🔵 **قـسـم الـدعـم الـفـنـي**: للتواصل المباشر مع الإدارة.
            
            *ملاحظة: سيُطلب منك إدخال بياناتك قبل فتح التذكرة.*
            `)
            .setColor("#FF0000") // أحمر لامع
            .setImage(SETTINGS.PANEL_IMAGE)
            .setFooter({ text: "Var Vat~ Management System", iconURL: message.guild.iconURL() });

        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('إختر القسم الذي تحتاجه...')
                .addOptions([
                    { label: 'طلب بنرات', value: 'banners', emoji: '🔴', description: 'فتح تذكرة بقسم البنرات' },
                    { label: 'طلب استيكر', value: 'stickers', emoji: '⚫', description: 'فتح تذكرة بقسم الاستيكرات' },
                    { label: 'الدعم الفني', value: 'tech_support', emoji: '🔵', description: 'فتح تذكرة بقسم الدعم الفني' },
                ])
        );

        await message.channel.send({ embeds: [panelEmbed], components: [selectMenu] });
        message.delete();
    }
});

// التعامل مع التفاعلات
client.on('interactionCreate', async (interaction) => {
    
    // 1. فتح المودال (الاستمارة الإلزامية)
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
        const category = interaction.values[0];
        const modal = new ModalBuilder()
            .setCustomId(`modal_${category}`)
            .setTitle('إستمارة تأكيد البيانات');

        const inputInfo = new TextInputBuilder()
            .setCustomId('user_info')
            .setLabel("الاسم وسبب فتح التذكرة")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("مثال: الاسم / نوع الطلب بالتفصيل...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(inputInfo));
        await interaction.showModal(modal);
    }

    // 2. معالجة إرسال المودال وفتح التذكرة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const category = interaction.customId.split('_')[1];
        const info = interaction.fields.getTextInputValue('user_info');
        
        let color, label, staffRole;
        if (category === 'banners') { color = "#FF0000"; label = "بنر"; staffRole = SETTINGS.STAFF_ROLES; }
        else if (category === 'stickers') { color = "#1a1a1a"; label = "استيكر"; staffRole = SETTINGS.STAFF_ROLES; }
        else { color = "#0080FF"; label = "دعم-فني"; staffRole = [SETTINGS.TECH_SUPPORT_STAFF]; }

        const ticketChannel = await interaction.guild.channels.create({
            name: `${label}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...staffRole.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`⚜️ تذكرة جديدة | قسم الـ${label}`)
            .setDescription(`مرحباً بك ${interaction.user} في مركز خدماتنا.`)
            .addFields(
                { name: "👤 صاحب التذكرة", value: `${interaction.user}`, inline: true },
                { name: "📝 البيانات المقدمة", value: `\`\`\`${info}\`\`\`` }
            )
            .setColor(color)
            .setTimestamp();

        const actionButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وتدوين').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ content: `<@&${staffRole[0]}> | ${interaction.user}`, embeds: [welcomeEmbed], components: [actionButtons] });
        await interaction.followUp({ content: `تم فتح تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
    }

    // 3. زر الاستلام (للاداريين فقط)
    if (interaction.isButton() && interaction.customId === 'claim_ticket') {
        if (!SETTINGS.STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) {
            return interaction.reply({ content: "عذراً، هذا الزر للمسؤولين فقط.", ephemeral: true });
        }

        const claimEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(`✅ تم استلام التذكرة بواسطة: ${interaction.user}`);
        
        await interaction.reply({ embeds: [claimEmbed] });
        
        const claimLog = client.channels.cache.get(SETTINGS.CLAIM_LOGS);
        if (claimLog) claimLog.send({ content: `🎫 الاداري **${interaction.user.tag}** استلم تذكرة العضو **${interaction.channel.name}**` });
    }

    // 4. زر الإغلاق والتقييم (للاداريين فقط)
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        if (!SETTINGS.STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) {
            return interaction.reply({ content: "عذراً، الإغلاق متاح للمسؤولين فقط.", ephemeral: true });
        }

        const ratingRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rating_menu')
                .setPlaceholder('قيم مستوى الخدمة لإتمام الإغلاق...')
                .addOptions([
                    { label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' },
                    { label: 'جيد جداً ⭐⭐⭐⭐', value: '4' },
                    { label: 'متوسط ⭐⭐⭐', value: '3' },
                    { label: 'سيء ⭐', value: '1' },
                ])
        );
        await interaction.reply({ content: "يرجى تقييم الأداء للأرشفة:", components: [ratingRow] });
    }

    // 5. التقييم النهائي وحفظ اللوجز (عمودياً)
    if (interaction.isStringSelectMenu() && interaction.customId === 'rating_menu') {
        const rating = interaction.values[0];
        await interaction.reply("⏳ جاري حفظ النسخة وإغلاق التذكرة...");

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptText = messages.filter(m => !m.author.bot).map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).reverse().join('\n');

        const logEmbed = new EmbedBuilder()
            .setTitle("📂 أرشيف تذكرة مغلقة")
            .addFields(
                { name: "👤 صاحب التذكرة", value: interaction.channel.name, inline: true },
                { name: "⭐ التقييم", value: `${rating} نجوم`, inline: true },
                { name: "🔒 أغلق بواسطة", value: interaction.user.tag, inline: true }
            )
            .setColor("#FF0000")
            .setTimestamp();

        const transChan = client.channels.cache.get(SETTINGS.TRANSCRIPT_LOGS);
        const generalLogs = client.channels.cache.get(SETTINGS.GENERAL_LOGS);

        if (transChan) await transChan.send({ embeds: [logEmbed] });
        if (generalLogs) await generalLogs.send({ content: `📜 **سجل محادثة التذكرة:**\n\`\`\`text\n${transcriptText.slice(0, 1900)}\n\`\`\`` });

        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(SETTINGS.TOKEN);
