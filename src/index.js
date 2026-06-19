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

// --- قاعدة بيانات النظام (تأكد من صحة التوكن في الاستضافة) ---
const CONFIG = {
    TOKEN: process.env.TOKEN,
    SERVER_ID: "1267986207569350709",
    OWNER_ID: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    LOGS: {
        CLAIM: "1516441752716709970",
        GENERAL: "1516499096796664030",
        ARCHIVE: "1516508105704214629",
        WELCOME: "1514696892246786089"
    }
};

// فحص الصلاحيات الإدارية
const isStaff = (member) => {
    return CONFIG.ADMIN_ROLES.some(roleId => member.roles.cache.has(roleId)) || 
           member.id === CONFIG.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[LOG] Connected as ${client.user.tag}`);
    const commands = [{ name: 'setup', description: 'تثبيت المنظومة الإدارية المتكاملة لخدمات السيرفر' }];
    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[LOG] Commands Registered Successfully');
    } catch (err) { console.error(err); }
});

// --- نظام الترحيب الملكي ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(CONFIG.LOGS.WELCOME);
    if (!channel) return;
    const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `انضمام نخبة جديدة`, iconURL: member.guild.iconURL() })
        .setTitle(`✧ مرحباً بك في مـجـتـمـع ${member.guild.name} ✧`)
        .setDescription(`> **أنرتَ بـانـضـمـامـك إلـى نـخـبـة سـيرفـرنـا الـراقي.**\n\n**👤 العضو:** ${member}\n**🆔 الهوية:** \`${member.id}\`\n**🔢 الترتيب:** \`#${member.guild.memberCount}\``)
        .setColor("#FF0000")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage(member.guild.iconURL({ size: 1024 }))
        .setTimestamp();
    channel.send({ content: `|| ${member} ||`, embeds: [welcomeEmbed] });
});

