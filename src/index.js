const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, PermissionsBitField, ChannelType, REST, Routes, ActivityType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences, // ضروري للحالة
    ]
});

// --- إعدادات المنظومة السيادية ---
const CONFIG = {
    TOKEN: process.env.TOKEN, 
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    CLAIM_LOG: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629",
    SERVER_GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // تأكد من وضع رابط الـ GIF هنا
};

// وظيفة التحقق من رتبة الإدارة
function checkStaff(member) {
    return CONFIG.ADMIN_ROLES.some(role => member.roles.cache.has(role)) || 
           member.roles.cache.has(CONFIG.OWNER_ROLE) ||
           member.permissions.has(PermissionsBitField.Flags.Administrator);
}

client.once('ready', async () => {
    // ضبط لمبة الاتصال (اللون الأحمر - Do Not Disturb)
    client.user.setPresence({
        status: 'dnd', 
        activities: [{
            name: 'Var Vat~ Management',
            type: ActivityType.Custom,
            state: '👑 في خدمة المنظومة الإدارية'
        }]
    });

    console.log(`✅ البروتوكول الإداري مفعل: ${client.user.tag}`);
    
    // تسجيل الأوامر
    const commands = [
        { name: 'setup', description: 'تثبيت بنل منظومة التذاكر الفاخرة' },
        { name: 'clear', description: 'تطهير الشات من الرسائل العالقة', options: [{ name: 'amount', description: 'عدد الرسائل', type: 4, required: true }] },
        { name: 'timeout', description: 'تقييد عضو (تايم أوت)', options: [{ name: 'user', description: 'العضو', type: 6, required: true }, { name: 'minutes', description: 'المدة بالدقائق', type: 4, required: true }] },
        { name: 'move', description: 'نقل عضو بين الرومات الصوتية', options: [{ name: 'user', description: 'العضو', type: 6, required: true }, { name: 'channel', description: 'الروم المستهدف', type: 7, required: true }] }
    ];

    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم مزامنة الأوامر السيادية بنجاح');
    } catch (err) { console.error('❌ خطأ في التسجيل:', err); }
});

