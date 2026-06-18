const {
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
    ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder,
    TextInputStyle, ChannelType, PermissionFlagsBits
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// خزن التذاكر المفتوحة عشان التقييم
const openTickets = new Map();

client.once('ready', () => {
    console.log(`Bot Ready - نظام التذاكر الاحترافي شغال`);
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // أمر تشغيل بانل التذاكر - للأدمن فقط
    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('الأمر ده للأدمن فقط');
        }

        const panelEmbed = new EmbedBuilder()
        .setTitle('🎫 نظام فتح التذاكر الاحترافي')
        .setDescription('اختر نوع التذكرة المناسبة لك\n\n**⚠️ يجب ملء بياناتك كاملة قبل فتح أي تذكرة**')
        .setColor(0x2B2D31)
        .setFooter({ text: 'سيتم تسجيل كل التذاكر + تقييم الخدمة بعد الإغلاق' });

        const row = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
                .setCustomId('banner_ticket')
                .setLabel('طلب بنر')
                .setStyle(ButtonStyle.Danger) // أحمر لامع
                .setEmoji('🖼️'),
                new ButtonBuilder()
                .setCustomId('sticker_ticket')
                .setLabel('طلب استيكر')
                .setStyle(ButtonStyle.Secondary) // أسود لامع
                .setEmoji('✨'),
                new ButtonBuilder()
                .setCustomId('support_ticket')
                .setLabel('الدعم الفني')
                .setStyle(ButtonStyle.Primary) // أزرق لامع
                .setEmoji('🛠️')
            );

        await message.channel.send({ embeds: [panelEmbed], components: [row] });
        await message.delete();
    }
});

