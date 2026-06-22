const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
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
        GatewayIntentBits.GuildMembers
    ]
});

// --- إعدادات البيانات الخاصة بك ---
const CONFIG = {
    TOKEN: process.env.TOKEN || "ضـع_تـوكـن_هـنـا",
    CLIENT_ID: "1381360453485334658", // آيدي البوت نفسه
    GUILD_ID: "1381360453485334658",
    OWNER_ID: "1517002644676411592",
    CATEGORY_TICKETS: "1517931717061771294",
    LOG_CHANNEL: "1517942325383270502",
    STAFF_ROLES: [
        "1517002645666267197",
        "1517931426069348446",
        "1517931427600007258",
        "1517931425372962947"
    ],
    TECH_ROLE: "1517931445149241356"
};

// تسجيل أمر /setup تلقائياً
const commands = [{
    name: 'setup',
    description: 'إنشاء لوحة التحكم في التذاكر'
}];

const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} يعمل الآن على Railway!`);
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, CONFIG.GUILD_ID), { body: commands });
        console.log('✅ تم تسجيل أوامر الـ Slash بنجاح');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    // 1. التعامل مع أمر /setup
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup') {
            if (interaction.user.id !== CONFIG.OWNER_ID) {
                return interaction.reply({ content: "❌ هذا الأمر للمالك فقط.", ephemeral: true });
            }

            const mainEmbed = new EmbedBuilder()
                .setTitle("🛡️ One City RP | نـظـام الـدعم الـفـنـي")
                .setDescription(`
                    \n**مـرحـباً بـك فـي مـديـنـة One City**\n
                    نـحـن نـسـعـى دائـمـاً لـتـقـديـم بـيـئـة لـعـب احـتـرافـيـة وآمـنـة.
                    بـإمـكـانـك الآن الـتـواصـل مـع الإدارة مـن خـلال الأقـسـام الـتـالـيـة:\n
                    🟢 **بـلاغ ضـد لاعـب** : لـتـقـديـم شكوى عـن مـخـالـفـة قـوانـيـن الـمـديـنـة.
                    🔴 **بـلاغ ضـد إداري** : لـتـقـديـم شكوى تـتـعـلـق بـتـعـامـل الطـاقـم الإداري.
                    ⚫ **الـدعم الـفـنـي** : لـلـمـشـاكـل الـتـقـنـيـة، الاقـتـراحـات، أو الاسـتـفـسـارات.
                    \n*عـنـد الـضـغـط عـلـى الـزر، يـرجـى تـعـبـئـة الـبـيـانـات الـمـطـلـوبـة بـدقـة لـتـسـريـع عـمـلـيـة الـرد.*
                `)
                .setColor("#FF0000") // أحمر لامع
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({ text: "One City RP - Management System", iconURL: interaction.guild.iconURL() });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_player').setLabel('ضد لاعب').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn_staff').setLabel('ضد اداري').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('btn_tech').setLabel('الدعم الفني').setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({ embeds: [mainEmbed], components: [buttons] });
        }
    }

    // 2. التعامل مع الضغط على أزرار فتح التذكرة (إظهار المودال)
    if (interaction.isButton()) {
        const typeMap = { 'btn_player': 'ضد لاعب', 'btn_staff': 'ضد اداري', 'btn_tech': 'الدعم الفني' };
        if (typeMap[interaction.customId]) {
            const modal = new ModalBuilder()
                .setCustomId(`modal_${interaction.customId}`)
                .setTitle(`بيانات تذكرة: ${typeMap[interaction.customId]}`);

            const inputName = new TextInputBuilder()
                .setCustomId('field_name')
                .setLabel("الاسم والآيدي الخاص بك")
                .setPlaceholder("مثال: محمد | 1517")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputReason = new TextInputBuilder()
                .setCustomId('field_reason')
                .setLabel("تفاصيل الموضوع / البلاغ")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputName),
                new ActionRowBuilder().addComponents(inputReason)
            );

            await interaction.showModal(modal);
        }
    }

    // 3. معالجة بيانات المودال وفتح القناة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });

        const nameInfo = interaction.fields.getTextInputValue('field_name');
        const reasonInfo = interaction.fields.getTextInputValue('field_reason');
        const customId = interaction.customId;

        let categoryName, embedColor, rolesToAllow = [CONFIG.OWNER_ID];

        if (customId.includes('player')) {
            categoryName = "player"; embedColor = "#00FF00"; rolesToAllow.push(...CONFIG.STAFF_ROLES);
        } else if (customId.includes('staff')) {
            categoryName = "staff"; embedColor = "#FF0000"; rolesToAllow.push(...CONFIG.STAFF_ROLES);
        } else {
            categoryName = "tech"; embedColor = "#1A1A1A"; rolesToAllow.push(CONFIG.TECH_ROLE);
        }

        const channel = await interaction.guild.channels.create({
            name: `${categoryName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.CATEGORY_TICKETS,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...rolesToAllow.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ]
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة | قسم ${categoryName}`)
            .setColor(embedColor)
            .addFields(
                { name: "👤 العضو:", value: `${interaction.user} (${nameInfo})`, inline: true },
                { name: "📝 التفاصيل:", value: reasonInfo }
            )
            .setTimestamp();

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_now').setLabel('إغلاق وحفظ').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `@here تذكرة جديدة`, embeds: [welcomeEmbed], components: [closeBtn] });
        await interaction.editReply(`✅ تم فتح التذكرة: ${channel}`);
    }

    // 4. نظام الإغلاق واللوجز النصي
    if (interaction.isButton() && interaction.customId === 'close_now') {
        const channel = interaction.channel;
        await interaction.reply("🔒 جاري معالجة الأرشيف والحذف...");

        const messages = await channel.messages.fetch({ limit: 100 });
        let logContent = `LOG ARCHIVE - ${channel.name}\n==============================\n`;
        messages.reverse().forEach(m => {
            logContent += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({ content: `📄 **أرشيف التذكرة: \`${channel.name}\`**\nتم الإغلاق بواسطة: ${interaction.user}` });
            // إرسال اللوج كنص (يتعامل مع الحد الأقصى للحروف)
            if (logContent.length > 1900) {
                await logChannel.send({ content: "```text\n" + logContent.substring(0, 1900) + "... (المزيد في الأرشيف الداخلي)```" });
            } else {
                await logChannel.send({ content: "```text\n" + logContent + "```" });
            }
        }

        setTimeout(() => channel.delete().catch(() => {}), 5000);
    }
});

client.login(CONFIG.TOKEN);
