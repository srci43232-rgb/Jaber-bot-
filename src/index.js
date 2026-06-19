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
    ]
});

const CONFIG = {
    TOKEN: process.env.TOKEN, 
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    SUPPORT_ADMIN_ONLY: "1517120729559203931",
    CLAIM_LOG: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629"
};

client.once('ready', async () => {
    console.log(`✅ المتصل الآن: ${client.user.tag}`);
    const commands = [{ name: 'setup', description: 'إرسال بنل التذاكر الفخم' }];
    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    } catch (err) { console.error(err); }
});

async function sendLuxuryPanel(channel) {
    const serverIcon = channel.guild.iconURL({ dynamic: true, size: 1024 });
    const embed = new EmbedBuilder()
        .setTitle(`⚜️ صرح فخامة سيرفر ${channel.guild.name} ⚜️`)
        .setDescription(`
        **أهلاً بك في أرقى خدمات السيرفر الموحدة**
        
        🔴 **قسم طلب البنرات الاحترافية**
        ⚫ **قسم طلب الاستيكرات المميزة**
        🔵 **قسم الدعم الفني والإدارة**
        
        **⚠️ تنبيه:** يجب تعبئة البيانات المطلوبة بدقة لضمان سرعة الخدمة.
        `)
        .setColor("#FF0000")
        .setThumbnail(serverIcon)
        .setImage(serverIcon)
        .setFooter({ text: "نظام إدارة Var Vat~", iconURL: serverIcon });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('main_select')
            .setPlaceholder('إختر الفئة المطلوبة من هنا...')
            .addOptions([
                { label: 'طلب بنرات', value: 'banners', emoji: '🔴' },
                { label: 'طلب استيكر', value: 'stickers', emoji: '⚫' },
                { label: 'الدعم الفني', value: 'support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [embed], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        await sendLuxuryPanel(interaction.channel);
        await interaction.reply({ content: "تم الإرسال!", ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'main_select') {
        const type = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${type}`).setTitle('إكمال البيانات الإلزامية');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('u_name').setLabel("الاسم").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('u_desc').setLabel("تفاصيل الطلب").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const name = interaction.fields.getTextInputValue('u_name');
        const desc = interaction.fields.getTextInputValue('u_desc');
        
        let color, catName, supportID;
        if (type === 'banners') { color = "#FF0000"; catName = "🔴-بنرات"; supportID = CONFIG.ADMIN_ROLES; }
        else if (type === 'stickers') { color = "#1a1a1a"; catName = "⚫-استيكرات"; supportID = CONFIG.ADMIN_ROLES; }
        else { color = "#0080FF"; catName = "🔵-دعم-فني"; supportID = [CONFIG.SUPPORT_ADMIN_ONLY]; }

        const channel = await interaction.guild.channels.create({
            name: `${catName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...supportID.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle(`🛡️ تذكرة جديدة | ${catName}`)
            .setColor(color)
            .addFields(
                { name: "👤 صاحب التذكرة", value: `${interaction.user}`, inline: true },
                { name: "📝 الاسم المقدم", value: `\`\`\`${name}\`\`\``, inline: true },
                { name: "📑 تفاصيل الطلب", value: `\`\`\`${desc}\`\`\`` }
            ).setTimestamp();

        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim').setLabel('استلام').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${supportID[0]}>`, embeds: [embed], components: [btn] });
        await interaction.followUp({ content: `تم فتح تذكرتك: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'claim') {
            await interaction.reply({ content: `✅ تم الاستلام بواسطة ${interaction.user}` });
            const log = client.channels.cache.get(CONFIG.CLAIM_LOG);
            if (log) log.send(`📢 الإداري **${interaction.user.tag}** استلم تذكرة **${interaction.channel.name}**`);
        }
        if (interaction.customId === 'close') {
            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate').setPlaceholder('قيمنا للإغلاق...')
                .addOptions([{label:'5 نجوم', value:'5'}, {label:'4 نجوم', value:'4'}, {label:'1 نجمة', value:'1'}])
            );
            await interaction.reply({ content: "التقييم مطلوب للأرشفة والإغلاق:", components: [menu] });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate') {
        const rating = interaction.values[0];
        await interaction.update({ content: "جاري حفظ السجل وإغلاق التذكرة...", components: [] });

        // جلب الرسائل وتنسيقها بالطول
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const verticalLog = messages.filter(m => !m.author.bot).map(m => {
            const time = m.createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            return `[${time}] ${m.author.tag}: ${m.content}`;
        }).reverse().join('\n');

        const logEmbed = new EmbedBuilder()
            .setTitle("📁 أرشفة تذكرة نهائية")
            .setColor("#FF0000")
            .addFields(
                { name: "🆔 التذكرة", value: `${interaction.channel.name}`, inline: true },
                { name: "⭐ التقييم", value: `${rating}/5`, inline: true },
                { name: "🔒 أغلق بواسطة", value: `${interaction.user.tag}`, inline: true }
            )
            .setFooter({ text: "Var Vat~ Transcript System" })
            .setTimestamp();

        const logChan = client.channels.cache.get(CONFIG.LOGS_CHANNEL);
        const transChan = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);

        // إرسال السجل العمودي بشكل فخم
        if(logChan) await logChan.send({ embeds: [logEmbed] });
        if(transChan) {
            await transChan.send({ embeds: [logEmbed] });
            if (verticalLog.length > 0) {
                await transChan.send({ content: `📜 **سجل المحادثة الكامل (عمودي):**\n\`\`\`text\n${verticalLog.slice(0, 1900)}\n\`\`\`` });
            }
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await sendLuxuryPanel(message.channel);
    }
});

client.login(CONFIG.TOKEN);
