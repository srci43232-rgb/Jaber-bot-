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

// وظيفة فحص السلطة الإدارية
const isAuthorized = (member) => {
    return SUPREME_CORE.ADMIN_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === SUPREME_CORE.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[SYSTEM] 🛡️ المتصل الآن: ${client.user.tag}`);
    
    const commands = [{
        name: 'setup',
        description: 'تفعيل المنصة الإدارية الفاخرة لمركز خدمات Var Vat~'
    }];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تسجيل جميع الأوامر بنجاح بدون أخطاء');
    } catch (e) { console.error('[ERROR]', e); }
});

// --- بروتوكول الترحيب الملكي ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(SUPREME_CORE.CHANNELS.WELCOME);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `سجل الانضمام الإداري`, iconURL: member.guild.iconURL() })
        .setTitle(`◈ مـرحـبـاً بـك فـي عـالـم ${member.guild.name} ◈`)
        .setDescription(`
        > **نستقبل اليوم عضواً جديداً في طليعة نخبتنا.**
        > **نأمل لك رحلة مليئة بالإبداع والتميز.**

        **┏━━━━━━━━━━━━━━━━━━━━━━┓**
        **┃ 👤 الـمـنـضـم :** ${member}
        **┃ 🆔 الـهـويـة :** \`${member.id}\`
        **┃ 🔢 الـعـضـو رَقـم :** \`#${member.guild.memberCount}\`
        **┗━━━━━━━━━━━━━━━━━━━━━━┛**
        `)
        .setColor("#FF0000")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage(member.guild.iconURL({ size: 1024 }))
        .setTimestamp();

    await channel.send({ content: `**أهلاً بك ${member}**`, embeds: [welcomeEmbed] });
});

