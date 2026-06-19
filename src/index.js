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
    ChannelType,
    REST,
    Routes
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// --- الإعدادات النهائية ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    SUPPORT_ADMIN_ONLY: "1517120729559203931",
    CLAIM_LOG: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629"
};

client.once('ready', async () => {
    console.log(`✅ تم تسجيل الدخول باسم: ${client.user.tag}`);
    const commands = [{ name: 'setup', description: 'إرسال بنل التذاكر الفخم' }];
    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تحديث أوامر السلاش');
    } catch (error) { console.error(error); }
});

// دالة إنشاء البنل الرئيسي
async function sendLuxuryPanel(channel, interaction = null) {
    const serverIcon = channel.guild.iconURL({ dynamic: true, size: 1024 });
    
    const embed = new EmbedBuilder()
        .setTitle(`⚜️ صرح فخامة سيرفر ${channel.guild.name} ⚜️`)
        .setDescription(`
        **أهلاً بك في قسم الخدمات الموحد**
        
        نحن هنا لتقديم تجربة فريدة تليق بوجودكم معنا. يرجى اختيار القسم المطلوب من القائمة أدناه لبدء المعاملة.
        
        ---
        🔴 **قسم طلب البنرات الاحترافية**
        *للحصول على تصاميم البنرات المتحركة والثابتة بأعلى جودة.*
        
        ⚫ **قسم طلب الاستيكرات المميزة**
        *لطلب استيكرات مخصصة تعبر عن هويتك في السيرفر.*
        
        🔵 **قسم الدعم الفني والإدارة**
        *للمساعدة التقنية، الاستفسارات، أو تقديم الشكاوى.*
        ---
        
        **⚠️ ملاحظة هامة:**
        *يتوجب عليك تعبئة كافة البيانات المطلوبة بوضوح لضمان سرعة الرد من قبل طاقم الإدارة.*
        
        **قُم بالاختيار من القائمة أدناه لبدء التذكرة 👇**
        `)
        .setColor("#FF0000") // أحمر لامع
        .setThumbnail(serverIcon)
        .setImage(serverIcon) // وضع صورة السيرفر كصورة كبيرة أيضاً للفخامة
        .setFooter({ text: "Var Vat~ Management System", iconURL: serverIcon })
        .setTimestamp();

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('main_select')
            .setPlaceholder('إختر القسم المناسب من هنا...')
            .addOptions([
                { label: 'طلب بنرات', value: 'banners', emoji: '🔴', description: 'تصاميم احترافية باللون الأحمر' },
                { label: 'طلب استيكر', value: 'stickers', emoji: '⚫', description: 'استيكرات مميزة باللون الأسود' },
                { label: 'الدعم الفني', value: 'support', emoji: '🔵', description: 'التواصل مع إدارة السيرفر' },
            ])
    );

    if (interaction) await interaction.reply({ embeds: [embed], components: [menu] });
    else await channel.send({ embeds: [embed], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    // 1. فتح المودال (الاستمارة) ببيانات مفصلة
    if (interaction.isStringSelectMenu() && interaction.customId === 'main_select') {
        const type = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${type}`).setTitle('إستمارة فتح التذكرة');

        const nameInput = new TextInputBuilder()
            .setCustomId('user_name').setLabel("الاسم الثلاثي").setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder("اكتب اسمك هنا...");
        
        const detailsInput = new TextInputBuilder()
            .setCustomId('user_details').setLabel("تفاصيل الطلب / الغرض").setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder("اشرح طلبك بالتفصيل لكي نتمكن من مساعدتك...");

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(detailsInput)
        );
        await interaction.showModal(modal);
    }

    // 2. معالجة البيانات وإنشاء التذكرة المنظمة (الصورة الثانية)
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const userName = interaction.fields.getTextInputValue('user_name');
        const userDetails = interaction.fields.getTextInputValue('user_details');
        
        let color, categoryName, supportID, emoji;
        if (type === 'banners') { color = "#FF0000"; categoryName = "🔴-بنرات"; supportID = CONFIG.ADMIN_ROLES; emoji = "🔴"; }
        else if (type === 'stickers') { color = "#1a1a1a"; categoryName = "⚫-استيكرات"; supportID = CONFIG.ADMIN_ROLES; emoji = "⚫"; }
        else { color = "#0080FF"; categoryName = "🔵-دعم-فني"; supportID = [CONFIG.SUPPORT_ADMIN_ONLY]; emoji = "🔵"; }

        const channel = await interaction.guild.channels.create({
            name: `${categoryName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...supportID.map(role => ({ id: role, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        // تصميم التذكرة من الداخل (تعديل الصورة الثانية)
        const ticketEmbed = new EmbedBuilder()
            .setAuthor({ name: `نظام تذاكر ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
            .setTitle(`${emoji} تذكرة جديدة | ${categoryName.split('-')[1]}`)
            .setColor(color)
            .setDescription(`مرحباً بك ${interaction.user} في تذكرتك الخاصة. طاقم الإدارة سيقوم بالرد عليك في أقرب وقت ممكن.`)
            .addFields(
                { name: "👤 صاحب التذكرة", value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: "📝 الاسم المقدم", value: `\`\`\`${userName}\`\`\``, inline: true },
                { name: "📑 تفاصيل الطلب", value: `\`\`\`${userDetails}\`\`\`` }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: "نرجو منك التحلي بالصبر حتى يتم الرد." })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close').setLabel('إغلاق وتوثيق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `||<@&${supportID[0]}>||`, embeds: [ticketEmbed], components: [row] });
        await interaction.followUp({ content: `تم إنشاء تذكرتك بنجاح في قسم ${categoryName}: ${channel}`, ephemeral: true });
    }

    // زر الاستلام
    if (interaction.isButton() && interaction.customId === 'claim') {
        const hasRole = CONFIG.ADMIN_ROLES.some(role => interaction.member.roles.cache.has(role));
        if (!hasRole) return interaction.reply({ content: "عذراً، هذا الزر للمسؤولين فقط.", ephemeral: true });

        const claimEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(`📢 **تم استلام هذه التذكرة بواسطة:** ${interaction.user}\nسيقوم بمتابعة طلبك الآن.`);
        
        await interaction.reply({ embeds: [claimEmbed] });
        
        const logChan = client.channels.cache.get(CONFIG.CLAIM_LOG);
        if (logChan) logChan.send({ content: `✅ الإداري **${interaction.user.tag}** استلم تذكرة: **${interaction.channel.name}**` });
    }

    // زر الإغلاق والتقييم
    if (interaction.isButton() && interaction.customId === 'close') {
        const rateMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('rate_final').setPlaceholder('قيم مستوى الخدمة قبل الإغلاق...')
                .addOptions([
                    { label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' },
                    { label: 'جيد جداً ⭐⭐⭐⭐', value: '4' },
                    { label: 'متوسط ⭐⭐⭐', value: '3' },
                    { label: 'ضعيف ⭐', value: '1' },
                ])
        );
        await interaction.reply({ content: "يرجى تقييم الخدمة لإتمام عملية الأرشفة والإغلاق:", components: [rateMenu] });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_final') {
        const rating = interaction.values[0];
        await interaction.update({ content: "جاري حفظ البيانات وإغلاق القناة نهائياً...", components: [] });

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const logContent = messages.map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).reverse().join('\n');

        const finalLogEmbed = new EmbedBuilder()
            .setTitle("📁 أرشيف تذكرة")
            .setColor("#FF0000")
            .addFields(
                { name: "القناة", value: interaction.channel.name, inline: true },
                { name: "التقييم", value: `${rating} / 5 ⭐`, inline: true },
                { name: "بواسطة", value: interaction.user.tag, inline: true }
            ).setTimestamp();

        const transcriptChan = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
        const logsChan = client.channels.cache.get(CONFIG.LOGS_CHANNEL);

        if (transcriptChan) await transcriptChan.send({ embeds: [finalLogEmbed] });
        if (logsChan) await logsChan.send({ content: `سجل المحادثة:\n\`\`\`${logContent.slice(0, 1900)}\`\`\`` });

        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// الأوامر اليدوية
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await sendLuxuryPanel(message.channel);
        message.delete();
    }
});

client.login(CONFIG.TOKEN);
