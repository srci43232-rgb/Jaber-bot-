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

// --- قاعدة بيانات المنظومة الإدارية ---
const PROTOCOL = {
    SERVER: "1267986207569350709",
    ROLES: {
        OWNER: "1516441623662170172",
        ADMINS: ["1517120729559203931", "1516441626384269343"],
        TECH_STAFF: "1517120729559203931"
    },
    CHANNELS: {
        CLAIM: "1516441752716709970",
        GENERAL_LOG: "1516499096796664030",
        ARCHIVE: "1516508105704214629",
        WELCOME: "1514696892246786089"
    },
    ASSETS: {
        // ضع رابط الـ GIF الفخم هنا
        MAIN_GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png",
        COLOR_HEX: "#E31212" // أحمر لامع
    }
};

// فحص الصلاحيات الإدارية
const isManagement = (member) => {
    return PROTOCOL.ROLES.ADMINS.some(id => member.roles.cache.has(id)) || 
           member.id === PROTOCOL.ROLES.OWNER || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[CORE] System Online: ${client.user.tag}`);
    const commands = [{ name: 'setup', description: 'تفعيل المنصة الإدارية الفاخرة لـ Var Vat~' }];
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[CORE] All protocols registered successfully.');
    } catch (e) { console.error('[ERROR] Deployment failed:', e); }
});

// --- بروتوكول الترحيب الملكي ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(PROTOCOL.CHANNELS.WELCOME);
    if (!channel) return;
    const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `سجل الدخول الرسمي`, iconURL: member.guild.iconURL() })
        .setTitle(`✧ أهلاً بك في فضاء ${member.guild.name} ✧`)
        .setDescription(`> **نعتز بانضمامك لمنظومتنا الراقية.**\n> **أنت الآن العضو رقم \`#${member.guild.memberCount}\` في مجتمعنا.**`)
        .setColor(PROTOCOL.ASSETS.COLOR_HEX)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage(PROTOCOL.ASSETS.MAIN_GIF)
        .setTimestamp();
    channel.send({ content: `|| ${member} ||`, embeds: [welcomeEmbed] });
});