// --- معالج التفاعلات المركزية ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر الاستخراج /setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const serverIco = interaction.guild.iconURL({ size: 1024, dynamic: true });
        
        const mainPanel = new EmbedBuilder()
            .setAuthor({ name: `Executive Management Center`, iconURL: serverIco })
            .setTitle(`◈ مـركـز الـنـخـبـة لـلـخـدمـات الـحـصـريـة ◈`)
            .setDescription(`
            **« بـروتوكول الـتـعـامـلات الـرسـمية »**
            
            مرحباً بك في المنصة الموحدة لطلب الخدمات في **${interaction.guild.name}**. 
            تم تصميم هذا النظام لضمان الدقة والسرعة في التنفيذ تحت إشراف الإدارة العليا.
            
            ━━━━━━━━━━━━━━━━━━━━━━
            **💠 بـوابـات الـخـدمـة الـمـتـاحة :**
            
            🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
            *تـصـامـيـم احـتـرافـية بـمـعايـيـر عـالـمية.*

            ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
            *إضـافات فـريـدة تـنـبـض بـالإبـداع.*

            🔵 **بـوابـة الـدعـم الـفـنـي الـمـبـاشـر**
            *قـنـاة اتـصـال مـشـفـرة مـع الإدارة.*
            ━━━━━━━━━━━━━━━━━━━━━━
            
            *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
            `)
            .setColor("#FF0000")
            .setImage(serverIco)
            .setFooter({ text: `Security Protocol • 2026`, iconURL: serverIco });

        const selector = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('gate_selector')
                .setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
                .addOptions([
                    { label: 'بوابة البنرات', value: 'v_banners', emoji: '🔴' },
                    { label: 'بوابة الاستيكرات', value: 'v_stickers', emoji: '⚫' },
                    { label: 'بوابة الدعم الفني', value: 'v_support', emoji: '🔵' },
                ])
        );

        await interaction.reply({ embeds: [mainPanel], components: [selector] });
    }

    // 2. بروتوكول المودال
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_selector') {
        const gate = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${gate}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        
        const f1 = new TextInputBuilder().setCustomId('f_name').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true);
        const f2 = new TextInputBuilder().setCustomId('f_data').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(f1), new ActionRowBuilder().addComponents(f2));
        await interaction.showModal(modal);
    }

    // 3. إنشاء قناة التذكرة
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_')) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const gateType = interaction.customId.split('_')[1];
            const name = interaction.fields.getTextInputValue('f_name');
            const data = interaction.fields.getTextInputValue('f_data');
            
            let cfg = { color: "#FF0000", label: "Banner", staff: SUPREME_CORE.ADMIN_ROLES, e: "🔴" };
            if (gateType === 'v_stickers') cfg = { color: "#000000", label: "Sticker", staff: SUPREME_CORE.ADMIN_ROLES, e: "⚫" };
            if (gateType === 'v_support') cfg = { color: "#0080FF", label: "Technical", staff: [SUPREME_CORE.TECH_SUPPORT_ROLE], e: "🔵" };

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
                .setTitle(`${cfg.e} مـذكـرة الـخـدمـة: ${cfg.label}`)
                .setDescription(`مرحباً بك ${interaction.user}، تم تفعيل قناتك بنجاح. فريق الإدارة بانتظارك.`)
                .addFields(
                    { name: "👤 الـعمـيل", value: `> ${interaction.user.tag}`, inline: true },
                    { name: "📝 الـاسم", value: `> ${name}`, inline: true },
                    { name: "📄 الـمـلف الـمُـقـدم", value: `\`\`\`text\n${data}\n\`\`\`` }
                )
                .setColor(cfg.color).setThumbnail(interaction.user.displayAvatarURL()).setFooter({ text: `Creator ID: ${interaction.user.id}` });

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_v8').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_v8').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `<@&${cfg.staff[0]}>`, embeds: [welcome], components: [actionRow] });
            await interaction.followUp({ content: `✅ تـم تـفـعـيـل الـقـنـاة: ${channel}`, ephemeral: true });
        } catch (e) { console.error(e); }
    }

    // 4. العمليات الإدارية (Buttons)
    if (interaction.isButton()) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً لاستخدام هذا الزر.", ephemeral: true });
        }

        // --- تحديث: الاستلام داخل التذكرة فقط وبدون لوج خارجي ---
        if (interaction.customId === 'claim_v8') {
            const claimEmbed = new EmbedBuilder()
                .setAuthor({ name: "تـحـديث بـروتوكول الـتـذكرة", iconURL: interaction.guild.iconURL() })
                .setDescription(`
                > **تـم تـولـي الـمـهـمة بـنجاح.**
                > **تـذكرتـك الآن تـحـت إشـراف الـمـسـؤول الـمُـبـاشر.**
                
                **🛡️ الـمـسـؤول الـمُـكـلف:** ${interaction.user}
                `)
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter({ text: "Luxury Management System", iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [claimEmbed] });
        }

        if (interaction.customId === 'close_v8') {
            const embed = interaction.message.embeds[0];
            const ownerID = embed.footer.text.replace('Creator ID: ', '');

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId(`rate_${ownerID}`).setPlaceholder('🌟 (للعضو فقط) قيم مستوى الخدمة...')
                    .addOptions([
                        { label: 'تقييم ملكي (5 نجوم)', value: '5', emoji: '⭐' },
                        { label: 'تقييم جيد (3 نجوم)', value: '3', emoji: '⭐' },
                        { label: 'تقييم غير مرضي (1 نجمة)', value: '1', emoji: '⭐' },
                    ])
            );
            await interaction.reply({ content: `📢 **بانتظار تقييم العضو <@${ownerID}> لإتمام الإغلاق...**`, components: [row] });
        }

        if (interaction.customId === 'save_v8') {
            await interaction.reply("⏳ جاري تسجيل الأرشيف العمودي...");
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = msgs.filter(m => !m.author.bot)
                .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`)
                .reverse().join('\n');

            const archEmbed = new EmbedBuilder().setTitle("📂 مـلـف أرشـيـف").setColor("#FF0000")
                .addFields(
                    { name: "التذكرة", value: interaction.channel.name, inline: true },
                    { name: "بواسطة", value: interaction.user.tag, inline: true }
                ).setTimestamp();

            const aC = client.channels.cache.get(SUPREME_CORE.CHANNELS.ARCHIVE);
            const gC = client.channels.cache.get(SUPREME_CORE.CHANNELS.GENERAL);

            if (aC) await aC.send({ embeds: [archEmbed] });
            if (gC && transcript) await gC.send({ content: `📜 **سـجل تـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
        }
    }

    // 5. التقييم (العضو فقط) وحفظ التذكرة
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('rate_')) {
        const ownerID = interaction.customId.split('_')[1];
        if (interaction.user.id !== ownerID) return interaction.reply({ content: "❌ هذا التقييم مخصص لصاحب التذكرة فقط!", ephemeral: true });

        const rating = interaction.values[0];
        const finalRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('save_v8').setLabel('💾 تسجيل وأرشفة التذكرة (للإدارة)').setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ 
            content: `✅ **تـم استلام تـقييم الـعضـو: ${rating}/5 ⭐**\nيـرجى مـن الـمـسؤول الضـغط لـلأرشفـة والـحذف.`, 
            components: [finalRow] 
        });
    }
});

client.login(process.env.TOKEN);
