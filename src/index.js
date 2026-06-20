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

// --- قاعدة البيانات السيادية (Var Vat~) ---
const VAULT = {
    TOKEN: process.env.TOKEN, 
    SERVER_ID: "1267986207569350709",
    CATEGORY_ID: "1516441715870007509", 
    OWNER_ID: "1516441623662170172",
    STAFF_ROLES: ["1517120729559203931", "1516441626384269343"],
    CHANNELS: {
        CLAIM: "1516441752716709970",
        LOGS: "1516499096796664030",
        ARCHIVE: "1516508105704214629",
        WELCOME: "1514696892246786089"
    },
    ASSETS: {
        COLOR: "#FF0000", // أحمر لامع
        // ملاحظة: تأكد من استبدال الرابط أدناه برابط الـ GIF الذي نسخته من ديسكورد
        GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" 
    }
};

// وظيفة فحص السيادة الإدارية
const hasAuth = (member) => {
    return VAULT.STAFF_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === VAULT.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    // ضبط لمبة الاتصال (اللون الأحمر - Do Not Disturb)
    client.user.setPresence({
        status: 'dnd', 
        activities: [{ name: 'Var Vat~ Management', type: ActivityType.Watching }]
    });

    console.log(`[SYSTEM] 🛡️ البروتوكول الملكي متصل: ${client.user.tag}`);
    
    const commands = [
        { name: 'setup', description: 'تثبيت المنظومة الإدارية والبنل الرسمي لخدمات السيرفر' },
        { 
            name: 'clear', 
            description: 'تطهير الشات من الرسائل العالقة', 
            options: [{ name: 'amount', description: 'عدد الرسائل', type: 4, required: true }] 
        },
        {
            name: 'timeout',
            description: 'تقييد عضو إدارياً (تايم أوت)',
            options: [
                { name: 'user', description: 'العضو المستهدف', type: 6, required: true },
                { name: 'minutes', description: 'المدة بالدقائق', type: 4, required: true }
            ]
        }
    ];

    const rest = new REST({ version: '10' }).setToken(VAULT.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] ✅ تمت مزامنة كافة البروتوكولات الإدارية');
    } catch (e) { console.error(e); }
});

