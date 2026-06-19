const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, PermissionsBitField, ChannelType, REST, Routes 
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

// --- قاعدة البيانات السيادية لـ Var Vat~ ---
const VAULT = {
    TOKEN: process.env.TOKEN, 
    SERVER_ID: "1267986207569350709",
    CATEGORY_ID: "1516441715870007509", // الأيدي الجديد الذي زودتني به
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
        GIF: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png" // رابط الـ GIF
    }
};

// وظيفة فحص السيادة الإدارية
const hasAuth = (member) => {
    return VAULT.STAFF_ROLES.some(id => member.roles.cache.has(id)) || 
           member.id === VAULT.OWNER_ID || 
           member.permissions.has(PermissionsBitField.Flags.Administrator);
};

client.once('ready', async () => {
    console.log(`[SYSTEM] 🛡️ البروتوكول الملكي متصل: ${client.user.tag}`);
    const commands = [
        { name: 'setup', description: 'تثبيت المنظومة الإدارية والبنل الرسمي لخدمات السيرفر' },
        { name: 'clear', description: 'تطهير الشات من الرسائل العالقة', options: [{ name: 'amount', description: 'عدد الرسائل', type: 4, required: true }] }
    ];
    const rest = new REST({ version: '10' }).setToken(VAULT.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[SYSTEM] ✅ تمت مزامنة الأوامر السيادية بنجاح');
    } catch (e) { console.error('[ERROR]', e); }
});

// --- الترحيب الملكي عند الانضمام ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(VAULT.CHANNELS.WELCOME);
    if (!channel) return;
    const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `سجل الانضمام الرسمي`, iconURL: member.guild.iconURL() })
        .setTitle(`✧ مـرحـبـاً بـك فـي ديـوان ${member.guild.name} ✧`)
        .setDescription(`> **نستقبلك اليوم كعضو جديد في طليعة نخبتنا.**\n\n**👤 الـعـضـو:** ${member}\n**🆔 الـهـويـة:** \`${member.id}\`\n**🔢 الـتـسلسـل:** \`#${member.guild.memberCount}\``)
        .setColor(VAULT.ASSETS.COLOR).setThumbnail(member.user.displayAvatarURL({ dynamic: true })).setImage(VAULT.ASSETS.GIF).setTimestamp();
    channel.send({ content: `**أهلاً بك ${member}**`, embeds: [welcomeEmbed] });
});

