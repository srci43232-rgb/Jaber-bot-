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
    PermissionFlagsBits 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- إعدادات الأي دي (IDs) ---
const CONFIG = {
    OWNER_ROLE: "1516441623662170172",
    STAFF_ROLES: ["1517120729559203931", "1516441626384269343"],
    SUPPORT_ADMINS: "1517120729559203931", // للفئة الثالثة
    GUILD_ID: "1267986207569350709",
    INTAKE_CHANNEL: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629",
    IMAGE_URL: "https://media.discordapp.net/attachments/..." // ضع رابط صورة jaber_pasha هنا
};

client.once('ready', () => {
    console.log(`👑 ${client.user.tag} متصل الآن وجاهز لخدمتكم!`);
});

// أمر إنشاء لوحة التحكم (البنل)
client.on('messageCreate', async (message) => {
    if (message.content === '+setup' && (message.member.roles.cache.has(CONFIG.OWNER_ROLE) || message.author.id === message.guild.ownerId)) {
        
        const embed = new EmbedBuilder()
            .setTitle("👑 لوحة تحكم Jaber Pasha 👑")
            .setDescription("مرحباً بك في نظام الطلبات المتطور.\nيرجى اختيار القسم المناسب لبدء تذكرتك.\n\n🔴 **قسم البنرات**\n⚫ **قسم الاستيكرات**\n🔵 **الدعم الفني**")
            .setColor("#FF0000") // أحمر لامع
            .setImage(CONFIG.IMAGE_URL)
            .setFooter({ text: "نظام إدارة التذاكر الاحترافي", iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_banner').setLabel('طلب بنر').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('btn_sticker').setLabel('طلب استيكر').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_support').setLabel('الدعم الفني').setStyle(ButtonStyle.Primary)
        );

        const channel = client.channels.cache.get(CONFIG.INTAKE_CHANNEL);
        if (channel) {
            await channel.send({ embeds: [embed], components: [buttons] });
            message.reply("✅ تم إنشاء البنل بنجاح!");
        }
    }
});

// التعامل مع التفاعلات
client.on('interactionCreate', async (interaction) => {
    
    // 1. فتح المودال (النموذج الإجباري)
    if (interaction.isButton()) {
        if (['btn_banner', 'btn_sticker', 'btn_support'].includes(interaction.customId)) {
            const modal = new ModalBuilder()
                .setCustomId(`modal_${interaction.customId}`)
                .setTitle('بيانات العضو الإلزامية');

            const nameInput = new TextInputBuilder()
                .setCustomId('user_name')
                .setLabel("الاسم الثلاثي")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const detailInput = new TextInputBuilder()
                .setCustomId('request_detail')
                .setLabel("تفاصيل طلبك")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(detailInput));
            return await interaction.showModal(modal);
        }
    }

    // 2. معالجة بيانات المودال وإنشاء التذكرة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const type = interaction.customId.split('_')[2]; // banner, sticker, support
        const userName = interaction.fields.getTextInputValue('user_name');
        const details = interaction.fields.getTextInputValue('request_detail');

        let categoryName = "";
        let ticketColor = "";
        let allowRole = CONFIG.STAFF_ROLES[0];

        if (type === 'banner') { categoryName = "banner"; ticketColor = "#FF0000"; }
        else if (type === 'sticker') { categoryName = "sticker"; ticketColor = "#2B2D31"; }
        else { categoryName = "support"; ticketColor = "#0000FF"; allowRole = CONFIG.SUPPORT_ADMINS; }

        const ticketChannel = await interaction.guild.channels.create({
            name: `${categoryName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: allowRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            ],
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`تذكرة جديدة - قسم ${categoryName}`)
            .setColor(ticketColor)
            .addFields(
                { name: "صاحب الطلب", value: `<@${interaction.user.id}>`, inline: true },
                { name: "الاسم المعرف", value: userName, inline: true },
                { name: "التفاصيل", value: details }
            )
            .setTimestamp();

        const ticketButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `<@&${allowRole}>`, embeds: [welcomeEmbed], components: [ticketButtons] });
        await interaction.editReply(`✅ تم فتح تذكرتك هنا: ${ticketChannel}`);
    }

    // 3. استلام وإغلاق التذكرة
    if (interaction.isButton()) {
        if (interaction.customId === 'claim_ticket') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLES[0]) && !interaction.member.roles.cache.has(CONFIG.STAFF_ROLES[1])) {
                return interaction.reply({ content: "❌ هذا الزر للموظفين فقط", ephemeral: true });
            }
            await interaction.reply({ content: `✅ تم استلام التذكرة بواسطة <@${interaction.user.id}>` });
            interaction.message.edit({ components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger)
            )] });
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.reply("🔒 سيتم إغلاق التذكرة وطلب التقييم...");
            
            const ratingEmbed = new EmbedBuilder()
                .setTitle("التقييم")
                .setDescription("يرجى تقييم الخدمة قبل الإغلاق النهائي")
                .setColor("#FFFF00");

            const ratingButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rate_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Secondary)
            );

            await interaction.channel.send({ embeds: [ratingEmbed], components: [ratingButtons] });
        }

        if (interaction.customId.startsWith('rate_')) {
            const rating = interaction.customId.split('_')[1];
            await interaction.reply(`شكراً لتقييمك (${rating}/5) ! جاري حفظ البيانات وإغلاق القناة...`);

            // نظام اللوجز والترانسكريبت المبسط
            const logChannel = interaction.guild.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("نسخة التذكرة (Transcript)")
                    .setColor("#FF0000")
                    .addFields(
                        { name: "اسم القناة", value: interaction.channel.name },
                        { name: "أغلقت بواسطة", value: `<@${interaction.user.id}>` },
                        { name: "التقييم", value: `${rating}/5` }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }
});

client.login("ضع_توكن_بوتك_هنا");
