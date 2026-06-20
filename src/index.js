const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, PermissionsBitField, ChannelType, REST, Routes, ActivityType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences
    ]
});

// --- قاعدة البيانات الملكية لـ Var Vat~ ---
const CORE = {
    TOKEN: process.env.TOKEN, 
    SERVER_ID: "1267986207569350709",
    CATEGORY_ID: "1516441715870007509", 
    OWNER_ID: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    CHANNELS: {
        CLAIM: "1516441752716709970",
        LOGS: "1516499096796664030",
        ARCHIVE: "1516508105704214629",
        WELCOME: "1514696892246786089"
    },
    ASSETS: {
        COLOR: "#FF0000",
        GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // رابط الـ GIF الفخم
    }
};

// وظيفة التحقق من السلطة الإدارية
const hasAuth = (member) => {
    return CORE.ADMIN_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === CORE.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    client.user.setPresence({ status: 'dnd', activities: [{ name: 'Var Vat~ Management', type: ActivityType.Watching }] });
    console.log(`[SYSTEM] 🛡️ البروتوكول الملكي متصل: ${client.user.tag}`);
    
    const commands = [
        { name: 'setup', description: 'تثبيت المنظومة الإدارية والبنل الرسمي لسيرفر Var Vat~' },
        { name: 'clear', description: 'تطهير الشات من الرسائل', options: [{ name: 'amount', description: 'عدد الرسائل', type: 4, required: true }] },
        { name: 'timeout', description: 'تقييد عضو إدارياً', options: [{ name: 'user', description: 'العضو', type: 6, required: true }, { name: 'minutes', description: 'المدة بالدقائق', type: 4, required: true }] }
    ];

    const rest = new REST({ version: '10' }).setToken(CORE.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] ✅ تمت مزامنة الأوامر بنجاح');
    } catch (e) { console.error(e); }
});

// --- الترحيب الإمبراطوري ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(CORE.CHANNELS.WELCOME);
    if (!channel) return;
    const welcomeEmbed = new EmbedBuilder()
        .setTitle(`✧ مـرحـبـاً بـك فـي ديـوان ${member.guild.name} ✧`)
        .setDescription(`> **نستقبل اليوم عضواً جديداً في طليعة نخبتنا.**\n\n**👤 الـعـضـو:** ${member}\n**🆔 الـهـويـة:** \`${member.id}\`\n**🔢 الـتـسلسـل:** \`#${member.guild.memberCount}\``)
        .setColor(CORE.ASSETS.COLOR).setThumbnail(member.user.displayAvatarURL({ dynamic: true })).setImage(CORE.ASSETS.GIF).setTimestamp();
    channel.send({ content: `**أهلاً بك ${member}**`, embeds: [welcomeEmbed] });
});

