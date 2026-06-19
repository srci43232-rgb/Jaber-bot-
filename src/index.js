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

// --- الهوية الرقمية والبيانات السيادية ---
const VAULT = {
    SERVER_ID: "1267986207569350709",
    OWNER_ID: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    TECH_COMMAND_ID: "1517120729559203931",
    CHANNELS: {
        CLAIM_LOGS: "1516441752716709970",
        SYSTEM_LOGS: "1516499096796664030",
        ARCHIVE_VAULT: "1516508105704214629",
        WELCOME_GATES: "1514696892246786089"
    }
};

// التحقق من السلطة الإدارية
const hasAuthority = (member) => {
    return VAULT.ADMIN_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === VAULT.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[SYSTEM] 🟢 Administrative Protocol Activated: ${client.user.tag}`);
    
    const commands = [{
        name: 'setup',
        description: 'تفعيل المنظومة الإدارية والبنل الرسمي للسيرفر'
    }];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] 🛡️ All Protocols Synchronized');
    } catch (e) { console.error('[FATAL ERROR] Registry Failed', e); }
});

// --- بروتوكول الترحيب الملكي ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(VAULT.CHANNELS.WELCOME_GATES);
    if (!channel) return;

    const welcome = new EmbedBuilder()
        .setAuthor({ name: `سجل الانضمام الإداري`, iconURL: member.guild.iconURL() })
        .setTitle(`◈ مـرحـبـاً بـك فـي عـالـم ${member.guild.name} ◈`)
        .setDescription(`
        > **نستقبلك اليوم كفرد جديد في عائلتنا الراقية.**
        > **نأمل لك رحلة مليئة بالإبداع والتميز.**

        **┏━━━━━━━━━━━━━━━━━━━━━━┓**
        **┃ 👤 الـمـنـضـم :** ${member}
        **┃ 🆔 الـهـويـة :** \`${member.id}\`
        **┃ 🔢 الـتـسلسـل :** \`#${member.guild.memberCount}\`
        **┗━━━━━━━━━━━━━━━━━━━━━━┛**
        `)
        .setColor("#FF0000")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage(member.guild.iconURL({ size: 1024 }))
        .setFooter({ text: `System Security • ${member.guild.name}`, iconURL: member.guild.iconURL() })
        .setTimestamp();

    await channel.send({ content: `**أهلاً بك ${member}**`, embeds: [welcome] });
});

