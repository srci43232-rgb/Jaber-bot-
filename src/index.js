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

// --- الإعدادات (IDs) ---
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

// وظيفة التحقق من الإدارة
function checkStaff(member) {
    return CONFIG.ADMIN_ROLES.some(role => member.roles.cache.has(role)) || 
           member.roles.cache.has(CONFIG.OWNER_ROLE) ||
           member.permissions.has(PermissionsBitField.Flags.Administrator);
}

client.once('ready', async () => {
    console.log(`✅ المتصل الآن: ${client.user.tag}`);
    
    // تسجيل الأوامر مع إضافة وصف لكل خيار (حل مشكلة Invalid Form Body)
    const commands = [
        { 
            name: 'setup', 
            description: 'إرسال بنل التذاكر الفخم لسيرفر Var Vat~' 
        },
        { 
            name: 'move', 
            description: 'نقل عضو من روم صوتي لآخر',
            options: [
                { name: 'user', description: 'العضو المراد نقله', type: 6, required: true },
                { name: 'channel', description: 'الروم الصوتي المستهدف', type: 7, required: true }
            ]
        },
        { 
            name: 'disconnect', 
            description: 'فصل عضو من الروم الصوتي',
            options: [
                { name: 'user', description: 'العضو المراد فصله', type: 6, required: true }
            ]
        },
        { 
            name: 'timeout', 
            description: 'إعطاء تايم أوت (إسكات) لعضو',
            options: [
                { name: 'user', description: 'العضو المستهدف', type: 6, required: true },
                { name: 'minutes', description: 'المدة بالدقائق', type: 4, required: true },
                { name: 'reason', description: 'السبب', type: 3, required: false }
            ]
        },
        { 
            name: 'clear', 
            description: 'مسح كمية محددة من الرسائل',
            options: [
                { name: 'amount', description: 'عدد الرسائل المراد مسحها', type: 4, required: true }
            ]
        }
    ];

    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تسجيل جميع الأوامر بنجاح بدون أخطاء');
    } catch (err) {
        console.error('❌ فشل في تسجيل الأوامر:', err);
    }
});

// --- لوحة التذاكر الفخمة ---
async function sendLuxuryPanel(channel) {
    const serverIcon = channel.guild.iconURL({ dynamic: true, size: 1024 });
    const embed = new EmbedBuilder()
        .setTitle(`⚜️ صرح فخامة سيرفر ${channel.guild.name} ⚜️`)
        .setDescription(`**أهلاً بك في قسم الخدمات الموحد**\n\n🔴 طلب بنرات | ⚫ طلب استيكرات | 🔵 دعم فني\n\n*يرجى اختيار القسم المناسب وفتح التذكرة لإكمال بياناتك.*`)
        .setColor("#FF0000").setThumbnail(serverIcon).setImage(serverIcon)
        .setFooter({ text: "نظام إدارة Var Vat~ الموحد", iconURL: serverIcon });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('main_select').setPlaceholder('إختر القسم المطلوب...')
            .addOptions([
                { label: 'طلب بنرات', value: 'banners', emoji: '🔴' },
                { label: 'طلب استيكر', value: 'stickers', emoji: '⚫' },
                { label: 'الدعم الفني', value: 'support', emoji: '🔵' },
            ])
    );
    await channel.send({ embeds: [embed], components: [menu] });
}

