const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, PermissionsBitField, ChannelType, REST, Routes 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// --- إعدادات السيادة الإدارية لـ Var Vat~ ---
const CORE = {
    TOKEN: process.env.TOKEN,
    OWNER: "1516441623662170172",
    ADMINS: ["1517120729559203931", "1516441626384269343"],
    TECH_SUPPORT: "1517120729559203931",
    CHANNELS: {
        CLAIM: "1516441752716709970",
        LOGS: "1516499096796664030",
        TRANSCRIPT: "1516508105704214629",
        WELCOME: "1514696892246786089"
    }
};

// فحص هل العضو إداري؟
const isStaff = (member) => CORE.ADMINS.some(id => member.roles.cache.has(id)) || member.id === CORE.OWNER || member.permissions.has(PermissionsBitField.Flags.Administrator);

client.once('ready', async () => {
    console.log(`[SYSTEM] 🛡️ البروتوكول الملكي متصل: ${client.user.tag}`);
    const commands = [
        { name: 'setup', description: 'تثبيت بنل منظومة Var Vat~ للخدمات' },
        { name: 'clear', description: 'تطهير المحادثة', options: [{name:'amount', description:'عدد الرسائل', type:4, required:true}] }
    ];
    const rest = new REST({ version: '10' }).setToken(CORE.TOKEN);
    try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); } catch (e) { console.error(e); }
});

