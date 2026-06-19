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

const CONFIG = {
    TOKEN: process.env.TOKEN,
    SERVER_ID: "1267986207569350709",
    OWNER_ROLE: "1516441623662170172",
    ADMIN_ROLES: ["1517120729559203931", "1516441626384269343"],
    SUPPORT_ADMIN_ONLY: "1517120729559203931",
    CLAIM_LOG: "1516441752716709970",
    LOGS_CHANNEL: "1516499096796664030",
    TRANSCRIPT_CHANNEL: "1516508105704214629",
    PANEL_IMAGE: "https://media.discordapp.net/attachments/1267986207569350709/jaber_pasha.png"
};

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} جاهز!`);
    
    // تسجيل أمر السلاش /setup تلقائياً
    const commands = [{ name: 'setup', description: 'إنشاء بنل التذاكر' }];
    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تسجيل أمر /setup بنجاح');
    } catch (error) { console.error(error); }
});

// التعامل مع الأوامر (سواء !setup أو /setup)
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "للمسؤولين فقط!", ephemeral: true });
        }
        await sendPanel(interaction.channel, interaction);
    }

    // نظام المودال عند اختيار فئة
    if (interaction.isStringSelectMenu() && interaction.customId === 'main_select') {
        const type = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${type}`).setTitle('إكمال البيانات الإلزامية');
        const infoInput = new TextInputBuilder()
            .setCustomId('user_data').setLabel("اكتب معلوماتك وسبب الطلب").setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(infoInput));
        await interaction.showModal(modal);
    }

    // إنشاء التذكرة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
        const userData = interaction.fields.getTextInputValue('user_data');
        
        let color, categoryName, supportID;
        if (type === 'banners') { color = "#FF0000"; categoryName = "🔴-banner"; supportID = CONFIG.ADMIN_ROLES; }
        else if (type === 'stickers') { color = "#1a1a1a"; categoryName = "⚫-sticker"; supportID = CONFIG.ADMIN_ROLES; }
        else { color = "#0080FF"; categoryName = "🔵-support"; supportID = [CONFIG.SUPPORT_ADMIN_ONLY]; }

        try {
            const channel = await interaction.guild.channels.create({
                name: `${categoryName}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    ...supportID.map(role => ({ id: role, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
                ],
            });

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`تذكرة جديدة: ${categoryName}`)
                .setColor(color)
                .setDescription(`**صاحب التذكرة:** ${interaction.user}\n**البيانات:**\n\`\`\`${userData}\`\`\``);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim').setLabel('استلام').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setStyle(ButtonStyle.Danger)
            );

            await channel.send({ content: `<@&${supportID[0]}>`, embeds: [ticketEmbed], components: [row] });
            await interaction.followUp({ content: `تم فتح تذكرتك: ${channel}`, ephemeral: true });
        } catch (e) {
            await interaction.followUp({ content: "خطأ: تأكد أن البوت لديه صلاحية Manage Channels", ephemeral: true });
        }
    }

    // زر الاستلام
    if (interaction.isButton() && interaction.customId === 'claim') {
        await interaction.reply({ content: `✅ تم الاستلام بواسطة ${interaction.user}` });
        const claimLog = client.channels.cache.get(CONFIG.CLAIM_LOG);
        if (claimLog) claimLog.send(`التذكرة ${interaction.channel.name} استلمها ${interaction.user.tag}`);
    }

    // زر الإغلاق والتقييم
    if (interaction.isButton() && interaction.customId === 'close') {
        const rateMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('rate_action').setPlaceholder('قيمنا للإغلاق...')
                .addOptions([{ label: '5 نجوم', value: '5' }, { label: '1 نجمة', value: '1' }])
        );
        await interaction.reply({ content: "التقييم للإغلاق:", components: [rateMenu] });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_action') {
        const rating = interaction.values[0];
        const logChan = client.channels.cache.get(CONFIG.LOGS_CHANNEL);
        const transChan = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
        
        const endEmbed = new EmbedBuilder().setTitle("تذكرة مغلقة").addFields({name:"التقييم", value:rating}).setColor("#FF0000");
        if (logChan) logChan.send({ embeds: [endEmbed] });
        if (transChan) transChan.send({ embeds: [endEmbed] });

        await interaction.reply("سيتم حذف الروم خلال 5 ثوانٍ...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// دالة إرسال البنل
async function sendPanel(channel, interaction = null) {
    const embed = new EmbedBuilder()
        .setTitle("🌹 نظام تذاكر جابر باشا")
        .setDescription("🔴 طلب بنرات | ⚫ طلب استيكرات | 🔵 دعم فني\n\n*يجب كتابة بياناتك قبل الفتح*")
        .setColor("#FF0000")
        .setImage(CONFIG.PANEL_IMAGE);

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('main_select').setPlaceholder('اختر الفئة...')
            .addOptions([
                { label: 'طلب بنرات', value: 'banners', emoji: '🔴' },
                { label: 'طلب استيكر', value: 'stickers', emoji: '⚫' },
                { label: 'الدعم الفني', value: 'support', emoji: '🔵' },
            ])
    );

    if (interaction) await interaction.reply({ embeds: [embed], components: [menu] });
    else await channel.send({ embeds: [embed], components: [menu] });
}

// أمر !setup القديم كاحتياط
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await sendPanel(message.channel);
    }
});

client.login(CONFIG.TOKEN);
