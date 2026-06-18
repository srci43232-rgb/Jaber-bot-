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

// --- إعدادات البوت (الايديهات التي قدمتها) ---
const CONFIG = {
    TOKEN: "TOKEN_HERE", // ضع توكن بوتك هنا
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    ADMIN_ROLE: "1517120729559203931",
    SUPPORT_ROLE: "1516441626384269343", // الرتبة الاضافية
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629",
    CLAIM_LOG_CHANNEL: "1516441752716709970",
    IMAGE_URL: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // تأكد من صحة الرابط أو سيظهر افتراضي
};

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} جاهز للعمل! نم مستريحاً يا بطل.`);
});

// أمر إنشاء بنل التذاكر (اكتب !setup في الشات)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle("💎 نظام تذاكر فخامة جابر باشا")
            .setDescription(`
            **مرحباً بك في أرقى خدمات السيرفر**
            
            نحن هنا لخدمتك، يرجى اختيار القسم المناسب من القائمة أدناه:
            
            🔴 **قسم طلب البنرات**: للحصول على تصاميم بنرات احترافية.
            ⚫ **قسم طلب الاستيكرات**: لطلب استيكرات خاصة وفريدة.
            🔵 **قسم الدعم الفني**: للاستفسارات والمشاكل التقنية.
            
            *ملاحظة: يجب كتابة بياناتك قبل فتح التذكرة.*
            `)
            .setColor("#FF0000") // أحمر لامع
            .setImage(CONFIG.IMAGE_URL)
            .setFooter({ text: "Jaber Pasha System", iconURL: client.user.displayAvatarURL() });

        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_select')
                    .setPlaceholder('اختر القسم الذي تحتاجه...')
                    .addOptions([
                        { label: 'طلب بنرات', value: 'banners', description: 'لطلب بنر باللون الأحمر اللامع', emoji: '🔴' },
                        { label: 'طلب استيكر', value: 'stickers', description: 'لطلب استيكر باللون الأسود اللامع', emoji: '⚫' },
                        { label: 'الدعم الفني', value: 'support', description: 'للتواصل مع الإدارة (أزرق لامع)', emoji: '🔵' },
                    ]),
            );

        await message.channel.send({ embeds: [embed], components: [menu] });
        message.delete();
    }
});

// التعامل مع التفاعلات
client.on('interactionCreate', async (interaction) => {
    
    // 1. فتح المودال (الاستمارة) عند اختيار فئة
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        const choice = interaction.values[0];
        const modal = new ModalBuilder()
            .setCustomId(`modal_${choice}`)
            .setTitle('استمارة فتح التذكرة');

        const inputName = new TextInputBuilder()
            .setCustomId('user_info')
            .setLabel("الاسم والبيانات المطلوبة")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("اكتب اسمك، وغرضك من التذكرة هنا...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(inputName));
        await interaction.showModal(modal);
    }

    // 2. معالجة بيانات المودال وإنشاء التذكرة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const info = interaction.fields.getTextInputValue('user_info');
        
        let categoryName = "";
        let embedColor = "";
        let supportID = CONFIG.ADMIN_ROLE;

        if (type === 'banners') { categoryName = "ticket-banner"; embedColor = "#FF0000"; }
        else if (type === 'stickers') { categoryName = "ticket-sticker"; embedColor = "#1A1A1A"; }
        else if (type === 'support') { categoryName = "ticket-support"; embedColor = "#0099FF"; }

        const channel = await interaction.guild.channels.create({
            name: `${categoryName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: supportID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`تذكرة جديدة - ${categoryName}`)
            .setColor(embedColor)
            .setDescription(`**صاحب التذكرة:** ${interaction.user}\n**البيانات:**\n${info}`)
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وتدوين').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${supportID}> | ${interaction.user}`, embeds: [ticketEmbed], components: [buttons] });
        await interaction.followUp({ content: `تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // 3. زر الاستلام (Claim)
    if (interaction.isButton() && interaction.customId === 'claim_ticket') {
        if (!interaction.member.roles.cache.has(CONFIG.ADMIN_ROLE)) {
            return interaction.reply({ content: "عذراً، هذا الزر للمسؤولين فقط.", ephemeral: true });
        }
        
        await interaction.channel.permissionOverwrites.edit(CONFIG.ADMIN_ROLE, { SendMessages: true });
        await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true });

        const claimEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(`✅ تم استلام التذكرة بواسطة: ${interaction.user}`);
        
        await interaction.reply({ embeds: [claimEmbed] });
        
        // لوج الاستلام
        const logChan = client.channels.cache.get(CONFIG.CLAIM_LOG_CHANNEL);
        if (logChan) logChan.send({ content: `الاداري ${interaction.user.tag} استلم تذكرة ${interaction.channel.name}` });
    }

    // 4. زر الإغلاق والتقييم
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        const ratingMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rate_ticket')
                .setPlaceholder('قيم الخدمة قبل الإغلاق...')
                .addOptions([
                    { label: '⭐⭐⭐⭐⭐ ممتاز', value: '5' },
                    { label: '⭐⭐⭐⭐ جيد جداً', value: '4' },
                    { label: '⭐⭐⭐ متوسط', value: '3' },
                    { label: '⭐ سيء', value: '1' },
                ])
        );
        await interaction.reply({ content: "يرجى تقييم الخدمة لإتمام عملية الإغلاق:", components: [ratingMenu] });
    }

    // 5. معالجة التقييم واللوجز النهائي
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_ticket') {
        const rating = interaction.values[0];
        await interaction.reply("جاري حفظ البيانات وإغلاق التذكرة...");

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        let logContent = messages.map(m => `${m.author.tag}: ${m.content}`).reverse().join('\n');

        const transcriptEmbed = new EmbedBuilder()
            .setTitle("نسخة التذكرة (Transcript)")
            .addFields(
                { name: "صاحب التذكرة", value: interaction.channel.name, inline: true },
                { name: "التقييم", value: `${rating} نجوم`, inline: true },
                { name: "أغلق بواسطة", value: interaction.user.tag, inline: true }
            )
            .setColor("#FF0000")
            .setTimestamp();

        // إرسال للوجز والنسخ
        const transcriptChan = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
        const logsChan = client.channels.cache.get(CONFIG.LOGS_CHANNEL);

        if (transcriptChan) await transcriptChan.send({ embeds: [transcriptEmbed] });
        if (logsChan) await logsChan.send({ content: `سجل المحادثة لـ ${interaction.channel.name}:\n\`\`\`${logContent.slice(0, 1900)}\`\`\`` });

        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(CONFIG.TOKEN);
