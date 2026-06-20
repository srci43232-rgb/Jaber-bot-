const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField, AttachmentBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ====== كل الـ IDs بتاعتك ======
const CONFIG = {
    PANEL_CHANNEL_ID: '1516441752716709970', // روم فورم التذاكر
    TICKETS_CATEGORY: '1516441716591296657', // كاتجوري عرض التذاكر
    TRANSCRIPT_CATEGORY: '1516508105704214629', // كاتجوري حفظ التذاكر
    CLOSE_CATEGORY: '1516499096796664030', // كاتجوري التقييم والاغلاق
    
    // رتب الاداريين
    STAFF_ROLES: [
        '1516441626384269343',
        '1516441640510951584',
        '1516441637570613349' // رتبة الدعم الفني
    ],
    
    // صورة GIF للبانل - احمر لامع
    PANEL_GIF: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3F4N3Y3cWZ2dDJ6dWN0bXQ1c3VvZ2Q4Z2J1aGJ0dGJ6b2J1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L59aKIC2MFZ7G/giphy.gif'
};

const TICKET_TYPES = {
    banner: {
        label: 'بوابة البنرات الفاخرة',
        emoji: '🔴',
        color: 0xFF0000, // احمر لامع
        desc: 'تصاميم سينمائية تخطف الأنظار'
    },
    sticker: {
        label: 'بوابة الاستيكرات الملكية', 
        emoji: '⚫',
        color: 0x000000, // اسود لامع
        desc: 'إضافات إبداعية تنبض بالتميز'
    },
    support: {
        label: 'بوابة الدعم الفني المباشر',
        emoji: '🔵', 
        color: 0x3498DB, // ازرق
        desc: 'تواصل حصري ومشفر مع كبار المسؤولين'
    }
};

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} شغال تمام`);
    client.user.setActivity('Var Vat~ High Priority Protocol', { type: 3 });
});

// امر عمل البانل
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000) // احمر لامع
          .setTitle('||✧・ Var Vat~ High Priority Protocol ・||')
          .setDescription(`
بأرقى معايير الاحترافية تحت
إشراف الإدارة العليا.

───────────────
**بوابات الخدمة الرئيسية:**

${TICKET_TYPES.banner.emoji} **${TICKET_TYPES.banner.label}**
*${TICKET_TYPES.banner.desc}*

${TICKET_TYPES.sticker.emoji} **${TICKET_TYPES.sticker.label}**
*${TICKET_TYPES.sticker.desc}*

${TICKET_TYPES.support.emoji} **${TICKET_TYPES.support.label}**
*${TICKET_TYPES.support.desc}*

───────────────
⚠️ **يلزم استيفاء بروتوكول البيانات في الخطوة القادمة لتفعيل الطلب.**

*Var Vat~ High Priority Protocol • 2026*
            `)
          .setImage(CONFIG.PANEL_GIF)
          .setFooter({ text: 'اختر البوابة المناسبة لطلبك من القائمة بالأسفل' });

        const select = new StringSelectMenuBuilder()
          .setCustomId('select_ticket')
          .setPlaceholder('🔴 اختر نوع التذكرة من هنا')
          .addOptions([
                {
                    label: TICKET_TYPES.banner.label,
                    value: 'banner',
                    emoji: '🔴',
                    description: TICKET_TYPES.banner.desc
                },
                {
                    label: TICKET_TYPES.sticker.label,
                    value: 'sticker', 
                    emoji: '⚫',
                    description: TICKET_TYPES.sticker.desc
                },
                {
                    label: TICKET_TYPES.support.label,
                    value: 'support',
                    emoji: '🔵',
                    description: TICKET_TYPES.support.desc
                }
            ]);

        const row = new ActionRowBuilder().addComponents(select);
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }
});

// فتح التذكرة
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId!== 'select_ticket') return;

    const type = interaction.values[0];
    const ticketData = TICKET_TYPES[type];
    
    await interaction.deferReply({ ephemeral: true });

    const ticketChannel = await interaction.guild.channels.create({
        name: `||✧・${type}-${interaction.user.username}・`,
        type: ChannelType.GuildText,
        parent: CONFIG.TICKETS_CATEGORY,
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
          ...CONFIG.STAFF_ROLES.map(roleId => ({
                id: roleId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages],
            }))
        ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setColor(ticketData.color)
      .setTitle(`${ticketData.emoji} تذكرة ${ticketData.label}`)
      .setDescription(`