// دالة إرسال البنل الملكي
async function sendLuxuryPanel(channel) {
    const serverIcon = channel.guild.iconURL({ dynamic: true, size: 1024 });
    const panelEmbed = new EmbedBuilder()
        .setAuthor({ name: `Imperial Management Hub | ${channel.guild.name}`, iconURL: serverIcon })
        .setTitle("♛ مـنـظـومـة الـنـخـبـة لـلـخـدمـات الـمـتـكـامـلـة ♛")
        .setDescription(`
        **« بـروتوكول الـتـعـامـلات الـرسمية لـسيرفر Var Vat~ »**
        
        مرحباً بك في الوجهة الرسمية لطلب الخدمات. تم تصميم هذه المنصة لضمان تنفيذ طلباتكم بأعلى معايير الدقة والسرعة تحت إشراف الإدارة العليا.
        
        ━━━━━━━━━━━━━━━━━━━━━━
        **💠 بـوابـات الـخـدمـة الـرئيسية :**
        
        🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
        *تـصـامـيـم سـيـنـمـائـيـة تـخـطف الأنـظار.*

        ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
        *إضـافات إبـداعيـة تـنـبـض بـالـتميز.*

        🔵 **بـوابـة الـدعـم الـفـنـي الـمـبـاشـر**
        *تـواصـل مـشـفـر مـع صـفـوة الـمـسـؤولـيـن.*
        ━━━━━━━━━━━━━━━━━━━━━━
        
        *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
        `)
        .setColor("#FF0000") // أحمر ملكي
        .setImage(CONFIG.SERVER_GIF)
        .setThumbnail(serverIcon)
        .setFooter({ text: "Var Vat~ Security & Services Protocol • 2026", iconURL: serverIcon });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('gate_select').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
            .addOptions([
                { label: 'بوابة البنرات', value: 'banners', emoji: '🔴' },
                { label: 'بوابة الاستيكرات', value: 'stickers', emoji: '⚫' },
                { label: 'بوابة الدعم الفني', value: 'support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [panelEmbed], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    
    // 1. أوامر السلاش (إدارية فقط)
    if (interaction.isChatInputCommand()) {
        if (!checkStaff(interaction.member)) return interaction.reply({ content: "⚠️ اختراق أمني: لا تملك تصريح الوصول.", ephemeral: true });

        if (interaction.commandName === 'setup') {
            await sendLuxuryPanel(interaction.channel);
            return interaction.reply({ content: "✅ تم تفعيل المنظومة بنجاح.", ephemeral: true });
        }
        if (interaction.commandName === 'clear') {
            const amount = interaction.options.getInteger('amount');
            await interaction.channel.bulkDelete(amount);
            return interaction.reply({ content: `✅ تم تطهير ${amount} رسالة.`, ephemeral: true });
        }
    }

    // 2. المودال (البيانات)
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_select') {
        const modal = new ModalBuilder().setCustomId(`mod_${interaction.values[0]}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fn').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fd').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    // 3. إنشاء التذكرة
    if (interaction.isModalSubmit() && interaction.customId.startsWith('mod_')) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        let s = { c: "#FF0000", l: "Banner", r: CONFIG.ADMIN_ROLES, e: "🔴" };
        if (type === 'stickers') s = { c: "#000000", l: "Sticker", r: CONFIG.ADMIN_ROLES, e: "⚫" };
        if (type === 'support') s = { c: "#0080FF", l: "Support", r: [CONFIG.ADMIN_ROLES[0]], e: "🔵" };

        const channel = await interaction.guild.channels.create({
            name: `🔱-${s.l}-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...s.r.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder().setTitle(`${s.e} مـذكـرة خـدمـة: ${s.l}`).setColor(s.c)
            .addFields({ name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true }, { name: "📝 الـاسـم", value: `> ${interaction.fields.getTextInputValue('fn')}`, inline: true }, { name: "📄 الـمـلـف", value: `\`\`\`text\n${interaction.fields.getTextInputValue('fd')}\n\`\`\`` })
            .setThumbnail(interaction.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${s.r[0]}>`, embeds: [welcome], components: [row] });
        await interaction.followUp({ content: `✅ تم تفعيل بوابتك: ${channel}`, ephemeral: true });
    }

    // 4. الأزرار (إدارة فقط)
    if (interaction.isButton()) {
        if (!checkStaff(interaction.member)) return interaction.reply({ content: "❌ هذا الإجراء مخصص للإدارة العليا فقط.", ephemeral: true });

        if (interaction.customId === 'claim_btn') {
            await interaction.reply({ content: `✅ تـم اسـتـلام الـمـهـمة بـواسـطـة الـمسؤول: ${interaction.user}` });
            const cL = client.channels.cache.get(CONFIG.CLAIM_LOG);
            if (cL) cL.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_btn') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_sys').setPlaceholder('🌟 تـقـيـيـم جـودة الـخدمـة...')
                    .addOptions([{ label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' }, { label: 'ضعيف ⭐', value: '1' }])
            );
            await interaction.reply({ content: "يرجى التقييم قبل الحفظ النهائي والأرشفة:", components: [row] });
        }

        if (interaction.customId === 'save_v7') {
            await interaction.reply("⏳ جاري تسجيل الأرشيف العمودي...");
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = msgs.filter(m => !m.author.bot).map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`).reverse().join('\n');

            const archiveEmbed = new EmbedBuilder().setTitle("📂 مـلـف أرشـيـف نهائي").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "المسؤول", value: interaction.user.tag, inline: true }).setTimestamp();

            const aC = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
            const gC = client.channels.cache.get(CONFIG.LOGS_CHANNEL);

            if (aC) await aC.send({ embeds: [archiveEmbed] });
            if (gC && transcript) await gC.send({ content: `📜 **سـجل تـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_sys') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('save_v7').setLabel('💾 تسجيل وحفظ التذكرة (إدارة)').setStyle(ButtonStyle.Primary));
        await interaction.update({ content: `✅ تـم تسجيل التقييم. للمسؤول: إضـغط لـلأرشفة والـحـذف.`, components: [row] });
    }
});

client.login(CONFIG.TOKEN);