client.on('interactionCreate', async (interaction) => {
    
    // 1. معالجة أوامر السلاش (للإدارة فقط)
    if (interaction.isChatInputCommand()) {
        if (!checkStaff(interaction.member)) return interaction.reply({ content: "❌ عذراً، هذه الأوامر مخصصة للإدارة العليا فقط.", ephemeral: true });

        if (interaction.commandName === 'setup') {
            await sendLuxuryPanel(interaction.channel);
            return interaction.reply({ content: "✅ تم إرسال البنل.", ephemeral: true });
        }
        if (interaction.commandName === 'clear') {
            const amount = interaction.options.getInteger('amount');
            await interaction.channel.bulkDelete(amount);
            return interaction.reply({ content: `✅ تم مسح ${amount} رسالة.`, ephemeral: true });
        }
        if (interaction.commandName === 'move') {
            const member = interaction.options.getMember('user');
            const channel = interaction.options.getChannel('channel');
            if (!member.voice.channel) return interaction.reply({ content: "❌ العضو ليس في روم صوتي.", ephemeral: true });
            await member.voice.setChannel(channel);
            return interaction.reply({ content: `✅ تم نقل ${member} إلى ${channel.name}` });
        }
    }

    // 2. فتح التذكرة والبيانات الإلزامية
    if (interaction.isStringSelectMenu() && interaction.customId === 'main_select') {
        const modal = new ModalBuilder().setCustomId(`modal_${interaction.values[0]}`).setTitle('بيانات فتح التذكرة');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('u_name').setLabel("الاسم الثلاثي").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('u_desc').setLabel("تفاصيل طلبك").setStyle(TextInputStyle.Paragraph).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.customId.split('_')[1];
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

        const ticketEmbed = new EmbedBuilder().setTitle(`🛡️ تذكرة جديدة | ${catName}`).setColor(color)
            .addFields(
                { name: "👤 العضو", value: `${interaction.user}`, inline: true },
                { name: "📝 الاسم", value: `\`\`\`${interaction.fields.getTextInputValue('u_name')}\`\`\``, inline: true },
                { name: "📑 الطلب", value: `\`\`\`${interaction.fields.getTextInputValue('u_desc')}\`\`\`` }
            ).setTimestamp();

        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim').setLabel('استلام').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `<@&${supportID[0]}>`, embeds: [ticketEmbed], components: [btnRow] });
        await interaction.followUp({ content: `تم فتح تذكرتك: ${channel}`, ephemeral: true });
    }

    // 3. أزرار التحكم (للإدارة فقط)
    if (interaction.isButton()) {
        const isStaff = checkStaff(interaction.member);

        if (interaction.customId === 'claim') {
            if (!isStaff) return interaction.reply({ content: "❌ الاستلام للإدارة فقط.", ephemeral: true });
            await interaction.reply({ content: `✅ التذكرة الآن تحت متابعة الإداري: ${interaction.user}` });
            const log = client.channels.cache.get(CONFIG.CLAIM_LOG);
            if (log) log.send(`✅ استلام تذكرة: **${interaction.channel.name}** بواسطة **${interaction.user.tag}**`);
        }

        if (interaction.customId === 'close') {
            if (!isStaff) return interaction.reply({ content: "❌ الإغلاق للإدارة فقط.", ephemeral: true });
            const rateMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate_val').setPlaceholder('قيم الخدمة...')
                .addOptions([{label:'ممتاز ⭐⭐⭐⭐⭐', value:'5'}, {label:'سيء ⭐', value:'1'}])
            );
            await interaction.reply({ content: "التقييم مطلوب للأرشفة:", components: [rateMenu] });
        }

        if (interaction.customId === 'save_and_exit') {
            if (!isStaff) return interaction.reply({ content: "❌ الحفظ للإدارة فقط.", ephemeral: true });
            await interaction.reply("⏳ جاري الأرشفة العمودية والحذف...");
            
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const verticalLog = messages.filter(m => !m.author.bot).map(m => `[${m.createdAt.toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).reverse().join('\n');

            const logEmbed = new EmbedBuilder().setTitle("📁 أرشيف تذكرة نهائي").setColor("#FF0000")
                .addFields({ name: "التذكرة", value: interaction.channel.name, inline: true }, { name: "أغلق بواسطة", value: interaction.user.tag, inline: true }).setTimestamp();

            const logChan = client.channels.cache.get(CONFIG.LOGS_CHANNEL);
            const transChan = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);

            if(logChan) await logChan.send({ embeds: [logEmbed] });
            if(transChan) {
                await transChan.send({ embeds: [logEmbed] });
                if (verticalLog.length > 0) await transChan.send({ content: `📜 **سجل المحادثة العمودي:**\n\`\`\`text\n${verticalLog.slice(0, 1900)}\n\`\`\`` });
            }
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_val') {
        const saveBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('save_and_exit').setLabel('💾 تسجيل وحفظ التذكرة (إدارة فقط)').setStyle(ButtonStyle.Primary)
        );
        await interaction.update({ content: `✅ التقييم مسجل. للمسؤول: اضغط الزر للحفظ والحذف.`, components: [saveBtn] });
    }
});

client.login(CONFIG.TOKEN);