// --- بنل التذاكر الفخم جداً ---
async function sendLuxuryPanel(channel) {
    const icon = channel.guild.iconURL({ size: 1024, dynamic: true });
    const panel = new EmbedBuilder()
        .setAuthor({ name: `Imperial Services | ${channel.guild.name}`, iconURL: icon })
        .setTitle("♛ مـنـظـومـة الـنـخـبـة لـلـخـدمـات الـحـصـريـة ♛")
        .setDescription(`
        **« بـروتوكول الـتـعـامـلات الـرسـمية »**
        
        مرحباً بك في الوجهة الرسمية لطلب الخدمات. تم تصميم هذا النظام لضمان الدقة والسرعة تحت إشراف الإدارة العليا.
        
        ━━━━━━━━━━━━━━━━━━━━━━
        **💠 بـوابـات الـخـدمـة الـرئيسية :**
        
        🔴 **بـوابـة الـبـنـرات الـفـاخـرة**
        ⚫ **بـوابـة الاسـتـيـكـرات الـمـلكيـة**
        🔵 **بـوابـة الـدعـم الـفـنـي الـمـبـاشـر**
        ━━━━━━━━━━━━━━━━━━━━━━
        
        *⚠️ يـلـزم اسـتـيفاء الـبـيـانات فـي الـنـافـذة الـقـادمة لـتـفـعـيـل الـطلب.*
        `)
        .setColor("#FF0000").setImage(icon).setThumbnail(icon)
        .setFooter({ text: "Var Vat~ Security Protocol • 2026" });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('gate_select').setPlaceholder('🔱 إخـتـر بـوابـة الـخـدمـة...')
            .addOptions([
                { label: 'بوابة البنرات', value: 'banners', emoji: '🔴' },
                { label: 'بوابة الاستيكرات', value: 'stickers', emoji: '⚫' },
                { label: 'بوابة الدعم الفني', value: 'support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [panel], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    
    // 1. أوامر السلاش
    if (interaction.isChatInputCommand()) {
        if (!isStaff(interaction.member)) return interaction.reply({ content: "❌ للإدارة فقط.", ephemeral: true });
        if (interaction.commandName === 'setup') {
            await sendLuxuryPanel(interaction.channel);
            await interaction.reply({ content: "✅ تم التثبيت.", ephemeral: true });
        }
        if (interaction.commandName === 'clear') {
            await interaction.channel.bulkDelete(interaction.options.getInteger('amount'));
            await interaction.reply({ content: "✅ تم التنظيف.", ephemeral: true });
        }
    }

    // 2. المودال (البيانات الإلزامية)
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
        const uName = interaction.fields.getTextInputValue('fn');
        const uData = interaction.fields.getTextInputValue('fd');
        
        let s = { c: "#FF0000", l: "Banner", r: CORE.ADMINS, e: "🔴" };
        if (type === 'stickers') s = { c: "#000000", l: "Sticker", r: CORE.ADMINS, e: "⚫" };
        if (type === 'support') s = { c: "#0080FF", l: "Support", r: [CORE.TECH_SUPPORT], e: "🔵" };

        const channel = await interaction.guild.channels.create({
            name: `🔱-${s.l}-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...s.r.map(id => ({ id: id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const welcome = new EmbedBuilder()
            .setTitle(`${s.e} مـذكـرة خـدمـة: ${s.l}`)
            .setDescription(`مرحباً بك ${interaction.user}، طلبك قيد المعالجة الإدارية.`)
            .addFields(
                { name: "👤 الـعـمـيـل", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📝 الـاسـم", value: `> ${uName}`, inline: true },
                { name: "📄 الـمـلـف", value: `\`\`\`text\n${uData}\n\`\`\`` }
            )
            .setColor(s.c).setThumbnail(interaction.user.displayAvatarURL()).setFooter({ text: `Creator ID: ${interaction.user.id}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('c_btn').setLabel('تولي المهمة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('d_btn').setLabel('إنهاء الإجراء').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${s.r[0]}>`, embeds: [welcome], components: [row] });
        await interaction.followUp({ content: `✅ تم تفعيل بوابتك: ${channel}`, ephemeral: true });
    }

    // 4. أزرار التحكم (إدارة فقط)
    if (interaction.isButton()) {
        const staff = isStaff(interaction.member);

        if (interaction.customId === 'c_btn') {
            if (!staff) return interaction.reply({ content: "❌ للإدارة فقط.", ephemeral: true });
            await interaction.reply({ content: `✅ تم الاستلام بواسطة: ${interaction.user}` });
            const cl = client.channels.cache.get(CORE.CHANNELS.CLAIM);
            if (cl) cl.send(`🎫 **تقرير:** الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }

        if (interaction.customId === 'd_btn') {
            if (!staff) return interaction.reply({ content: "❌ الإغلاق للإدارة فقط.", ephemeral: true });
            
            // جلب ايدي صاحب التذكرة من الامبيد
            const embed = interaction.message.embeds[0];
            const ownerID = embed.footer.text.replace('Creator ID: ', '');

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId(`rate_${ownerID}`).setPlaceholder('🌟 (للعضو فقط) قيم مستوى الخدمة...')
                    .addOptions([
                        { label: 'ممتاز ⭐⭐⭐⭐⭐', value: '5', emoji: '👑' },
                        { label: 'جيد ⭐⭐⭐', value: '3', emoji: '👍' },
                        { label: 'ضعيف ⭐', value: '1', emoji: '👎' },
                    ])
            );
            await interaction.reply({ content: `📢 **بانتظار تقييم العضو <@${ownerID}> لإتمام الإغلاق...**`, components: [row] });
        }

        if (interaction.customId === 'final_save') {
            if (!staff) return interaction.reply({ content: "❌ الحفظ للإدارة فقط.", ephemeral: true });
            await interaction.reply("⏳ جاري تسجيل الأرشيف العمودي...");

            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages.filter(m => !m.author.bot)
                .map(m => `┃ [${m.createdAt.toLocaleTimeString()}] ${m.author.tag} ➔ ${m.content}`).reverse().join('\n');

            const archEmbed = new EmbedBuilder().setTitle("📂 أرشيف تذكرة نهائي").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "بواسطة", value: interaction.user.tag, inline: true }).setTimestamp();

            const aC = client.channels.cache.get(CORE.CHANNELS.TRANSCRIPT);
            const gC = client.channels.cache.get(CORE.CHANNELS.LOGS);

            if (aC) await aC.send({ embeds: [archEmbed] });
            if (gC && transcript) await gC.send({ content: `📜 **سجل تذكرة (${interaction.channel.name}):**\n\`\`\`text\n${transcript.slice(0, 1900)}\n\`\`\`` });

            setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
        }
    }

    // 5. التقييم (العضو فقط)
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('rate_')) {
        const ownerID = interaction.customId.split('_')[1];
        if (interaction.user.id !== ownerID) return interaction.reply({ content: "❌ هذا التقييم مخصص لصاحب التذكرة فقط!", ephemeral: true });

        const rating = interaction.values[0];
        const finalRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('final_save').setLabel('💾 تسجيل وأرشفة التذكرة (للإدارة)').setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ 
            content: `✅ **تم استلام تقييم العضو: ${rating}/5 ⭐**\nيرجى من المسؤول الضغط على الزر أدناه للأرشفة والحذف.`, 
            components: [finalRow] 
        });
    }
});

client.login(CORE.TOKEN);