// --- معالجة التفاعلات ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر Setup
    if (interaction.isChatInputCommand()) {
        if (!hasAuth(interaction.member)) return interaction.reply({ content: "⚠️ للإدارة فقط.", ephemeral: true });
        
        if (interaction.commandName === 'setup') {
            const serverIco = interaction.guild.iconURL({ size: 1024, dynamic: true });
            const mainPanel = new EmbedBuilder()
                .setAuthor({ name: `Imperial Management • Var Vat~`, iconURL: serverIco })
                .setTitle(`♛ مـنـصـة الـنـخـبـة لـلـخـدمـات الـمـتـكـامـلـة ♛`)
                .setDescription(`
                **« بـروتوكول خـدمـة الـمـواطـنين الرسمي »**
                
                مرحباً بك في الوجهة الرسمية والوحيدة لطلب الخدمات في **Var Vat~**.
                تم تصميم هذا النظام لضمان الدقة والسرعة في التنفيذ تحت إشراف الإدارة العليا.
                
                ━━━━━━━━━━━━━━━━━━━━━━
                **💠 بـوابـات الـخـدمـة الـرئيسية :**
                
                🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
                *تـصـامـيـم سـيـنـمـائـيـة تـخـطف الأنـظار.*

                ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
                *إضـافات إبـداعيـة تـنـبـض بـالـتميز.*

                🔵 **بـوابـة الـدعـم الـفـنـي الـمـبـاشـر**
                *تـواصـل حـصـري ومـشـفـر مـع الـمـسـؤولـيـن.*
                ━━━━━━━━━━━━━━━━━━━━━━
                
                *⚠️ يـلـزم اسـتـيفاء بـروتوكول الـبـيـانات في الـخطوة القادمة لـتـفـعـيـل الـطلب.*
                `)
                .setColor(CORE.ASSETS.COLOR).setImage(CORE.ASSETS.GIF).setThumbnail(serverIco)
                .setFooter({ text: `Var Vat~ High Priority Protocol • 2026` });

            const selector = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('gate_select_v10').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
                    .addOptions([
                        { label: 'بوابة البنرات', value: 'banners', emoji: '🔴' },
                        { label: 'بوابة الاستيكرات', value: 'stickers', emoji: '⚫' },
                        { label: 'بوابة الدعم الفني', value: 'support', emoji: '🔵' },
                    ])
            );
            return interaction.reply({ embeds: [mainPanel], components: [selector] });
        }

        if (interaction.commandName === 'clear') {
            await interaction.channel.bulkDelete(interaction.options.getInteger('amount'));
            return interaction.reply({ content: "✅ تم التطهير.", ephemeral: true });
        }
    }

    // 2. المودال (الرد الفوري لمنع التعليق)
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_select_v10') {
        const type = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`mod_${type}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fn').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder("أدخل اسمك هنا...")),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fd').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder("اشرح طلبك بالتفصيل لضمان سرعة التنفيذ..."))
        );
        return interaction.showModal(modal); // الرد المباشر هنا يمنع الـ Thinking
    }

    // 3. إنشاء التذكرة
    if (interaction.isModalSubmit() && interaction.customId.startsWith('mod_')) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const n = interaction.fields.getTextInputValue('fn');
        const d = interaction.fields.getTextInputValue('fd');
        
        let s = { c: "#FF0000", l: "Banner", r: CORE.ADMIN_ROLES, e: "🔴" };
        if (type === 'stickers') s = { c: "#000000", l: "Sticker", r: CORE.ADMIN_ROLES, e: "⚫" };
        if (type === 'support') s = { c: "#0080FF", l: "Support", r: [CORE.ADMIN_ROLES[0]], e: "🔵" };

        try {
            const channel = await interaction.guild.channels.create({
                name: `🔱-${s.l}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: CORE.CATEGORY_ID,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    ...s.r.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle(`${s.e} مـذكـرة خـدمـة: ${s.l}`)
                .setDescription(`مرحباً بك ${interaction.user}، تم تفعيل قناتك بنجاح. فريق الإدارة بانتظارك.`)
                .addFields(
                    { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                    { name: "📝 الـاسـم", value: `> ${n}`, inline: true },
                    { name: "📄 الـمـلـف", value: `\`\`\`text\n${d}\n\`\`\`` }
                )
                .setColor(s.c).setThumbnail(interaction.user.displayAvatarURL()).setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_v10').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_v10').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `<@&${s.r[0]}>`, embeds: [welcome], components: [actionRow] });
            return interaction.followUp({ content: `✅ تم تفعيل بوابتك: ${channel}`, ephemeral: true });
        } catch (err) { console.error(err); }
    }

    // 4. أزرار الإدارة
    if (interaction.isButton()) {
        if (!hasAuth(interaction.member)) return interaction.reply({ content: "❌ عذراً، هذا الإجراء للإدارة فقط.", ephemeral: true });

        if (interaction.customId === 'claim_v10') {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تم استلام المهمة بواسطة: ${interaction.user}`)] });
        }

        if (interaction.customId === 'close_v10') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_v10').setPlaceholder('🌟 تقييم الجودة (للإدارة)...')
                    .addOptions([{ label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' }, { label: 'ضعيف ⭐', value: '1' }])
            );
            return interaction.reply({ content: "يرجى التقييم قبل الحفظ النهائي:", components: [row] });
        }

        if (interaction.customId === 'save_v10') {
            await interaction.reply("⏳ جاري تسجيل الأرشيف العمودي...");
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = msgs.filter(m => !m.author.bot)
                .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`).reverse().join('\n');

            const archEmbed = new EmbedBuilder().setTitle("📂 مـلـف أرشـيـف").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "المسؤول", value: interaction.user.tag, inline: true }).setTimestamp();

            const aC = client.channels.cache.get(CORE.CHANNELS.ARCHIVE);
            const gC = client.channels.cache.get(CORE.CHANNELS.LOGS);

            if (aC) await aC.send({ embeds: [archEmbed] });
            if (gC && transcript) await gC.send({ content: `📜 **سـجل تـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_v10') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('save_v10').setLabel('💾 تسجيل وحفظ (إدارة)').setStyle(ButtonStyle.Primary));
        await interaction.update({ content: `✅ تـم الـتـقـيـيـم. للمسؤول: إضـغط لـلأرشفة والـحـذف.`, components: [row] });
    }
});

client.login(CORE.TOKEN);