// --- البنل الرئيسي (قمة الفخامة) ---
async function sendLuxuryPanel(channel) {
    const serverIco = channel.guild.iconURL({ size: 1024, dynamic: true });
    
    const mainPanel = new EmbedBuilder()
        .setAuthor({ name: `Imperial Management Hub | Var Vat~`, iconURL: serverIco })
        .setTitle(`♛ الـمـنـصـة الإداريـة الـعـلـيـا لـلـخـدمـات ♛`)
        .setDescription(`
        **« بـروتوكول الـتـعـامـلات الـرسمية »**
        
        مرحباً بك في الوجهة الرسمية والوحيدة لطلب الخدمات في **Var Vat~**. 
        لقد تم تصميم هذه المنصة لضمان تنفيذ طلباتكم بأرقى معايير الاحترافية تحت إشراف الإدارة العليا.
        
        ━━━━━━━━━━━━━━━━━━━━━━
        **💠 بـوابـات الـخـدمـة الـرئيسية :**
        
        🔴 **بـوابـة الـبـنـرات الـفـاخـرة (Elite Banners)**
        *تـصـامـيـم سـيـنـمـائـيـة تـخـطف الأنـظار.*

        ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة (Royal Stickers)**
        *إضـافات إبـداعيـة تـنـبـض بـالـتميز.*

        🔵 **بـوابـة الـدعـم الـفـنـي الـمـبـاشـر (Technical Core)**
        *تـواصـل حـصـري ومـشـفـر مـع كـبـار الـمـسـؤولـيـن.*
        ━━━━━━━━━━━━━━━━━━━━━━
        
        *⚠️ يـلـزم اسـتـيفاء بـروتوكول الـبـيـانات في الـخطوة القادمة لـتـفـعـيـل الـطلب.*
        `)
        .setColor(VAULT.ASSETS.COLOR)
        .setImage(VAULT.ASSETS.GIF)
        .setThumbnail(serverIco)
        .setFooter({ text: "Security & Services Protocol • 2026", iconURL: serverIco })
        .setTimestamp();

    const selector = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('gate_select').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
            .addOptions([
                { label: 'بوابة البنرات', value: 'banners', emoji: '🔴' },
                { label: 'بوابة الاستيكرات', value: 'stickers', emoji: '⚫' },
                { label: 'بوابة الدعم الفني', value: 'support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [mainPanel], components: [selector] });
}

client.on('interactionCreate', async (interaction) => {
    
    // أوامر السلاش (إدارية فقط)
    if (interaction.isChatInputCommand()) {
        if (!hasAuth(interaction.member)) return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً.", ephemeral: true });

        if (interaction.commandName === 'setup') {
            await sendLuxuryPanel(interaction.channel);
            return interaction.reply({ content: "✅ تم تفعيل المنظومة بنجاح.", ephemeral: true });
        }
        if (interaction.commandName === 'clear') {
            await interaction.channel.bulkDelete(interaction.options.getInteger('amount'));
            return interaction.reply({ content: "✅ تم تطهير الشات.", ephemeral: true });
        }
    }

    // المودال (البيانات الإلزامية)
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_select') {
        const modal = new ModalBuilder().setCustomId(`mod_${interaction.values[0]}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fn').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fd').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    // إنشاء التذكرة
    if (interaction.isModalSubmit() && interaction.customId.startsWith('mod_')) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        let s = { c: "#FF0000", l: "Banner", r: VAULT.STAFF_ROLES, e: "🔴" };
        if (type === 'stickers') s = { c: "#000000", l: "Sticker", r: VAULT.STAFF_ROLES, e: "⚫" };
        if (type === 'support') s = { c: "#0080FF", l: "Support", r: [VAULT.STAFF_ROLES[0]], e: "🔵" };

        const channel = await interaction.guild.channels.create({
            name: `🔱-${s.l}-${interaction.user.username}`,
            parent: VAULT.CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...s.r.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder()
            .setTitle(`${s.e} مـذكـرة خـدمـة: ${s.l}`)
            .setColor(s.c)
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📝 الـاسم الـرسمي", value: `> ${interaction.fields.getTextInputValue('fn')}`, inline: true },
                { name: "📄 بـيانـات الـمـلـف", value: `\`\`\`text\n${interaction.fields.getTextInputValue('fd')}\n\`\`\`` }
            ).setThumbnail(interaction.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('c_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('d_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${s.r[0]}>`, embeds: [welcome], components: [row] });
        await interaction.followUp({ content: `✅ تم تفعيل بوابتك: ${channel}`, ephemeral: true });
    }

    // أزرار الإدارة فقط
    if (interaction.isButton()) {
        const isStaff = hasAuth(interaction.member);
        if (!isStaff) return interaction.reply({ content: "❌ عذراً، هذا الإجراء للإدارة العليا فقط.", ephemeral: true });

        if (interaction.customId === 'c_btn') {
            await interaction.reply({ content: `✅ تـم تـولـي الـمـهـمة بـواسـطـة: ${interaction.user}` });
            const cL = client.channels.cache.get(VAULT.CHANNELS.CLAIM);
            if (cL) cL.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'd_btn') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_sys').setPlaceholder('🌟 تقييم مستوى الخدمة (للإدارة)...')
                    .addOptions([{ label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' }, { label: 'ضعيف ⭐', value: '1' }])
            );
            await interaction.reply({ content: "يرجى التقييم قبل الحفظ النهائي والأرشفة:", components: [row] });
        }

        if (interaction.customId === 'save_v9') {
            await interaction.reply("⏳ جاري تسجيل الأرشيف العمودي...");
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = msgs.filter(m => !m.author.bot)
                .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`).reverse().join('\n');

            const archEmbed = new EmbedBuilder().setTitle("📂 مـلـف أرشـيـف نهائي").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "المسؤول", value: interaction.user.tag, inline: true }).setTimestamp();

            const aC = client.channels.cache.get(VAULT.CHANNELS.ARCHIVE);
            const gC = client.channels.cache.get(VAULT.CHANNELS.LOGS);

            if (aC) await aC.send({ embeds: [archEmbed] });
            if (gC && transcript) await gC.send({ content: `📜 **سـجل تـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_sys') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('save_v9').setLabel('💾 تسجيل وحفظ التذكرة (إدارة)').setStyle(ButtonStyle.Primary));
        await interaction.update({ content: `✅ تم تسجيل التقييم الإداري. للمسؤول: إضـغط لـلأرشفة والـحـذف.`, components: [row] });
    }
});

client.login(VAULT.TOKEN);