client.on('interactionCreate', async (interaction) => {
    // 1. لما يدوس على زرار فتح تذكرة
    if (interaction.isButton() && ['banner_ticket', 'sticker_ticket', 'support_ticket'].includes(interaction.customId)) {
        let modalTitle = '';
        if (interaction.customId === 'banner_ticket') modalTitle = 'طلب بنر - معلوماتك';
        if (interaction.customId === 'sticker_ticket') modalTitle = 'طلب استيكر - معلوماتك';
        if (interaction.customId === 'support_ticket') modalTitle = 'الدعم الفني - معلوماتك';

        const modal = new ModalBuilder()
        .setCustomId(`ticket_form_${interaction.customId}`)
        .setTitle(modalTitle);

        const nameInput = new TextInputBuilder()
        .setCustomId('user_name')
        .setLabel('اسمك الحقيقي')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        const reasonInput = new TextInputBuilder()
        .setCustomId('user_reason')
        .setLabel('سبب فتح التذكرة / تفاصيل الطلب')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

        const contactInput = new TextInputBuilder()
        .setCustomId('user_contact')
        .setLabel('وسيلة تواصل أخرى - اختياري')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(reasonInput),
            new ActionRowBuilder().addComponents(contactInput)
        );

        await interaction.showModal(modal);
        console.log(`[TICKET-LOG] ${interaction.user.tag} بدأ يملأ فورم ${interaction.customId}`);
    }

    // 2. لما يرسل الفورم ويتفتح التذكرة
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_form_')) {
        const categoryType = interaction.customId.replace('ticket_form_', '');
        let categoryName = '', categoryColor = 0x000000;

        if (categoryType === 'banner_ticket') {
            categoryName = 'طلب بنر'; categoryColor = 0xFF0000;
        } else if (categoryType === 'sticker_ticket') {
            categoryName = 'طلب استيكر'; categoryColor = 0x000000;
        } else if (categoryType === 'support_ticket') {
            categoryName = 'الدعم الفني'; categoryColor = 0x0099FF;
        }

        const userName = interaction.fields.getTextInputValue('user_name');
        const userReason = interaction.fields.getTextInputValue('user_reason');
        const userContact = interaction.fields.getTextInputValue('user_contact') || 'لا يوجد';

        await interaction.deferReply({ ephemeral: true });

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            ],
        });

        // خزن بيانات التذكرة عشان التقييم بعدين
        openTickets.set(ticketChannel.id, {
            ownerId: interaction.user.id,
            category: categoryName,
            claimedBy: null
        });

        const ticketEmbed = new EmbedBuilder()
        .setTitle(`🎫 تذكرة جديدة - ${categoryName}`)
        .setColor(categoryColor)
        .addFields(
                { name: 'صاحب التذكرة', value: `${interaction.user}`, inline: true },
                { name: 'الاسم', value: userName, inline: true },
                { name: 'الحالة', value: 'بانتظار الاستلام 🟡', inline: true },
                { name: 'وسيلة التواصل', value: userContact },
                { name: 'تفاصيل الطلب', value: userReason }
            )
        .setFooter({ text: `Ticket ID: ${ticketChannel.id}` })
        .setTimestamp();

        const ticketButtons = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
                .setCustomId('claim_ticket')
                .setLabel('استلام التذكرة')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🖐️'),
                new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
            );

        await ticketChannel.send({
            content: `@everyone ${interaction.user} فتح تذكرة جديدة`,
            embeds: [ticketEmbed],
            components: [ticketButtons]
        });

        await interaction.editReply({ content: `تم فتح تذكرتك ${ticketChannel} ✅` });
        console.log(`[TICKET-LOG] تذكرة جديدة: ${categoryName} | صاحبها: ${interaction.user.tag} | ID: ${ticketChannel.id}`);
    }

    // 3. زر استلام التذكرة
    if (interaction.isButton() && interaction.customId === 'claim_ticket') {
        const ticketData = openTickets.get(interaction.channel.id);
        if (!ticketData) return interaction.reply({ content: 'التذكرة دي مش متسجلة', ephemeral: true });
        if (ticketData.claimedBy) return interaction.reply({ content: `التذكرة مستلمة بالفعل من <@${ticketData.claimedBy}>`, ephemeral: true });

        ticketData.claimedBy = interaction.user.id;
        openTickets.set(interaction.channel.id, ticketData);

        const claimEmbed = new EmbedBuilder()
        .setDescription(`✅ تم استلام التذكرة بواسطة ${interaction.user}`)
        .setColor(0x00FF00);

        await interaction.reply({ embeds: [claimEmbed] });
        console.log(`[TICKET-LOG] تذكرة ${interaction.channel.name} تم استلامها بواسطة ${interaction.user.tag}`);
    }

    // 4. زر إغلاق التذكرة + التقييم الاحترافي
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        const ticketData = openTickets.get(interaction.channel.id);
        if (!ticketData) return interaction.reply({ content: 'التذكرة دي مش متسجلة', ephemeral: true });

        await interaction.reply('جاري إغلاق التذكرة وإرسال التقييم...');
        console.log(`[TICKET-LOG] تذكرة ${interaction.channel.name} تم إغلاقها بواسطة ${interaction.user.tag}`);

        // إرسال تقييم لصاحب التذكرة في الخاص
        try {
            const owner = await client.users.fetch(ticketData.ownerId);
            const ratingEmbed = new EmbedBuilder()
            .setTitle('📊 تقييم خدمة التذاكر')
            .setDescription(`تم إغلاق تذكرتك الخاصة بـ **${ticketData.category}**\n\nنتمنى تقييم تجربتك معنا:`)
            .setColor(0xFFD700);

            const ratingRow = new ActionRowBuilder()
            .addComponents(
                    new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐ ممتاز').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('rate_4').setLabel('⭐⭐⭐⭐ جيد جداً').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('rate_3').setLabel('⭐⭐⭐ جيد').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('rate_2').setLabel('⭐⭐ مقبول').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('rate_1').setLabel('⭐ سيء').setStyle(ButtonStyle.Danger),
                );

            await owner.send({ embeds: [ratingEmbed], components: [ratingRow] });
        } catch (err) {
            console.log(`[TICKET-LOG] مقدرتش أبعت تقييم لـ ${ticketData.ownerId} - قافل الخاص`);
        }

        openTickets.delete(interaction.channel.id);
        setTimeout(() => interaction.channel.delete(), 5000);
    }

    // 5. أزرار التقييم
    if (interaction.isButton() && interaction.customId.startsWith('rate_')) {
        const rating = interaction.customId.replace('rate_', '');
        await interaction.reply({ content: `شكراً لتقييمك **${rating} نجوم** ⭐\nرأيك يهمنا لتحسين الخدمة`, ephemeral: true });
        console.log(`[TICKET-LOG] المستخدم ${interaction.user.tag} قيم الخدمة بـ ${rating} نجوم`);
    }
});

client.login(process.env.TOKEN);
