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
    ChannelType, 
    PermissionFlagsBits,
    Collection
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- الإعدادات (IDs) ---
const CONFIG = {
    GUILD_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    STAFF_ROLES: ["1517120729559203931", "1516441626384269343"],
    TECH_SUPPORT_STAFF: "1517120729559203931", // الإدارة المحددة للفئة الثالثة
    PANEL_CHANNEL: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629",
    IMAGE_URL: "https://i.imgur.com/8Nf9y2S.png" // قم باستبدال هذا برابط صورة jaber_pasha الحقيقي
};

client.once('ready', () => {
    console.log(`👑 تم تشغيل البوت بنجاح: ${client.user.tag}`);
});

// --- أمر إنشاء البنل ---
client.on('messageCreate', async (message) => {
    if (message.content === '+setup') {
        // التحقق من الصلاحية (المالك فقط)
        if (!message.member.roles.cache.has(CONFIG.OWNER_ROLE)) return;

        const panelEmbed = new EmbedBuilder()
            .setTitle("👑 مـركـز خـدمات JABER PASHA 👑")
            .setDescription("مرحباً بك في لوحة التحكم المتطورة.\nيرجى اختيار الفئة المناسبة لفتح تذكرة وسيتم الرد عليك من قبل المختصين.\n\n🔴 **طلب بنر (Banner Order)**\n⚫ **طلب استيكر (Sticker Order)**\n🔵 **الدعم الفني (Technical Support)**\n\n*يجب تعبئة البيانات بدقة لضمان سرعة الخدمة*")
            .setColor("#FF0000") // أحمر لامع
            .setImage(CONFIG.IMAGE_URL)
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: "Jaber Pasha Management", iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_banner').setLabel('طلب بنر').setEmoji('🔴').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('open_sticker').setLabel('طلب استيكر').setEmoji('⚫').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('open_support').setLabel('الدعم الفني').setEmoji('🔵').setStyle(ButtonStyle.Primary)
        );

        const channel = client.channels.cache.get(CONFIG.PANEL_CHANNEL);
        if (channel) {
            await channel.send({ embeds: [panelEmbed], components: [buttons] });
            message.reply("✅ تم إرسال البنل الفخم بنجاح!");
        }
    }
});

// --- التعامل مع التفاعلات ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. فتح المودال (النموذج الإجباري)
    if (interaction.isButton() && interaction.customId.startsWith('open_')) {
        const type = interaction.customId.split('_')[1];
        
        const modal = new ModalBuilder()
            .setCustomId(`modal_${type}`)
            .setTitle('تـعـبئة بـيانات الـتذكرة');

        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel("الاسم الثلاثي")
            .setPlaceholder("اكتب اسمك هنا...")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const detailsInput = new TextInputBuilder()
            .setCustomId('details')
            .setLabel("تفاصيل الطلب / المشكلة")
            .setPlaceholder("اشرح ما تحتاجه بدقة...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(detailsInput)
        );
        
        return await interaction.showModal(modal);
    }

    // 2. معالجة إرسال المودال وإنشاء القناة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });

        const type = interaction.customId.split('_')[1];
        const userName = interaction.fields.getTextInputValue('name');
        const userDetails = interaction.fields.getTextInputValue('details');

        let categoryName, embedColor, staffRole;

        if (type === 'banner') { 
            categoryName = "Banners"; embedColor = "#FF0000"; staffRole = CONFIG.STAFF_ROLES; 
        } else if (type === 'sticker') { 
            categoryName = "Stickers"; embedColor = "#010101"; staffRole = CONFIG.STAFF_ROLES; 
        } else { 
            categoryName = "Support"; embedColor = "#0000FF"; staffRole = [CONFIG.TECH_SUPPORT_STAFF]; 
        }

        // إنشاء القناة
        const ticketChannel = await interaction.guild.channels.create({
            name: `${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                ...staffRole.map(id => ({ id: id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
            ],
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة - قسم ${categoryName}`)
            .setColor(embedColor)
            .setDescription(`مرحباً <@${interaction.user.id}>، سيقوم فريق الإدارة بالرد عليك قريباً.`)
            .addFields(
                { name: "👤 العضو", value: `${userName} (${interaction.user})`, inline: true },
                { name: "📝 التفاصيل", value: userDetails }
            )
            .setImage(CONFIG.IMAGE_URL)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التذكرة').setEmoji('✅').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق').setEmoji('🔒').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `<@${interaction.user.id}> | ${staffRole.map(r => `<@&${r}>`).join(' ')}`, embeds: [welcomeEmbed], components: [row] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك بنجاح: ${ticketChannel}` });

        // لوق فتح التذكرة
        const logChannel = client.channels.cache.get(CONFIG.LOGS_CHANNEL);
        if (logChannel) {
            logChannel.send({ embeds: [new EmbedBuilder().setTitle("🚨 تذكرة مفتوحة").setColor("#00FF00").addFields({ name: "العضو", value: interaction.user.tag }, { name: "القسم", value: categoryName }).setTimestamp()] });
        }
    }

    // 3. نظام الاستلام والتقييم
    if (interaction.isButton()) {
        const staffRoles = [...CONFIG.STAFF_ROLES, CONFIG.OWNER_ROLE];

        if (interaction.customId === 'claim_ticket') {
            if (!interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) return interaction.reply({ content: "❌ هذا الزر للإدارة فقط", ephemeral: true });

            await interaction.reply({ content: `✅ تم استلام التذكرة بواسطة ${interaction.user}` });
            const claimedEmbed = EmbedBuilder.from(interaction.message.embeds[0]).addFields({ name: "🛡️ المسؤول المستلم", value: `${interaction.user}` });
            await interaction.message.edit({ embeds: [claimedEmbed], components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setEmoji('🔒').setStyle(ButtonStyle.Danger)
            )] });
        }

        if (interaction.customId === 'close_ticket') {
            if (!interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) return interaction.reply({ content: "❌ هذا الزر للإدارة فقط", ephemeral: true });

            const rateRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('rate_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
            );
            
            await interaction.reply({ content: "⭐ يرجى تقييم الخدمة قبل إغلاق التذكرة نهائياً:", components: [rateRow] });
        }

        if (interaction.customId.startsWith('rate_')) {
            const rating = interaction.customId.split('_')[1];
            await interaction.update({ content: "🔒 جاري حفظ النسخة وإغلاق القناة خلال 5 ثوانٍ...", components: [] });

            // إنشاء النسخة (Transcript Log)
            const transcriptChannel = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
            if (transcriptChannel) {
                const luxuryTranscript = new EmbedBuilder()
                    .setTitle("📄 نسخة تذكرة مغلقة (Transcript)")
                    .setColor("#FF0000")
                    .setThumbnail(interaction.guild.iconURL())
                    .addFields(
                        { name: "🏷️ اسم القناة", value: interaction.channel.name, inline: true },
                        { name: "👤 العضو", value: interaction.channel.name.split('-')[1], inline: true },
                        { name: "🛠️ المسؤول", value: interaction.user.tag, inline: true },
                        { name: "⭐ التقييم", value: `${rating} نجوم`, inline: true }
                    )
                    .setFooter({ text: "أرشيف تذاكر Jaber Pasha" })
                    .setTimestamp();

                await transcriptChannel.send({ embeds: [luxuryTranscript] });
            }

            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }
});

// تسجيل الدخول باستخدام المتغير البيئي
client.login(process.env.TOKEN);
