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
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// إعدادات الأيدي (IDs) الخاصة بك - ثابتة كما طلبت
const SETTINGS = {
    SERVER_ID: "1267986207569350709",
    OWNER_ID: "1516441623662170172",
    STAFF_ROLES: ["1517120729559203931", "1516441626384269343"],
    TECH_SUPPORT_STAFF: "1517120729559203931",
    CLAIM_LOGS: "1516441752716709970",
    GENERAL_LOGS: "1516499096796664030",
    TRANSCRIPT_LOGS: "1516508105704214629",
    IMAGE_URL: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" 
};

// وظيفة للتحقق من هوية الإداري
const isStaff = (member) => {
    return SETTINGS.STAFF_ROLES.some(roleId => member.roles.cache.has(roleId)) || 
           member.id === SETTINGS.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`✅ System Online: ${client.user.tag}`);
    
    // تسجيل الأوامر (تأكد من وجود الوصف لكل حقل لتجنب Error 50035)
    const commands = [
        { 
            name: 'setup', 
            description: 'إنشاء بنل التذاكر الاحترافي لمركز خدمات جابر باشا' 
        }
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ Commands Registered');
    } catch (error) {
        console.error('❌ Command Registration Error:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر إنشاء البنل /setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ عذراً، هذا الأمر مخصص للإدارة فقط.", ephemeral: true });
        }

        const panelEmbed = new EmbedBuilder()
            .setTitle("⚜️ مـركـز خـدمـات جـابـر بـاشـا ⚜️")
            .setDescription(`
            **أهلاً بك في الصرح الإداري لسيرفر Var Vat~**
            
            نحن فخورون بتقديم أرقى أنظمة الدعم الفني لعام 2026.
            للحصول على خدمتك، يرجى اختيار القسم المناسب من القائمة:
            
            🔴 **قـسـم طـلـب الـبـنـرات الـفـاخـرة**
            ⚫ **قـسـم طـلـب الاسـتـيـكـرات الـحـصـريـة**
            🔵 **قـسـم الـدعـم الـفـنـي الـمـبـاشـر**
            
            ────────────────────
            *ملاحظة: البيانات المطلوبة إلزامية لضمان جودة الخدمة.*
            `)
            .setColor("#FF0000") // أحمر لامع
            .setImage(SETTINGS.IMAGE_URL)
            .setFooter({ text: "Var Vat~ High Management System", iconURL: interaction.guild.iconURL() });

        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('🛡️ إختر القسم الذي ترغب بالتوجه إليه...')
                .addOptions([
                    { label: 'طلب بنرات', value: 'banners', emoji: '🔴', description: 'التوجه لفتح تذكرة في قسم البنرات' },
                    { label: 'طلب استيكر', value: 'stickers', emoji: '⚫', description: 'التوجه لفتح تذكرة في قسم الاستيكرات' },
                    { label: 'الدعم الفني', value: 'tech_support', emoji: '🔵', description: 'فتح تذكرة للتواصل المباشر مع المسؤولين' },
                ])
        );

        await interaction.reply({ embeds: [panelEmbed], components: [selectMenu] });
    }

    // 2. المودال (البيانات الإلزامية)
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
        const category = interaction.values[0];
        const modal = new ModalBuilder()
            .setCustomId(`modal_${category}`)
            .setTitle('إستمارة البيانات الرسمية');

        const input = new TextInputBuilder()
            .setCustomId('user_info')
            .setLabel("الاسم والغرض من فتح التذكرة")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("الرجاء كتابة كافة التفاصيل هنا لكي يتمكن الإداري من مساعدتك...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }

    // 3. معالجة إنشاء التذكرة
    if (interaction.isModalSubmit()) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const category = interaction.customId.split('_')[1];
            const info = interaction.fields.getTextInputValue('user_info');
            
            let color, label, staffList;
            if (category === 'banners') { color = "#FF0000"; label = "بنر"; staffList = SETTINGS.STAFF_ROLES; }
            else if (category === 'stickers') { color = "#1a1a1a"; label = "استيكر"; staffList = SETTINGS.STAFF_ROLES; }
            else { color = "#0080FF"; label = "دعم-فني"; staffList = [SETTINGS.TECH_SUPPORT_STAFF]; }

            const ticketChannel = await interaction.guild.channels.create({
                name: `${label}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...staffList.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`⚜️ تذكرة جديدة | قسم ${label}`)
                .setColor(color)
                .setDescription(`مرحباً بك ${interaction.user}، فريق الإدارة جاهز لخدمتك.`)
                .addFields(
                    { name: "👤 العضو صاحب الطلب", value: `${interaction.user}`, inline: true },
                    { name: "📝 البيانات المرفقة", value: `\`\`\`text\n${info}\n\`\`\`` }
                )
                .setTimestamp();

            const btns = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق وتدوين').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await ticketChannel.send({ content: `<@&${staffList[0]}>`, embeds: [welcomeEmbed], components: [btns] });
            await interaction.followUp({ content: `تم فتح تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
        } catch (err) {
            await interaction.followUp({ content: "❌ حدث خطأ، تأكد من صلاحيات البوت كمسؤول.", ephemeral: true });
        }
    }

    // 4. الأزرار - (للإدارة فقط)
    if (interaction.isButton()) {
        if (!checkStaff(interaction.member)) {
            return interaction.reply({ content: "❌ عذراً، هذا الإجراء مخصص للمسؤولين فقط.", ephemeral: true });
        }

        if (interaction.customId === 'claim_ticket') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تمت عملية الاستلام بواسطة: ${interaction.user}`)] });
            const cLog = client.channels.cache.get(SETTINGS.CLAIM_LOGS);
            if (cLog) cLog.send(`🎫 الإداري **${interaction.user.tag}** استلم تذكرة العضو **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_ticket') {
            const rating = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rating_menu').setPlaceholder('قيم مستوى الأداء قبل الأرشفة...')
                    .addOptions([
                        { label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5', description: 'أداء احترافي' },
                        { label: 'جيد ⭐⭐⭐⭐', value: '4', description: 'أداء جيد' },
                        { label: 'سيء ⭐', value: '1', description: 'أداء يحتاج تطوير' },
                    ])
            );
            await interaction.reply({ content: "يرجى تقييم الأداء لإتمام عملية الأرشفة:", components: [rating] });
        }
    }

    // 5. التقييم النهائي وحفظ السجل العمودي
    if (interaction.isStringSelectMenu() && interaction.customId === 'rating_menu') {
        if (!checkStaff(interaction.member)) return interaction.reply({ content: "❌ للمسؤولين فقط", ephemeral: true });
        
        const rating = interaction.values[0];
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptText = messages.filter(m => !m.author.bot).map(m => `[${m.createdAt.toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).reverse().join('\n');

        const logEmbed = new EmbedBuilder()
            .setTitle("📂 أرشيف تذكرة مغلقة")
            .addFields(
                { name: "👤 العضو", value: interaction.channel.name, inline: true },
                { name: "⭐ التقييم", value: `${rating} نجوم`, inline: true },
                { name: "🔒 الإداري المسؤول", value: interaction.user.tag, inline: true }
            )
            .setColor("#FF0000").setTimestamp();

        const tLog = client.channels.cache.get(SETTINGS.TRANSCRIPT_LOGS);
        const gLog = client.channels.cache.get(SETTINGS.GENERAL_LOGS);

        if (tLog) await tLog.send({ embeds: [logEmbed] });
        if (gLog && transcriptText) await gLog.send({ content: `📜 **سجل المحادثة العمودي:**\n\`\`\`text\n${transcriptText.slice(0, 1900)}\n\`\`\`` });

        await interaction.reply("✅ تم تدوين السجل بنجاح، سيتم حذف التذكرة الآن...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

// تشغيل البوت عبر التوكن الموجود في الاستضافة
client.login(process.env.TOKEN).catch(e => console.log("❌ خطأ: التوكن غير موجود في Variables الاستضافة"));