// --- معالج التفاعلات المركزية ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. أمر Setup (البنل الإداري الفخم)
    if (interaction.isChatInputCommand()) {
        if (!hasAuth(interaction.member)) return interaction.reply({ content: "⚠️ اختراق أمني: لا تملك تصريح الوصول.", ephemeral: true });

        if (interaction.commandName === 'setup') {
            const serverIco = interaction.guild.iconURL({ size: 1024, dynamic: true });
            const mainPanel = new EmbedBuilder()
                .setAuthor({ name: `Imperial Management • Var Vat~`, iconURL: serverIco })
                .setTitle(`♛ مـنـصـة الـنـخـبـة لـلـخـدمـات الـحـصـريـة ♛`)
                .setDescription(`
                **« بـروتوكول خـدمـة الـعـملاء الـرسـمـي »**
                
                مرحباً بك في الوجهة الرسمية لطلب الخدمات. تم تصميم هذا النظام لضمان الدقة والسرعة تحت إشراف الإدارة العليا.
                
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
                .setColor(VAULT.ASSETS.COLOR).setImage(VAULT.ASSETS.GIF).setThumbnail(serverIco)
                .setFooter({ text: `Var Vat~ High Priority Protocol • 2026` });

            const selector = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('gate_select_final').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة لـلـمـتـابـعة...')
                    .addOptions([
                        { label: 'بوابة البنرات', value: 'v_banners', emoji: '🔴' },
                        { label: 'بوابة الاستيكرات', value: 'v_stickers', emoji: '⚫' },
                        { label: 'بوابة الدعم الفني', value: 'v_support', emoji: '🔵' },
                    ])
            );
            await interaction.reply({ embeds: [mainPanel], components: [selector] });
        }
        
        if (interaction.commandName === 'clear') {
            const amount = interaction.options.getInteger('amount');
            await interaction.channel.bulkDelete(amount);
            await interaction.reply({ content: `✅ تم تطهير ${amount} رسالة من الشات.`, ephemeral: true });
        }
    }

    // 2. بروتوكول المودال
    if (interaction.isStringSelectMenu() && interaction.customId === 'gate_select_final') {
        const gate = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`mod_${gate}`).setTitle('🛡️ بـروتوكول تـحـقـيق الـبـيـانـات');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fn').setLabel("الاسـم الـرسـمـي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fd').setLabel("تـفـاصـيـل الـطـلـب").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    // 3. إنشاء التذكرة في الكاتجوري المحدد
    if (interaction.isModalSubmit() && interaction.customId.startsWith('mod_')) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const n = interaction.fields.getTextInputValue('fn');
        const d = interaction.fields.getTextInputValue('fd');
        
        let s = { c: "#FF0000", l: "Banner", r: VAULT.STAFF_ROLES, e: "🔴" };
        if (type === 'v_stickers') s = { c: "#000000", l: "Sticker", r: VAULT.STAFF_ROLES, e: "⚫" };
        if (type === 'v_support') s = { c: "#0080FF", l: "Support", r: [VAULT.STAFF_ROLES[0]], e: "🔵" };

        const channel = await interaction.guild.channels.create({
            name: `🔱-${s.l}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: VAULT.CATEGORY_ID, // فتح التذكرة داخل الكاتجوري المحدد
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...s.r.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder()
            .setTitle(`${s.e} مـذكـرة الـخـدمـة: ${s.l}`)
            .setDescription(`مرحباً بك ${interaction.user}، طلبك قيد المراجعة الإدارية حالياً.`)
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📝 الـاسم", value: `> ${n}`, inline: true },
                { name: "📄 الـمـلـف", value: `\`\`\`text\n${d}\n\`\`\`` }
            )
            .setColor(s.c).setThumbnail(interaction.user.displayAvatarURL()).setTimestamp();

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_vfinal').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close_vfinal').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${s.r[0]}>`, embeds: [welcome], components: [actionRow] });
        await interaction.followUp({ content: `✅ تـم تـفـعـيـل الـبـوابـة: ${channel}`, ephemeral: true });
    }

    // 4. العمليات الإدارية (أزرار الاستلام والإغلاق)
    if (interaction.isButton()) {
        if (!hasAuth(interaction.member)) return interaction.reply({ content: "❌ عذراً، لا تملك تصريحاً إدارياً.", ephemeral: true });

        if (interaction.customId === 'claim_vfinal') {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor("#00FF00").setDescription(`✅ تـم اسـتـلام الـمـهـمة بـواسـطـة: ${interaction.user}`)] });
            const cL = client.channels.cache.get(VAULT.CHANNELS.CLAIM);
            if (cL) cL.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'close_vfinal') {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_final_sys').setPlaceholder('🌟 تـقـيـيـم جـودة الـخدمـة (للعضو فقط)...')
                    .addOptions([{ label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5' }, { label: 'جيد ⭐⭐⭐', value: '3' }, { label: 'ضعيف ⭐', value: '1' }])
            );
            await interaction.reply({ content: "بانتظار تقييم العضو قبل الحفظ النهائي:", components: [row] });
        }

        if (interaction.customId === 'save_final_v') {
            await interaction.reply("⏳ جاري تسجيل الأرشيف العمودي...");
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = msgs.filter(m => !m.author.bot)
                .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`).reverse().join('\n');

            const archEmbed = new EmbedBuilder().setTitle("📂 مـلـف أرشـيـف").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "المسؤول", value: interaction.user.tag, inline: true }).setTimestamp();

            const aC = client.channels.cache.get(VAULT.CHANNELS.ARCHIVE);
            const gC = client.channels.cache.get(VAULT.CHANNELS.LOGS);

            if (aC) await aC.send({ embeds: [archEmbed] });
            if (gC && transcript) await gC.send({ content: `📜 **سـجل تـذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
        }
    }

    // 5. التقييم وحفظ التذكرة (للمسؤول فقط)
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_final_sys') {
        // التحقق من الإداري لإظهار زر الحفظ
        const saveRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('save_final_v').setLabel('💾 تسجيل وحفظ التذكرة (إدارة)').setStyle(ButtonStyle.Primary));
        await interaction.update({ content: `✅ تـم تسجيل التقييم. للمسؤول: إضـغط لـلأرشفة والـحـذف.`, components: [saveRow] });
    }
});

client.login(VAULT.TOKEN);