مرحباً ${interaction.user}

**تم فتح تذكرتك بنجاح** ✅
النوع: ${ticketData.label}
${ticketData.desc}

───────────────
**⚠️ بروتوكول البيانات:**
يرجى كتابة طلبك بالتفصيل مع ارفاق اي صور او روابط مطلوبة.
سيتم الرد عليك من قبل الفريق المختص في اقرب وقت.
        `)
      .setFooter({ text: `Var Vat~ Support System • ${interaction.user.id}` })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('استلام التذكرة')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🙋‍♂️'),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('تسجيل واغلاق التذكرة')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
    );

    await ticketChannel.send({ 
        content: `${interaction.user} ${CONFIG.STAFF_ROLES.map(r => `<@&${r}>`).join(' ')}`, 
        embeds: [ticketEmbed], 
        components: [buttons] 
    });
    
    await interaction.editReply({ content: `✅ تم فتح تذكرتك: ${ticketChannel}` });
});

// الازرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, channel, user, guild } = interaction;

    // زر استلام التذكرة
    if (customId === 'claim_ticket') {
        const isStaff = interaction.member.roles.cache.some(role => CONFIG.STAFF_ROLES.includes(role.id));
        if (!isStaff) return interaction.reply({ content: '❌ هذا الزر للادارة فقط', ephemeral: true });

        await channel.setName(`||✧・claimed-${user.username}・`);
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setDescription(`🙋‍♂️ تم استلام التذكرة بواسطة ${user}`);
        
        await interaction.reply({ embeds: [embed] });
    }

    // زر الاغلاق والتسجيل
    if (customId === 'close_ticket') {
        const isStaff = interaction.member.roles.cache.some(role => CONFIG.STAFF_ROLES.includes(role.id));
        if (!isStaff) return interaction.reply({ content: '❌ هذا الزر للادارة فقط', ephemeral: true });

        await interaction.deferReply();

        // حفظ الترانسكربت
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => `[${m.createdAt.toLocaleString('ar-EG')}] ${m.author.tag}: ${m.content}`).join('\n');
        
        const attachment = new AttachmentBuilder(Buffer.from(transcript), { name: `transcript-${channel.name}.txt` });
        
        const logChannel = guild.channels.cache.get(CONFIG.TRANSCRIPT_CATEGORY);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor(0xFF0000)
              .setTitle('📁 تم ارشفة تذكرة')
              .addFields(
                    { name: 'اسم التذكرة', value: channel.name, inline: true },
                    { name: 'اغلقت بواسطة', value: user.tag, inline: true }
                )
              .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed], files: [attachment] });
        }

        // رسالة التقييم
        const ratingRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_4').setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('rate_2').setLabel('⭐⭐').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
        );

        const ratingEmbed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('📊 قيم تجربتك مع الدعم الفني')
          .setDescription('رأيك يهمنا! قيّم الخدمة اللي وصلك عشان نحسن من نفسنا');

        await interaction.editReply({ content: '✅ تم تسجيل التذكرة وحفظها. سيتم حذف الروم خلال 10 ثواني', embeds: [ratingEmbed], components: [ratingRow] });

        setTimeout(() => channel.delete().catch(() => {}), 10000);
    }

    // ازرار التقييم
    if (customId.startsWith('rate_')) {
        const rating = customId.split('_')[1];
        await interaction.reply({ content: `✅ شكراً لتقييمك ${'⭐'.repeat(rating)}! تم ارسال تقييمك للادارة`, ephemeral: true });
        
        const rateChannel = guild.channels.cache.get(CONFIG.CLOSE_CATEGORY);
        if (rateChannel) {
            const rateEmbed = new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle('⭐ تقييم جديد')
              .addFields(
                    { name: 'المستخدم', value: user.tag, inline: true },
                    { name: 'التقييم', value: '⭐'.repeat(rating), inline: true }
                );
            await rateChannel.send({ embeds: [rateEmbed] });
        }
    }
});

// التوكن من متغيرات البيئة
client.login(process.env.TOKEN);
