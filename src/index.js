const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ButtonStyle, 
    ButtonBuilder, 
    ChannelType, 
    PermissionFlagsBits 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, // ضروري جداً لتشغيل أمر !setup
        GatewayIntentBits.GuildMembers
    ]
});

const THEME_COLOR = "#FF0000"; 
const BRAND_NAME = "jaber_pasha_";

client.once('ready', () => {
    console.log(`✅ ${BRAND_NAME} System is Online!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const mainEmbed = new EmbedBuilder()
            .setTitle(`✨ مركز تميز ${BRAND_NAME}`)
            .setColor(THEME_COLOR)
            .setDescription(`**أهلاً بك في المنصة الرسمية لـ ${BRAND_NAME}** 💎\n\n🔴 بنرات احترافية\n⚫ استيكرات فاخرة\n🔵 دعم فني مباشر\n\n*اختر القسم من الأسفل لبدء الطلب*`)
            .setFooter({ text: `${BRAND_NAME} | Quality Above All` });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('main_menu')
                .setPlaceholder('إختر الفئة المطلوبة...')
                .addOptions([
                    { label: 'طلب بنر (Red Shiny)', value: 'banner', emoji: '🔴' },
                    { label: 'طلب استيكر (Black Shiny)', value: 'sticker', emoji: '⚫' },
                    { label: 'الدعم الفني (Blue Shiny)', value: 'support', emoji: '🔵' },
                ]),
        );

        await message.channel.send({ embeds: [mainEmbed], components: [menu] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'main_menu') {
        const modal = new ModalBuilder().setCustomId(`modal_${interaction.values[0]}`).setTitle(`بيانات طلب: ${interaction.values[0]}`);
        const nameInput = new TextInputBuilder().setCustomId('user_name').setLabel("اسمك الثنائي").setStyle(TextInputStyle.Short).setRequired(true);
        const detailsInput = new TextInputBuilder().setCustomId('user_details').setLabel("تفاصيل الطلب").setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(detailsInput));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const name = interaction.fields.getTextInputValue('user_name');
        const details = interaction.fields.getTextInputValue('user_details');
        const type = interaction.customId.replace('modal_', '');

        let category = interaction.guild.channels.cache.find(c => c.name === "TICKETS" && c.type === ChannelType.GuildCategory);
        if (!category) category = await interaction.guild.channels.create({ name: 'TICKETS', type: ChannelType.GuildCategory });

        const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'support');

        const ticketChannel = await interaction.guild.channels.create({
            name: `${type}-${interaction.user.username}`,
            parent: category.id,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                ...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة | ${BRAND_NAME}`)
            .setColor(THEME_COLOR)
            .addFields({ name: '👤 صاحب الطلب:', value: name }, { name: '📑 التفاصيل:', value: details })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('reg_btn').setLabel('تسجيل').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rate_btn').setLabel('تقييم').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إغلاق').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `${interaction.user} ${staffRole ? `| <@&${staffRole.id}>` : ""}`, embeds: [ticketEmbed], components: [buttons] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك: ${ticketChannel}` });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'close_btn') return interaction.channel.delete();
        await interaction.reply({ content: "تم استلام طلبك بنجاح!", ephemeral: true });
    }
});

// ال
client.login(process.env.TOKEN);
