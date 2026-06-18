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

// --- الإعدادات بالأرقام التي قدمتها ---
const CONFIG = {
    TOKEN: process.env.TOKEN, // لا تغير هذا! ضعه في ريلوي في الـ Variables
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    SUPPORT_ADMIN_ONLY: "1517120729559203931",
    CLAIM_LOG: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629",
    PANEL_IMAGE: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // تأكد من رفع الصورة بهذا الاسم
};

client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح: ${client.user.tag}`);
    console.log(`🚀 جاهز لخدمة جابر باشا!`);
});

// أمر التسطيب (اكتب !setup في الشات)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const mainEmbed = new EmbedBuilder()
            .setTitle("🌹 نظام تذاكر فخامة جابر باشا")
            .setDescription(`
            **مرحباً بك في أرقى خدمات السيرفر**
            
            يرجى اختيار القسم المناسب لبدء المعاملة:
            
            🔴 **قسم طلب البنرات**: تصاميم احترافية بأعلى جودة.
            ⚫ **قسم طلب الاستيكرات**: استيكرات خاصة وفريدة.
            🔵 **قسم الدعم الفني**: للاستفسارات والمشاكل التقنية.
            
            ⚠️ **تنبيه:** يمنع فتح تذكرة بدون سبب واضح.
            `)
            .setColor("#FF0000") // أحمر لامع
            .setImage(CONFIG.PANEL_IMAGE)
            .setFooter({ text: "Jaber Pasha Management", iconURL: message.guild.iconURL() });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('main_select')
                .setPlaceholder('إضغط هنا لاختيار الفئة...')
                .addOptions([
                    { label: 'طلب بنرات', value: 'banners', emoji: '🔴', description: 'للحصول على بنر أحمر لامع' },
                    { label: 'طلب استيكر', value: 'stickers', emoji: '⚫', description: 'للحصول على استيكر أسود لامع' },
                    { label: 'الدعم الفني', value: 'support', emoji: '🔵', description: 'التواصل مع الإدارة مباشرة' },
                ])
        );

        await message.channel.send({ embeds: [mainEmbed], components: [menu] });
        message.delete();
    }
});

client.on('interactionCreate', async (interaction) => {
    // 1. نظام المودال (البيانات الإلزامية)
    if (interaction.isStringSelectMenu() && interaction.customId === 'main_select') {
        const type = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${type}`).setTitle('إكمال البيانات الإلزامية');
        
        const infoInput = new TextInputBuilder()
            .setCustomId('user_data')
            .setLabel("اكتب معلوماتك وسبب الطلب")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(10)
            .setRequired(true)
            .setPlaceholder("مثال: اسمي كذا وطلبي هو كذا...");

        modal.addComponents(new ActionRowBuilder().addComponents(infoInput));
        await interaction.showModal(modal);
    }

    // 2. إنشاء التذكرة بعد كتابة البيانات
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const userData = interaction.fields.getTextInputValue('user_data');
        
        let color, categoryName, supportID;
        if (type === 'banners') { color = "#FF0000"; categoryName = "banner"; supportID = CONFIG.ADMIN_ROLES; }
        else if (type === 'stickers') { color = "#1a1a1a"; categoryName = "sticker"; supportID = CONFIG.ADMIN_ROLES; }
        else { color = "#0080FF"; categoryName = "support"; supportID = [CONFIG.SUPPORT_ADMIN_ONLY]; }

        const channel = await interaction.guild.channels.create({
            name: `${categoryName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...supportID.map(role => ({ id: role, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`تذكرة جديدة: ${categoryName.toUpperCase()}`)
            .setColor(color)
            .addFields(
                { name: "👤 صاحب التذكرة", value: `${interaction.user.tag}`, inline: true },
                { name: "📄 البيانات المقدمة", value: `\`\`\`${userData}\`\`\`` }
            )
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${supportID[0]}>`, embeds: [ticketEmbed], components: [row] });
        await interaction.followUp({ content: `تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // 3. زر الاستلام (Claim)
    if (interaction.isButton() && interaction.customId === 'claim') {
        const hasRole = CONFIG.ADMIN_ROLES.some(role => interaction.member.roles.cache.has(role));
        if (!hasRole) return interaction.reply({ content: "هذا الزر للمسؤولين فقط!", ephemeral: true });

        await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true });
        
        const claimEmbed = new EmbedBuilder()
            .setDescription(`✅ تم استلام التذكرة بواسطة ${interaction.user}`)
            .setColor("#00FF00");

        await interaction.reply({ embeds: [claimEmbed] });

        // لوج استلام التذكرة
        const claimLog = client.channels.cache.get(CONFIG.CLAIM_LOG);
        if (claimLog) {
            const logEmbed = new EmbedBuilder()
                .setTitle("📝 استلام تذكرة")
                .addFields(
                    { name: "الإداري", value: `${interaction.user.tag}`, inline: true },
                    { name: "التذكرة", value: `${interaction.channel.name}`, inline: true }
                )
                .setColor("#00FF00").setTimestamp();
            claimLog.send({ embeds: [logEmbed] });
        }
    }

    // 4. نظام الإغلاق والتقييم
    if (interaction.isButton() && interaction.customId === 'close') {
        const rateMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rate_action')
                .setPlaceholder('قيم مستوى الخدمة قبل الإغلاق...')
                .addOptions([
                    { label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' },
                    { label: 'جيد جداً ⭐⭐⭐⭐', value: '4' },
                    { label: 'متوسط ⭐⭐⭐', value: '3' },
                    { label: 'سيء ⭐', value: '1' },
                ])
        );
        await interaction.reply({ content: "يرجى تقييمنا لإغلاق التذكرة:", components: [rateMenu] });
    }

    // 5. التقييم النهائي واللوجز
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_action') {
        const rating = interaction.values[0];
        await interaction.update({ content: "جاري حفظ النسخة وإغلاق القناة...", components: [] });

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).reverse().join('\n');

        const finalEmbed = new EmbedBuilder()
            .setTitle("📁 أرشفة تذكرة - جابر باشا")
            .setColor("#FF0000")
            .addFields(
                { name: "اسم التذكرة", value: interaction.channel.name, inline: true },
                { name: "التقييم", value: `${rating}/5 ⭐`, inline: true },
                { name: "أغلق بواسطة", value: interaction.user.tag, inline: true }
            ).setTimestamp();

        const transChan = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
        const logsChan = client.channels.cache.get(CONFIG.LOGS_CHANNEL);

        if (transChan) await transChan.send({ embeds: [finalEmbed] });
        if (logsChan) await logsChan.send({ content: `نسخة المحادثة لـ ${interaction.channel.name}:\n\`\`\`${transcript.slice(0, 1900)}\`\`\`` });

        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

client.login(CONFIG.TOKEN);
