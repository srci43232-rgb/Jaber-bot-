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

// --- قاعدة بيانات المنظومة الإدارية العليا ---
const SUPREME_CORE = {
    GUILD_ID: "1267986207569350709",
    OWNER_ID: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    TECH_SUPPORT_ROLE: "1517120729559203931",
    CHANNELS: {
        CLAIM: "1516441752716709970",
        GENERAL: "1516499096796664030",
        ARCHIVE: "1516508105704214629",
        WELCOME: "1514696892246786089"
    }
};

// وظيفة فحص الصلاحيات السيادية
const isAuthorized = (member) => {
    return SUPREME_CORE.ADMIN_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === SUPREME_CORE.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[SYSTEM] 🛡️ البروتوكول الملكي مفعّل: ${client.user.tag}`);
    
    const commands = [{
        name: 'setup',
        description: 'تثبيت المنصة الإدارية الفاخرة لمركز خدمات Var Vat~'
    }];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] 💠 تمت مزامنة الأوامر البرمجية بنجاح.');
    } catch (e) { console.error('[ERROR]', e); }
});

// --- بروتوكول الترحيب الملكي ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(SUPREME_CORE.CHANNELS.WELCOME);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `انضمام نخبة جديدة إلى ${member.guild.name}`, iconURL: member.guild.iconURL() })
        .setTitle(`✧ أهلاً بك في مـجـتـمـع الـفـخـامـة ✧`)
        .setDescription(`
        > **نـرحـب بـانـضـمـامـك إلـى الـصـرح الإداري الـأرقى.**
        > **أنت الآن جـزء مـن نـسـيـجـنا الـمـتـمـيـز.**

        **┏━━━━━━━━━━━━━━━━━━━━━━┓**
        **┃ 👤 الـمُـنـضـم :** ${member}
        **┃ 🆔 الـهـويـة :** \`${member.id}\`
        **┃ 🔢 الـعـضـو رَقـم :** \`#${member.guild.memberCount}\`
        **┗━━━━━━━━━━━━━━━━━━━━━━┛**
        `)
        .setColor("#FF0000") // أحمر ملكي
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage(member.guild.iconURL({ size: 1024 }))
        .setFooter({ text: `Security Gate • ${member.guild.name}` })
        .setTimestamp();

    await channel.send({ content: `**أهلاً بك ${member}**`, embeds: [welcomeEmbed] });
});

