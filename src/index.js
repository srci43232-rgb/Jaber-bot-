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

// مصفوفة البيانات والأيدي (IDs) الثابتة
const SYSTEM_CORE = {
    SERVER_ID: "1267986207569350709",
    OWNER_ID: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    TECH_SUPPORT_ROLE: "1517120729559203931",
    LOG_CHANNELS: {
        CLAIM: "1516441752716709970",
        GENERAL: "1516499096796664030",
        ARCHIVE: "1516508105704214629"
    }
};

// وظيفة التحقق من الصلاحيات (السيادة الإدارية)
const isAuthorized = (member) => {
    return SYSTEM_CORE.ADMIN_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === SYSTEM_CORE.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[SYSTEM] Online as ${client.user.tag}`);
    
    // تسجيل أوامر السلاش بدقة (حل مشكلة 50035)
    const commands = [{
        name: 'setup',
        description: 'تثبيت المنظومة الإدارية المتكاملة لخدمات السيرفر'
    }];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] Administrative Commands Registered');
    } catch (e) { console.error('[ERROR] Command Registry Failed', e); }
});

client.on('interactionCreate', async (interaction) => {
    
    // 1. تشغيل المنظومة (The Core Panel)
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "⚠️ اختراق أمني: أنت لا تملك تصريح (أمين السيرفر).", ephemeral: true });
        }

        const serverIcon = interaction.guild.iconURL({ size: 1024 });
        
        const mainPanel = new EmbedBuilder()
            .setAuthor({ name: `المنظومة الإدارية لـ ${interaction.guild.name}`, iconURL: serverIcon })
            .setTitle(`♛ مـركـز الـنـخـبـة لـلـخـدمـات الـحـصـريـة ♛`)
            .setDescription(`
            **« بـروتوكول خـدمـة الـعـملاء »**
            
            مرحباً بك في الوجهة الرسمية لطلب الخدمات في **${interaction.guild.name}**. 
            لقد تم تصميم هذا المركز لضمان تنفيذ طلباتكم بأعلى معايير الدقة.
            
            ━━━━━━━━━━━━━━━━━━━━━━
            **💠 بـوابـات الـتـواصل الـرسـمية :**
            
            🔴 **قـسـم الـبـنـرات الـفـاخـرة (Elite Banners)**
            *تـصـامـيـم سـيـنـمـائـيـة تـعـكـس هـويـتـك الـخـاصـة.*

            ⚫ **قـسـم الاسـتـيـكـرات الـمـلكيـة (Royal Stickers)**
            *إضـافـات إبـداعـيـة مـبـتـكـرة لـمـجـتـمـعـك.*

            🔵 **الـدعـم الـفـنـي الـمـبـاشـر (Technical Core)**
            *تـواصـل حـصـري ومـشـفـر مـع كـبـار الـمـسـؤولـيـن.*
            ━━━━━━━━━━━━━━━━━━━━━━
            
            *⚠️ لـبـدء الإجـراءات، يُـرجـى اخـتـيـار الـقـسـم مـن الـقـائـمـة أدناه ثـم اسـتـيفاء الـبـيـانـات الـمـطـلـوبة.*
            `)
            .setColor("#FF0000") // أحمر لامع
            .setThumbnail(serverIcon)
            .setImage(serverIcon)
            .setFooter({ text: `${interaction.guild.name} Security & Services Protocol • 2026`, iconURL: serverIcon });

        const selector = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gate')
                .setPlaceholder('🔱 قـم بـاخـتـيـار بـوابـة الـخـدمـة...')
                .addOptions([
                    { label: 'بوابة البنرات الفاخرة', value: 'gate_banners', emoji: '🔴', description: 'تقديم طلب تصميم بنر احترافي' },
                    { label: 'بوابة الاستيكرات الملكية', value: 'gate_stickers', emoji: '⚫', description: 'تقديم طلب تصميم استيكر حصري' },
                    { label: 'بوابة الدعم الفني المباشر', value: 'gate_support', emoji: '🔵', description: 'فتح قناة اتصال مع الإدارة العليا' },
                ])
        );

        await interaction.reply({ embeds: [mainPanel], components: [selector] });
    }

    // 2. بروتوكول البيانات (The Modal)
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_gate') {
        const gate = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${gate}`).setTitle('🛡️ بـروتوكول اسـتـيـفـاء الـبـيـانـات');
        
        const infoField = new TextInputBuilder()
            .setCustomId('user_inputs')
            .setLabel("الاسم والغرض من الطلب (إلزامي)")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("يرجى كتابة كافة التفاصيل هنا لضمان قبول طلبكم من قبل الإدارة...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(infoField));
        await interaction.showModal(modal);
    }

    // 3. إنشاء قناة الاتصال (The Ticket Channel)
    if (interaction.isModalSubmit()) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const gateType = interaction.customId.split('_')[1];
            const data = interaction.fields.getTextInputValue('user_inputs');
            
            let settings = { color: "#FF0000", label: "Elite", staff: SYSTEM_CORE.ADMIN_ROLES };
            if (gateType === 'gate_stickers') { settings = { color: "#000000", label: "Royal", staff: SYSTEM_CORE.ADMIN_ROLES }; }
            else if (gateType === 'gate_support') { settings = { color: "#0080FF", label: "Technical", staff: [SYSTEM_CORE.TECH_SUPPORT_ROLE] }; }

            const channel = await interaction.guild.channels.create({
                name: `🔱-${settings.label}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...settings.staff.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle(`🔱 بـوابـة الاتـصـال الـرسمية - ${settings.label} 🔱`)
                .setDescription(`مرحباً بك ${interaction.user}، تم تفعيل قناتك بنجاح. فريق الإدارة بانتظارك.`)
                .addFields(
                    { name: "👤 الـمُـستـخـدم", value: `> ${interaction.user.tag}`, inline: true },
                    { name: "🆔 الـهـويـة", value: `> ${interaction.user.id}`, inline: true },
                    { name: "📝 الـمـلف الـمُـقـدم", value: `\`\`\`text\n${data}\n\`\`\`` }
                )
                .setColor(settings.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_action').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_action').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `<@&${settings.staff[0]}>`, embeds: [welcome], components: [actionRow] });
            await interaction.followUp({ content: `✅ تم فتح القناة بنجاح: ${channel}`, ephemeral: true });
        } catch (e) { console.error(e); }
    }

    // 4. العمليات الإدارية (Buttons)
    if (interaction.isButton()) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: "❌ خطأ في الصلاحيات: هذا الإجراء لكبار المسؤولين فقط.", ephemeral: true });
        }

        if (interaction.customId === 'claim_action') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تم تولي المهمة من قبل المسؤول: ${interaction.user}`)] });
            const cLog = client.channels.cache.get(SYSTEM_CORE.LOG_CHANNELS.CLAIM);
            if (cLog) cLog.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_action') {
            const ratingSelector = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_system').setPlaceholder('🌟 تـقـيـيـم جـودة الـخدمـة...')
                    .addOptions([
                        { label: 'تقييم ملكي (5 نجوم)', value: '5', emoji: '⭐' },
                        { label: 'تقييم جيد (3 نجوم)', value: '3', emoji: '⭐' },
                        { label: 'تقييم غير مرضي (1 نجمة)', value: '1', emoji: '⭐' },
                    ])
            );
            await interaction.reply({ content: "يرجى تقييم الأداء لإتمام عملية الأرشفة النهائية:", components: [ratingSelector] });
        }
    }

    // 5. الأرشفة النهائية (Vertical Transcript)
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_system') {
        if (!isAuthorized(interaction.member)) return;

        const rating = interaction.values[0];
        const msgs = await interaction.channel.messages.fetch({ limit: 100 });
        const verticalTranscript = msgs.filter(m => !m.author.bot)
            .map(m => `● [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`)
            .reverse().join('\n');

        const archiveEmbed = new EmbedBuilder()
            .setTitle("📂 مـلـف أرشـيـف الـتـذاكـر")
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.channel.name}`, inline: true },
                { name: "⭐ الـتـقـيـيـم", value: `> ${rating} نجوم`, inline: true },
                { name: "🔒 الـمـسـؤول", value: `> ${interaction.user.tag}`, inline: true }
            )
            .setColor("#FF0000").setTimestamp();

        const archiveChan = client.channels.cache.get(SYSTEM_CORE.LOG_CHANNELS.ARCHIVE);
        const generalChan = client.channels.cache.get(SYSTEM_CORE.LOG_CHANNELS.GENERAL);

        if (archiveChan) await archiveChan.send({ embeds: [archiveEmbed] });
        if (generalChan && verticalTranscript) await generalChan.send({ 
            content: `📜 **الـسـجـل الـرقـمـي لـلـتـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${verticalTranscript.slice(0, 1900)}\n\`\`\`` 
        });

        await interaction.reply("✅ تم تدوين السجل الإداري بنجاح، سيتم الحذف الآن...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