client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر الاستخراج /setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: `Var Vat~ Central Command`, iconURL: interaction.guild.iconURL() })
            .setTitle(`♛ الـمـنـصـة الإداريـة الـعـلـيـا لـلـخـدمـات ♛`)
            .setDescription(`
            **تـرحـب بـكـم إدارة ${interaction.guild.name}**
            *نـحـن هـنـا لـنـرسـم الإبـداع ونـصـنـع الـتـمـيـز.*

            ━━━━━━━━━━━━━━━━━━━━━━
            **💠 بـوابـات الـتـعـامـل الـرسـمـيـة :**
            
            🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
            *تـصـامـيـم سـيـنـمـائـيـة تـخـطـف الأنـظـار.*

            ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
            *إضـافـات إبـداعـيـة لـهـويتـك الـخـاصـة.*

            🔵 **الـدعـم الـفـنـي الـمـبـاشـر**
            *قـنـاة اتـصـال مـشـفـرة مـع كـبـار الـمـسـؤولـيـن.*
            ━━━━━━━━━━━━━━━━━━━━━━
            
            *⚠️ يـرجى الـتـوجـه للـقـائـمة أدناه لإتـمـام بـروتـوكول الـبـيـانات.*
            `)
            .setColor(PROTOCOL.ASSETS.COLOR_HEX)
            .setImage(PROTOCOL.ASSETS.MAIN_GIF)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: `Security Level: High Priority • 2026` });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('gate_v5').setPlaceholder('🔱 قـم بـاخـتـيـار بـوابـة الـخـدمـة...')
                .addOptions([
                    { label: 'بوابة البنرات', value: 'g_banner', emoji: '🔴', description: 'طلب تصميم بنر احترافي' },
                    { label: 'بوابة الاستيكرات', value: 'g_sticker', emoji: '⚫', description: 'طلب استيكر حصري' },
                    { label: 'بوابة الدعم الفني', value: 'g_support', emoji: '🔵', description: 'تواصل مباشر مع الإدارة' },
                ])
        );
        await interaction.reply({ embeds: [mainEmbed], components: [row] });
    }

    // 2. المودال المطور
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_v5') {
        const modal = new ModalBuilder().setCustomId(`mod_${interaction.values[0]}`).setTitle('🛡️ بـروتوكول الـتـحـقـق');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('f1').setLabel("الاسـم الـرسمـي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('f2').setLabel("تـفاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    // 3. إنشاء التذكرة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const n = interaction.fields.getTextInputValue('f1');
        const d = interaction.fields.getTextInputValue('f2');
        
        let s = { c: "#FF0000", l: "Banner", r: PROTOCOL.ROLES.ADMINS };
        if (type === 'g_sticker') s = { c: "#000000", l: "Sticker", r: PROTOCOL.ROLES.ADMINS };
        if (type === 'g_support') s = { c: "#0080FF", l: "Technical", r: [PROTOCOL.ROLES.TECH_STAFF] };

        const chan = await interaction.guild.channels.create({
            name: `🔱-${s.l}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                ...s.r.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder()
            .setTitle(`🔱 بـوابـة الـخـدمـة: ${s.l} 🔱`)
            .setDescription(`مرحباً بك ${interaction.user}، طلبك قيد المراجعة الإدارية.`)
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📝 الـاسـم", value: `> ${n}`, inline: true },
                { name: "📄 الـمـلف الـمُـقـدم", value: `\`\`\`text\n${d}\n\`\`\`` }
            )
            .setColor(s.c).setThumbnail(interaction.user.displayAvatarURL());

        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('c_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('d_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await chan.send({ content: `<@&${s.r[0]}>`, embeds: [welcome], components: [btns] });
        await interaction.followUp({ content: `✅ تم تفعيل القناة: ${chan}`, ephemeral: true });
    }

    // 4. الأزرار (الإدارة فقط)
    if (interaction.isButton()) {
        if (!isManagement(interaction.member)) return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً.", ephemeral: true });

        if (interaction.customId === 'c_btn') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تـم اسـتـلام الـتـذكـرة مـن قـبـل الـمـسـؤول: ${interaction.user}`)] });
            const cL = client.channels.cache.get(PROTOCOL.CHANNELS.CLAIM);
            if (cL) cL.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'd_btn') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('r_sys').setPlaceholder('🌟 تـقـيـيـم جـودة الـخدمـة...')
                    .addOptions([{ label: '5 نجوم', value: '5', emoji: '⭐' }, { label: '3 نجوم', value: '3', emoji: '⭐' }, { label: '1 نجمة', value: '1', emoji: '⭐' }])
            );
            await interaction.reply({ content: "يرجى التقييم للأرشفة:", components: [row] });
        }
    }

    // 5. الأرشفة العمودية (The Vertical Archive)
    if (interaction.isStringSelectMenu() && interaction.customId === 'r_sys') {
        if (!isManagement(interaction.member)) return;
        const rating = interaction.values[0];
        const msgs = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = msgs.filter(m => !m.author.bot)
            .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`)
            .reverse().join('\n');

        const arch = new EmbedBuilder()
            .setTitle("📂 مـلـف أرشـيـف الإدارة")
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.channel.name}`, inline: true },
                { name: "⭐ الـتـقـيـيـم", value: `> ${rating} نجوم`, inline: true },
                { name: "🔒 الـمـسـؤول", value: `> ${interaction.user.tag}`, inline: true }
            )
            .setColor(PROTOCOL.ASSETS.COLOR_HEX).setTimestamp();

        const aC = client.channels.cache.get(PROTOCOL.CHANNELS.ARCHIVE);
        const gC = client.channels.cache.get(PROTOCOL.CHANNELS.GENERAL_LOG);

        if (aC) await aC.send({ embeds: [arch] });
        if (gC && transcript) await gC.send({ 
            content: `📜 **الـسـجـل الـرقـمـي لـلـتـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` 
        });

        await interaction.reply("✅ تم تدوين السجل الإداري بنجاح، سيتم الحذف الآن...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
