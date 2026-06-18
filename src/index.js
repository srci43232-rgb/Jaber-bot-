const {
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
    ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder,
    TextInputStyle, ChannelType, PermissionFlagsBits, REST, Routes
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const openTickets = new Map();

client.on('clientReady', async () => {
    console.log(`Bot Ready - نظام التذاكر الاحترافي شغال`);
    console.log(`Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [{ name: 'setup', description: 'إنشاء بانل التذاكر' }] },
        );
        console.log('[LOG] تم تسجيل أمر /setup بنجاح');
    } catch (error) {
        console.error(error);
    }
});

// دالة إنشاء البانل - الوصف الفخم الجديد
async function createTicketPanel(channel) {
    const panelEmbed = new EmbedBuilder()
   .setTitle('🎟️ | نظام التذاكر الاحترافي')
   .setDescription(`
\`\`\`ansi
[2;31m[1;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
[2;31m[1;31m     أهلاً بك في مركز الدعم الفني     [0m
[2;31m[1;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
\`\`\`
**⚜️ لفتح تذكرة جديدة، اختر الخدمة المناسبة أدناه**

> **🖼️ طلب بنر:** تصميم احترافي مخصص لك
> **✨ طلب استيكر:** تصميم استيكر فريد وحصري  
> **🛠️ الدعم الفني:** مساعدة وحل المشاكل التقنية

**⚠️ تنبيه:** يجب إدخال بياناتك الصحيحة كاملة قبل فتح التذكرة لضمان سرعة الرد`)
   .setColor(0xFF0000) // أحمر لامع فخم
   .setThumbnail('https://cdn.discordapp.com/attachments/123456789/ticket.png') // حط لينك صورة لوجو سيرفرك هنا
   .setFooter({ text: 'نظام التذاكر • جميع التذاكر مسجلة • تقييم الخدمة بعد الإغلاق', iconURL: client.user.displayAvatarURL() });

    const row = new ActionRowBuilder()
   .addComponents(
            new ButtonBuilder().setCustomId('banner_ticket').setLabel('طلب بنر').setStyle(ButtonStyle.Danger).setEmoji('🖼️'),
            new ButtonBuilder().setCustomId('sticker_ticket').setLabel('طلب استيكر').setStyle(ButtonStyle.Secondary).setEmoji('✨'),
            new ButtonBuilder().setCustomId('support_ticket').setLabel('الدعم الفني').setStyle(ButtonStyle.Primary).setEmoji('🛠️')
        );

    await channel.send({ embeds: [panelEmbed], components: [row] });
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('الأمر ده للأدمن فقط');
        }
        await createTicketPanel(message.channel);
        await message.delete();
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'الأمر ده للأدمن فقط', ephemeral: true });
        }
        await createTicketPanel(interaction.channel);
        await interaction.reply({ content: 'تم إنشاء بانل التذاكر ✅', ephemeral: true });
        return;
    }

    if (interaction.isButton() && ['banner_ticket', 'sticker_ticket', 'support_ticket'].includes(interaction.customId)) {
        let modalTitle = '';
        if (interaction.customId === 'banner_ticket') modalTitle = '🖼️ طلب بنر - بيانات العميل';
        if (interaction.customId === 'sticker_ticket') modalTitle = '✨ طلب استيكر - بيانات العميل';
        if (interaction.customId === 'support_ticket') modalTitle = '🛠️ الدعم الفني - بيانات العميل';

        const modal = new ModalBuilder().setCustomId(`ticket_form_${interaction.customId}`).setTitle(modalTitle);
        const nameInput = new TextInputBuilder().setCustomId('user_name').setLabel('الاسم الكامل').setStyle(TextInputStyle.Short).setPlaceholder('مثال: أحمد محمد').setRequired(true);
        const reasonInput = new TextInputBuilder().setCustomId('user_reason').setLabel('تفاصيل الطلب بالكامل').setStyle(TextInputStyle.Paragraph).setPlaceholder('اشرح طلبك بالتفصيل عشان نخدمك أسرع').setRequired(true);
        const contactInput = new TextInputBuilder().setCustomId('user_contact').setLabel('رقم واتساب / ديسكورد آخر').setStyle(TextInputStyle.Short).setPlaceholder('اختياري').setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(reasonInput),
            new ActionRowBuilder().addComponents(contactInput)
        );

        await interaction.showModal(modal);
        console.log(`[TICKET-LOG] ${interaction.user.tag} بدأ يملأ فورم ${interaction.customId}`);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_form_')) {
        const categoryType = interaction.customId.replace('ticket_form_', '');
        let categoryName = '', categoryColor = 0x000000, categoryEmoji = '';

        if (categoryType === 'banner_ticket') { categoryName = 'طلب بنر'; categoryColor = 0xFF0000; categoryEmoji = '🖼️'; } 
        else if (categoryType === 'sticker_ticket') { categoryName = 'طلب استيكر'; categoryColor = 0x2B2D31; categoryEmoji = '✨'; } 
        else if (categoryType === 'support_ticket') { categoryName = 'الدعم الفني'; categoryColor = 0x0099FF; categoryEmoji = '🛠️'; }

        const userName = interaction.fields.getTextInputValue('user_name');
        const userReason = interaction.fields.getTextInputValue('user_reason');
        const userContact = interaction.fields.getTextInputValue('user_contact') || 'غير محدد';

        await interaction.deferReply({ ephemeral: true });

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            ],
        });

        openTickets.set(ticketChannel.id, { ownerId: interaction.user.id, category: categoryName, claimedBy: null });

        // صفحة المعلومات الفخمة الجديدة
        const ticketEmbed = new EmbedBuilder()
       .setAuthor({ name: `تذكرة جديدة • ${categoryName}`, iconURL: interaction.user.displayAvatarURL() })
       .setColor(categoryColor)
       .setThumbnail(interaction.guild.iconURL())
       .setDescription(`\`\`\`ansi
[2;33m[1;33mمرحباً ${interaction.user.username}، تم فتح تذكرتك بنجاح[0m
[2;32m[1;32mسيتم الرد عليك في أقرب وقت من قبل فريق العمل[0m
\`\`\``)
       .addFields(
                { name: '👤 العميل', value: `${interaction.user}`, inline: true },
                { name: '📝 الاسم المسجل', value: `\`\`\`${userName}\`\`\``, inline: true },
                { name: '📊 حالة التذكرة', value: `\`\`بانتظار الاستلام\`\`\``, inline: true },
                { name: '📞 وسيلة التواصل', value: `\`\`\`${userContact}\`\`\``, inline: false },
                { name: '📋 تفاصيل الطلب', value: `\`\`\`${userReason}\`\`\``, inline: false }
            )
       .setFooter({ text: `Ticket ID: ${ticketChannel.id} • ${categoryEmoji} ${categoryName}`, iconURL: client.user.displayAvatarURL() })
       .setTimestamp();

        const ticketButtons = new ActionRowBuilder()
       .addComponents(
                new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('🖐️'),
                new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

        await ticketChannel.send({ content: `|| ${interaction.user} @everyone ||`, embeds: [ticketEmbed], components: [ticketButtons] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك بنجاح ${ticketChannel}` });
        console.log(`[TICKET-LOG] تذكرة جديدة: ${categoryName} | صاحبها: ${interaction.user.tag} | ID: ${ticketChannel.id}`);
    }

    if (interaction.isButton() && interaction.customId === 'claim_ticket') {
        const ticketData = openTickets.get(interaction.channel.id);
        if (!ticketData) return interaction.reply({ content: 'التذكرة دي مش متسجلة', ephemeral: true });
        if (ticketData.claimedBy) return interaction.reply({ content: `التذكرة مستلمة بالفعل من <@${ticketData.claimedBy}>`, ephemeral: true });

        ticketData.claimedBy = interaction.user.id;
        openTickets.set(interaction.channel.id, ticketData);

        const claimEmbed = new EmbedBuilder().setDescription(`✅ **تم استلام التذكرة**\nبواسطة: ${interaction.user}\nيرجى الانتظار حتى يتم الرد عليك`).setColor(0x00FF00);
        await interaction.reply({ embeds: [claimEmbed] });
        console.log(`[TICKET-LOG] تذكرة ${interaction.channel.name} تم استلامها بواسطة ${interaction.user.tag}`);
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        const ticketData = openTickets.get(interaction.channel.id);
        if (!ticketData) return interaction.reply({ content: 'التذكرة دي مش متسجلة', ephemeral: true });

        await interaction.reply('جاري إغلاق التذكرة وإرسال التقييم...');
        console.log(`[TICKET-LOG] تذكرة ${interaction.channel.name} تم إغلاقها بواسطة ${interaction.user.tag}`);

        try {
            const owner = await client.users.fetch(ticketData.ownerId);
            const ratingEmbed = new EmbedBuilder().setTitle('📊 تقييم خدمة العملاء').setDescription(`تم إغلاق تذكرتك الخاصة بـ **${ticketData.category}**\n\n**نقدر وقتك، ممكن تقييم تجربتك معنا؟**`).setColor(0xFFD700).setThumbnail(client.user.displayAvatarURL());
            const ratingRow = new ActionRowBuilder().addComponents(
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

    if (interaction.isButton() && interaction.customId.startsWith('rate_')) {
        const rating = interaction.customId.replace('rate_', '');
        await interaction.reply({ content: `شكراً لتقييمك **${rating} نجوم** ⭐\nرأيك يهمنا لتحسين الخدمة`, ephemeral: true });
        console.log(`[TICKET-LOG] المستخدم ${interaction.user.tag} قيم الخدمة بـ ${rating} نجوم`);
    }
});

client.login(process.env.TOKEN);
