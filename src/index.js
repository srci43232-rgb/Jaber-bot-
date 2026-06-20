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

// --- قاعدة بيانات المنظومة لـ Var Vat~ ---
const CORE = {
    TOKEN: process.env.TOKEN, 
    SERVER_ID: "1267986207569350709",
    CATEGORY_ID: "1516441715870007509", 
    OWNER_ID: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    CHANNELS: {
        CLAIM: "1516441752716709970",
        LOGS: "1516499096796664030",
        ARCHIVE: "1516508105704214629"
    },
    ASSETS: {
        COLOR: "#FF0000",
        // ضع هنا رابط الـ GIF الخاص بك
        GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" 
    }
};

// وظيفة التحقق من الرتب الإدارية
const isManagement = (member) => {
    return CORE.ADMIN_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === CORE.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    client.user.setPresence({ status: 'dnd', activities: [{ name: 'Var Vat~ Management', type: ActivityType.Watching }] });
    console.log(`[SYSTEM] 🛡️ المنظومة الإدارية متصلة: ${client.user.tag}`);
    
    const commands = [
        { name: 'setup', description: 'تثبيت بنل منظومة التذاكر الفاخرة' },
        { name: 'clear', description: 'تطهير الشات من الرسائل العالقة', options: [{ name: 'amount', description: 'عدد الرسائل', type: 4, required: true }] },
        { name: 'timeout', description: 'عقوبة التايم أوت لعضو', options: [{ name: 'user', description: 'العضو', type: 6, required: true }, { name: 'minutes', description: 'المدة بالدقائق', type: 4, required: true }] },
        { name: 'kick', description: 'طرد عضو من السيرفر', options: [{ name: 'user', description: 'العضو', type: 6, required: true }, { name: 'reason', description: 'السبب', type: 3 }] },
        { name: 'ban', description: 'حظر عضو من السيرفر', options: [{ name: 'user', description: 'العضو', type: 6, required: true }, { name: 'reason', description: 'السبب', type: 3 }] }
    ];

    const rest = new REST({ version: '10' }).setToken(CORE.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] ✅ تمت مزامنة الأوامر السيادية بنجاح');
    } catch (e) { console.error(e); }
});

// --- البنل الرئيسي الفخم ---
async function sendLuxuryPanel(channel) {
    const serverIco = channel.guild.iconURL({ size: 1024, dynamic: true });
    const panel = new EmbedBuilder()
        .setAuthor({ name: `Imperial Management • ${channel.guild.name}`, iconURL: serverIco })
        .setTitle("♛ مـركـز الـنـخـبـة لـلـخـدمـات الـمـتـكـامـلـة ♛")
        .setDescription(`
        **« بـروتوكول الـتـعـامـلات الـرسـمية »**
        
        مرحباً بك في الوجهة الرسمية والوحيدة لطلب الخدمات في **Var Vat~**. 
        تم تصميم هذا النظام لضمان الدقة والسرعة تحت إشراف الإدارة العليا.
        
        ━━━━━━━━━━━━━━━━━━━━━━
        **💠 بـوابـات الـخـدمـة الـرئيسية :**
        
        🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
        *تـصـامـيـم سـيـنـمـائـيـة تـخـطف الأنـظار.*

        ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
        *إضـافات إبـداعيـة تـنـبـض بـالـتميز.*

        🔵 **بـوابـة الـدعـم الـفـنـي الـمـبـاشـر**
        *تـواصـل حـصـري ومـشـفـر مـع الـمـسـؤولـيـن.*
        ━━━━━━━━━━━━━━━━━━━━━━
        
        *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
        `)
        .setColor(CORE.ASSETS.COLOR).setImage(CORE.ASSETS.GIF).setThumbnail(serverIco)
        .setFooter({ text: "Var Vat~ High Priority Protocol • 2026" });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('gate_select').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
            .addOptions([
                { label: 'بوابة البنرات', value: 'v_banners', emoji: '🔴' },
                { label: 'بوابة الاستيكرات', value: 'v_stickers', emoji: '⚫' },
                { label: 'بوابة الدعم الفني', value: 'v_support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [panel], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    
    // 1. أوامر الإدارة (الإداريين فقط)
    if (interaction.isChatInputCommand()) {
        if (!isManagement(interaction.member)) return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً.", ephemeral: true });

        if (interaction.commandName === 'setup') {
            await sendLuxuryPanel(interaction.channel);
            return interaction.reply({ content: "✅ تم تفعيل المنظومة.", ephemeral: true });
        }
        if (interaction.commandName === 'clear') {
            await interaction.channel.bulkDelete(interaction.options.getInteger('amount'));
            return interaction.reply({ content: "✅ تم تطهير الشات.", ephemeral: true });
        }
        // أوامر العقوبات
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || "خرق قوانين الإدارة";
        if (interaction.commandName === 'timeout') {
            await member.timeout(interaction.options.getInteger('minutes') * 60 * 1000, reason);
            return interaction.reply({ content: `✅ تم تقييد ${member} إدارياً.` });
        }
        if (interaction.commandName === 'kick') {
            await member.kick(reason);
            return interaction.reply({ content: `✅ تم طرد ${member} من السيرفر.` });
        }
        if (interaction.commandName === 'ban') {
            await member.ban({ reason });
            return interaction.reply({ content: `✅ تم نفي ${member} نهائياً.` });
        }
    }

    // 2. بروتوكول المودال
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
        let s = { c: "#FF0000", l: "Banner", e: "🔴" };
        if (type === 'v_stickers') s = { c: "#000000", l: "Sticker", e: "⚫" };
        if (type === 'v_support') s = { c: "#0080FF", l: "Support", e: "🔵" };

        const channel = await interaction.guild.channels.create({
            name: `🔱-${s.l}-${interaction.user.username}`,
            parent: CORE.CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...CORE.ADMIN_ROLES.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder()
            .setTitle(`${s.e} مـذكـرة الـخـدمـة الـرسمية`)
            .setColor(s.c)
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📝 الـاسم", value: `> ${interaction.fields.getTextInputValue('fn')}`, inline: true },
                { name: "📄 الـمـلـف", value: `\`\`\`text\n${interaction.fields.getTextInputValue('fd')}\n\`\`\`` }
            ).setThumbnail(interaction.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${CORE.ADMIN_ROLES[0]}>`, embeds: [welcome], components: [row] });
        await interaction.followUp({ content: `✅ تم تفعيل بوابتك: ${channel}`, ephemeral: true });
    }

    // 4. أزرار الإدارة (تحقق صارم)
    if (interaction.isButton()) {
        if (!isManagement(interaction.member)) return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً.", ephemeral: true });

        if (interaction.customId === 'claim_btn') {
            const claimEmbed = new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تـم اسـتـلام الـمـهـمة بـواسـطـة: ${interaction.user}`);
            await interaction.reply({ embeds: [claimEmbed] });
        }

        if (interaction.customId === 'close_btn') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_sys').setPlaceholder('🌟 تقييم مستوى الخدمة...')
                    .addOptions([{ label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' }, { label: 'ضعيف ⭐', value: '1' }])
            );
            await interaction.reply({ content: "بانتظار التقييم قبل الحفظ النهائي:", components: [row] });
        }

        if (interaction.customId === 'save_final') {
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

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_sys') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('save_final').setLabel('💾 تسجيل وحفظ (إدارة)').setStyle(ButtonStyle.Primary));
        await interaction.update({ content: `✅ تـم الـتـقـيـيـم. للمسؤول: إضـغط لـلأرشفة والـحـذف.`, components: [row] });
    }
});

client.login(CORE.TOKEN);