// --- معالجة التفاعلات (البنل والمودال والأزرار) ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر الاستخراج /setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "⚠️ تحذير: لا تملك تصريح الدخول للديوان الإداري.", ephemeral: true });
        }

        const serverIco = interaction.guild.iconURL({ size: 1024 });
        
        const mainPanel = new EmbedBuilder()
            .setAuthor({ name: `المنظومة المركزية لـ ${interaction.guild.name}`, iconURL: serverIco })
            .setTitle(`♛ مـركـز الـنـخـبـة لـلـخـدمـات الـحـصـريـة ♛`)
            .setDescription(`
            **« بـروتوكول خـدمـة الـعـملاء الـرسـمـي »**
            
            مرحباً بك في الوجهة الرسمية والوحيدة لطلب الخدمات. 
            تم تصميم هذا النظام لضمان الدقة والسرعة في التنفيذ تحت إشراف الإدارة العليا.
            
            ━━━━━━━━━━━━━━━━━━━━━━
            **💠 بـوابـات الـخـدمـة الـمـتـاحة :**
            
            🔴 **قـسـم الـبـنـرات الـفـاخـرة (Elite Banners)**
            *تـصـامـيـم سـيـنـمـائـيـة مـتـقـنـة.*

            ⚫ **قـسـم الاسـتـيـكـرات الـمـلكيـة (Royal Stickers)**
            *إضـافـات إبـداعـيـة مـبـتـكـرة.*

            🔵 **الـدعـم الـفـنـي الـمـبـاشـر (Technical Core)**
            *تـواصـل حـصـري مـع كـبـار الـمـسـؤولـيـن.*
            ━━━━━━━━━━━━━━━━━━━━━━
            
            *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
            `)
            .setColor("#FF0000")
            .setImage(serverIco)
            .setThumbnail(serverIco)
            .setFooter({ text: `Var Vat~ High Priority Protocol • 2026`, iconURL: serverIco });

        const selector = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('gate_selector_v6')
                .setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
                .addOptions([
                    { label: 'بوابة البنرات الفاخرة', value: 'v_banners', emoji: '🔴', description: 'تقديم طلب تصميم بنر سينمائي' },
                    { label: 'بوابة الاستيكرات الملكية', value: 'v_stickers', emoji: '⚫', description: 'تقديم طلب تصميم استيكر حصري' },
                    { label: 'بوابة الدعم الفني المباشر', value: 'v_support', emoji: '🔵', description: 'فتح قناة اتصال مع الإدارة العليا' },
                ])
        );

        await interaction.reply({ embeds: [mainPanel], components: [selector] });
    }

    // 2. بروتوكول المودال المطور
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_selector_v6') {
        const gate = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${gate}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        
        const field1 = new TextInputBuilder()
            .setCustomId('f_name').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setPlaceholder("أدخل اسمك هنا...").setRequired(true);

        const field2 = new TextInputBuilder()
            .setCustomId('f_data').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setPlaceholder("اشرح طلبك بالتفصيل لضمان سرعة التنفيذ...").setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(field1), new ActionRowBuilder().addComponents(field2));
        await interaction.showModal(modal);
    }

    // 3. إنشاء قناة التذكرة
    if (interaction.isModalSubmit()) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const gateType = interaction.customId.split('_')[1];
            const name = interaction.fields.getTextInputValue('f_name');
            const data = interaction.fields.getTextInputValue('f_data');
            
            let cfg = { color: "#FF0000", label: "Banner", staff: SUPREME_CORE.ADMIN_ROLES };
            if (gateType === 'v_stickers') cfg = { color: "#000000", label: "Sticker", staff: SUPREME_CORE.ADMIN_ROLES };
            if (gateType === 'v_support') cfg = { color: "#0080FF", label: "Technical", staff: [SUPREME_CORE.TECH_SUPPORT_ROLE] };

            const channel = await interaction.guild.channels.create({
                name: `🔱-${cfg.label}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...cfg.staff.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle(`🔱 بـوابـة الاتـصـال - ${cfg.label} 🔱`)
                .setDescription(`مرحباً بك ${interaction.user}، تم تفعيل قناتك بنجاح. فريق الإدارة بانتظارك.`)
                .addFields(
                    { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                    { name: "📝 الـاسـم", value: `> ${name}`, inline: true },
                    { name: "📄 الـمـلـف الـمُـقـدم", value: `\`\`\`text\n${data}\n\`\`\`` }
                )
                .setColor(cfg.color).setThumbnail(interaction.user.displayAvatarURL()).setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_v6').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_v6').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `<@&${cfg.staff[0]}>`, embeds: [welcome], components: [actionRow] });
            await interaction.followUp({ content: `✅ تم تفعيل القناة بنجاح: ${channel}`, ephemeral: true });
        } catch (e) { console.error(e); }
    }

    // 4. العمليات الإدارية (حصرياً للإدارة)
    if (interaction.isButton()) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً لاستخدام هذا الزر.", ephemeral: true });
        }

        if (interaction.customId === 'claim_v6') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تم تولي المهمة من قبل المسؤول: ${interaction.user}`)] });
            const cLog = client.channels.cache.get(SUPREME_CORE.CHANNELS.CLAIM);
            if (cLog) cLog.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_v6') {
            const ratingSelector = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_v6_final').setPlaceholder('🌟 تـقـيـيـم جـودة الـخدمـة...')
                    .addOptions([
                        { label: 'تقييم ملكي (5 نجوم)', value: '5', emoji: '⭐' },
                        { label: 'تقييم جيد (3 نجوم)', value: '3', emoji: '⭐' },
                        { label: 'تقييم غير مرضي (1 نجمة)', value: '1', emoji: '⭐' },
                    ])
            );
            await interaction.reply({ content: "يرجى تقييم الأداء لإتمام عملية الأرشفة النهائية:", components: [ratingSelector] });
        }
    }

    // 5. الأرشفة العمودية (Vertical Time-Line)
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_v6_final') {
        if (!isAuthorized(interaction.member)) return;
        const rating = interaction.values[0];
        const msgs = await interaction.channel.messages.fetch({ limit: 100 });
        const verticalTranscript = msgs.filter(m => !m.author.bot)
            .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`)
            .reverse().join('\n');

        const archiveEmbed = new EmbedBuilder()
            .setTitle("📂 مـلـف أرشـيـف الـتـذاكـر")
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.channel.name}`, inline: true },
                { name: "⭐ الـتـقـيـيـم", value: `> ${rating} نجوم`, inline: true },
                { name: "🔒 الـمـسـؤول", value: `> ${interaction.user.tag}`, inline: true }
            )
            .setColor("#FF0000").setTimestamp();

        const archiveChan = client.channels.cache.get(SUPREME_CORE.CHANNELS.ARCHIVE);
        const generalChan = client.channels.cache.get(SUPREME_CORE.CHANNELS.GENERAL);

        if (archiveChan) await archiveChan.send({ embeds: [archiveEmbed] });
        if (generalChan && verticalTranscript) await generalChan.send({ 
            content: `📜 **الـسـجـل الـرقـمـي لـلـتـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${verticalTranscript.slice(0, 1900)}\n\`\`\`` 
        });

        await interaction.reply("✅ تم تدوين السجل بنجاح، سيتم الحذف الآن...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