// --- معالج التفاعلات المركزية ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. تشغيل المنظومة (The Imperial Panel)
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "⚠️ تحذير: لا تملك تصريح الدخول للمنظومة.", ephemeral: true });
        }

        const serverIco = interaction.guild.iconURL({ size: 1024 });
        
        const mainPanel = new EmbedBuilder()
            .setAuthor({ name: `Executive Management Center`, iconURL: serverIco })
            .setTitle(`◈ مـركـز الـنـخـبـة لـلـخـدمـات الـمـتـكـامـلـة ◈`)
            .setDescription(`
            **« بـروتوكول الـتـعـامـلات الـرسـمية »**
            
            مرحباً بك في المنصة الموحدة لطلب الخدمات في **${interaction.guild.name}**. 
            تم تصميم هذا النظام لضمان الدقة والسرعة في التنفيذ.
            
            ━━━━━━━━━━━━━━━━━━━━━━
            **💠 بـوابـات الـخـدمـة الـمـتـاحة :**
            
            🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
            *تـصـامـيـم احـتـرافـية بـمـعايـيـر عـالـمية.*

            ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
            *إضـافات فـريـدة تـنـبـض بـالإبـداع.*

            🔵 **الـدعـم الـفـنـي الـمـبـاشـر**
            *قـنـاة اتـصـال مـشـفـرة مـع الإدارة.*
            ━━━━━━━━━━━━━━━━━━━━━━
            
            *⚠️ يـلـزم اسـتـيـفـاء الـبـيـانـات الـتـالـية قـبـل فـتـح الـقـنـاة.*
            `)
            .setColor("#FF0000")
            .setImage(serverIco)
            .setThumbnail(serverIcon)
            .setFooter({ text: `${interaction.guild.name} | Security Protocol © 2026`, iconURL: serverIco });

        const selector = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('gate_selector')
                .setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
                .addOptions([
                    { label: 'بوابة البنرات', value: 'b_gate', emoji: '🔴', description: 'تقديم طلب تصميم بنر احترافي' },
                    { label: 'بوابة الاستيكرات', value: 's_gate', emoji: '⚫', description: 'تقديم طلب تصميم استيكر حصري' },
                    { label: 'بوابة الدعم الفني', value: 't_gate', emoji: '🔵', description: 'فتح قناة اتصال مع الإدارة العليا' },
                ])
        );

        await interaction.reply({ embeds: [mainPanel], components: [selector] });
    }

    // 2. بروتوكول المودال المطور
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_selector') {
        const gate = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${gate}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        
        const field1 = new TextInputBuilder()
            .setCustomId('f_name').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setPlaceholder("أدخل اسمك هنا...").setRequired(true);

        const field2 = new TextInputBuilder()
            .setCustomId('f_data').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setPlaceholder("اشرح طلبك بالتفصيل لضمان سرعة التنفيذ...").setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(field1), new ActionRowBuilder().addComponents(field2));
        await interaction.showModal(modal);
    }

    // 3. إنشاء قناة التذكرة بتنسيق إمبراطوري
    if (interaction.isModalSubmit()) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const gateType = interaction.customId.split('_')[1];
            const name = interaction.fields.getTextInputValue('f_name');
            const data = interaction.fields.getTextInputValue('f_data');
            
            let cfg = { color: "#FF0000", label: "Banner", staff: VAULT.ADMIN_ROLES };
            if (gateType === 's_gate') cfg = { color: "#000000", label: "Sticker", staff: VAULT.ADMIN_ROLES };
            if (gateType === 't_gate') cfg = { color: "#0080FF", label: "Support", staff: [VAULT.TECH_COMMAND_ID] };

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
                .setTitle(`🔱 بـوابـة الاتـصـال الـرسمية - ${cfg.label} 🔱`)
                .setDescription(`مرحباً بك ${interaction.user}، تم تفعيل قناتك بنجاح. فريق الإدارة بانتظارك.`)
                .addFields(
                    { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                    { name: "📝 الـاسـم", value: `> ${name}`, inline: true },
                    { name: "📄 الـمـلـف الـمُـقـدم", value: `\`\`\`text\n${data}\n\`\`\`` }
                )
                .setColor(cfg.color).setThumbnail(interaction.user.displayAvatarURL()).setTimestamp()
                .setFooter({ text: "Security Verification Passed" });

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `<@&${cfg.staff[0]}>`, embeds: [welcome], components: [actionRow] });
            await interaction.followUp({ content: `✅ تـم تـفـعـيـل الـقـنـاة: ${channel}`, ephemeral: true });
        } catch (e) { console.error(e); }
    }

    // 4. العمليات الإدارية (حصرياً للإدارة)
    if (interaction.isButton()) {
        if (!hasAuthority(interaction.member)) {
            return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً لاستخدام هذا الزر.", ephemeral: true });
        }

        if (interaction.customId === 'claim_btn') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تـم اسـتـلام الـتـذكـرة مـن قـبـل الـمـسـؤول: ${interaction.user}`)] });
            const cLog = client.channels.cache.get(VAULT.CHANNELS.CLAIM_LOGS);
            if (cLog) cLog.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_btn') {
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

    // 5. الأرشفة العمودية (The Grand Archive)
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_system') {
        if (!hasAuthority(interaction.member)) return;
        const rating = interaction.values[0];
        const msgs = await interaction.channel.messages.fetch({ limit: 100 });
        const verticalTranscript = msgs.filter(m => !m.author.bot)
            .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`)
            .reverse().join('\n');

        const archiveEmbed = new EmbedBuilder()
            .setTitle("📂 سـجـل الأرشـيـف الإداري")
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.channel.name}`, inline: true },
                { name: "⭐ الـتـقـيـيـم", value: `> ${rating} نجوم`, inline: true },
                { name: "🔒 الـمـسـؤول", value: `> ${interaction.user.tag}`, inline: true }
            )
            .setColor("#FF0000").setTimestamp();

        const archiveChan = client.channels.cache.get(VAULT.CHANNELS.ARCHIVE_VAULT);
        const generalChan = client.channels.cache.get(VAULT.CHANNELS.SYSTEM_LOGS);

        if (archiveChan) await archiveChan.send({ embeds: [archiveEmbed] });
        if (generalChan && verticalTranscript) await generalChan.send({ 
            content: `📜 **الـسـجـل الـرقـمـي لـلـتـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${verticalTranscript.slice(0, 1900)}\n\`\`\`` 
        });

        await interaction.reply("✅ تم تدوين السجل الإداري بنجاح، سيتم الحذف الآن...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