client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر الاستخراج /setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTitle(`♛ الـمـركـز الإداري لـلـخـدمـات الـحـصـريـة ♛`)
            .setDescription(`
            **« بـروتوكول خـدمـة الـعـملاء »**
            
            مرحباً بك في الوجهة الرسمية لطلب الخدمات. 
            يرجى اختيار القسم المناسب من القائمة بالأسفل لبدء الإجراءات.
            
            ━━━━━━━━━━━━━━━━━━━━━━
            **💠 بـوابـات الـخـدمـة الـمـتـاحة :**
            
            🔴 **قـسـم الـبـنـرات الـفـاخـرة**
            *تـصـامـيـم سـيـنـمـائـيـة مـتـقـنـة.*

            ⚫ **قـسـم الاسـتـيـكـرات الـمـلكيـة**
            *إضـافـات إبـداعـيـة مـبـتـكـرة.*

            🔵 **الـدعـم الـفـنـي الـمـبـاشـر**
            *تـواصـل حـصـري ومـشـفـر مـع كـبـار الـمـسـؤولـيـن.*
            ━━━━━━━━━━━━━━━━━━━━━━
            
            *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
            `)
            .setColor("#FF0000")
            .setImage(interaction.guild.iconURL({ size: 1024 }))
            .setFooter({ text: `Security System • 2026`, iconURL: interaction.guild.iconURL() });

        const selector = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('gate_selector')
                .setPlaceholder('🔱 قـم بـاخـتـيـار بـوابـة الـخـدمـة...')
                .addOptions([
                    { label: 'بوابة البنرات', value: 'gate_banners', emoji: '🔴' },
                    { label: 'بوابة الاستيكرات', value: 'gate_stickers', emoji: '⚫' },
                    { label: 'بوابة الدعم الفني', value: 'gate_support', emoji: '🔵' },
                ])
        );
        await interaction.reply({ embeds: [mainEmbed], components: [selector] });
    }

    // 2. المودال (البيانات الإلزامية)
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_selector') {
        const gate = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${gate}`).setTitle('🛡️ بـروتوكول الـتـحـقق');
        
        const f1 = new TextInputBuilder().setCustomId('name').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true);
        const f2 = new TextInputBuilder().setCustomId('data').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(f1), new ActionRowBuilder().addComponents(f2));
        await interaction.showModal(modal);
    }

    // 3. إنشاء قناة التذكرة
    if (interaction.isModalSubmit()) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const gateType = interaction.customId.split('_')[1];
            const uName = interaction.fields.getTextInputValue('name');
            const uData = interaction.fields.getTextInputValue('data');
            
            let s = { color: "#FF0000", label: "Banner", staff: CONFIG.ADMIN_ROLES };
            if (gateType === 'gate_stickers') s = { color: "#000000", label: "Sticker", staff: CONFIG.ADMIN_ROLES };
            if (gateType === 'gate_support') s = { color: "#0080FF", label: "Technical", staff: [CONFIG.ADMIN_ROLES[0]] };

            const channel = await interaction.guild.channels.create({
                name: `🔱-${s.label}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...s.staff.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle(`🔱 بـوابـة الاتـصـال - ${s.label} 🔱`)
                .setDescription(`مرحباً بك ${interaction.user}، فريق الإدارة بانتظارك.`)
                .addFields(
                    { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                    { name: "📝 الـاسـم", value: `> ${uName}`, inline: true },
                    { name: "📄 الـمـلـف الـمُـقـدم", value: `\`\`\`text\n${uData}\n\`\`\`` }
                )
                .setColor(s.color).setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('close_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `<@&${s.staff[0]}>`, embeds: [welcome], components: [actionRow] });
            await interaction.followUp({ content: `✅ تم فتح القناة: ${channel}`, ephemeral: true });
        } catch (e) { console.error(e); }
    }

    // 4. أزرار الإدارة (الاستلام والإغلاق)
    if (interaction.isButton()) {
        if (!isStaff(interaction.member)) return interaction.reply({ content: "❌ للمسؤولين فقط", ephemeral: true });

        if (interaction.customId === 'claim_btn') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تم الاستلام بواسطة: ${interaction.user}`)] });
            const cLog = client.channels.cache.get(CONFIG.LOGS.CLAIM);
            if (cLog) cLog.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_btn') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_sys').setPlaceholder('🌟 تـقـيـيـم جـودة الـخدمـة...')
                    .addOptions([
                        { label: '5 نجوم', value: '5', emoji: '⭐' },
                        { label: '3 نجوم', value: '3', emoji: '⭐' },
                        { label: '1 نجمة', value: '1', emoji: '⭐' },
                    ])
            );
            await interaction.reply({ content: "يرجى التقييم للأرشفة النهائية:", components: [row] });
        }
    }

    // 5. الأرشفة العمودية (Transcript)
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_sys') {
        if (!isStaff(interaction.member)) return;
        const rating = interaction.values[0];
        const msgs = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = msgs.filter(m => !m.author.bot)
            .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`)
            .reverse().join('\n');

        const arch = new EmbedBuilder()
            .setTitle("📂 مـلـف أرشـيـف الـتـذاكـر")
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.channel.name}`, inline: true },
                { name: "⭐ الـتـقـيـيـم", value: `> ${rating} نجوم`, inline: true },
                { name: "🔒 الـمـسـؤول", value: `> ${interaction.user.tag}`, inline: true }
            )
            .setColor("#FF0000").setTimestamp();

        const aC = client.channels.cache.get(CONFIG.LOGS.ARCHIVE);
        const gC = client.channels.cache.get(CONFIG.LOGS.GENERAL);

        if (aC) await aC.send({ embeds: [arch] });
        if (gC) await gChanSend(gC, interaction.channel.name, transcript);

        await interaction.reply("✅ تم تدوين السجل، سيتم الحذف الآن...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

async function gChanSend(chan, name, text) {
    if (chan) await chan.send({ content: `📜 **سجل تذكرة (${name}):**\n\`\`\`text\n${text.slice(0, 1900)}\n\`\`\`` });
}

client.login(process.env.TOKEN);
