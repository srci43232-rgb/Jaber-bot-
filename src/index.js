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

// --- الإعدادات النهائية ---
const CONFIG = {
    TOKEN: process.env.TOKEN, // هيقرأ من ريلوي مباشرة
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
        console.log('✅ تم تحديث أوامر السلاش بنجاح');
    } catch (err) { console.error("خطأ في تسجيل الأوامر:", err); }
});

// دالة إنشاء البنل الرئيسي
async function sendLuxuryPanel(channel) {
    const serverIcon = channel.guild.iconURL({ dynamic: true, size: 1024 });
    const embed = new EmbedBuilder()
        .setTitle(`⚜️ صرح فخامة سيرفر ${channel.guild.name} ⚜️`)
        .setDescription(`
        **أهلاً بك في أرقى خدمات السيرفر الموحدة**
        
        نحن هنا لنلبي تطلعاتكم ونقدم لكم تجربة فريدة تليق بوجودكم في **Var Vat~**. يرجى اختيار القسم المناسب لبدء تذكرتك.
        
        🔴 **قسم طلب البنرات الاحترافية**
        *تصاميم مبتكرة بجودة عالية تلبي ذوقك الرفيع.*
        
        ⚫ **قسم طلب الاستيكرات المميزة**
        *استيكرات مخصصة وحصرية تعبر عن تميزك.*
        
        🔵 **قسم الدعم الفني والإدارة**
        *للمساعدة الفورية، الاستفسارات، أو البلاغات الرسمية.*
        
        **⚠️ تنبيه:**
        *يجب تعبئة البيانات المطلوبة بدقة لضمان سرعة الخدمة.*
        `)
        .setColor("#FF0000")
        .setThumbnail(serverIcon)
        .setImage(serverIcon)
        .setFooter({ text: "نظام إدارة Var Vat~", iconURL: serverIcon })
        .setTimestamp();

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
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "للمسؤولين فقط!", ephemeral: true });
        await sendLuxuryPanel(interaction.channel);
        await interaction.reply({ content: "تم إرسال البنل بنجاح!", ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'main_select') {
        const type = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${type}`).setTitle('إكمال البيانات الإلزامية');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('u_name').setLabel("الاسم الثلاثي").setStyle(TextInputStyle.Short).setRequired(true)),
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
            .setAuthor({ name: `تذكرة جديدة | ${catName}`, iconURL: interaction.guild.iconURL() })
            .setColor(color)
            .addFields(
                { name: "👤 العضو", value: `${interaction.user}`, inline: true },
                { name: "📝 الاسم", value: `\`\`\`${name}\`\`\``, inline: true },
                { name: "📑 الطلب", value: `\`\`\`${desc}\`\`\`` }
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
            if (log) log.send(`التذكرة ${interaction.channel.name} استلمها ${interaction.user.tag}`);
        }
        if (interaction.customId === 'close') {
            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rate').setPlaceholder('قيمنا للإغلاق...')
                .addOptions([{label:'5 نجوم', value:'5'}, {label:'1 نجمة', value:'1'}])
            );
            await interaction.reply({ content: "التقييم مطلوب للإغلاق:", components: [menu] });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'rate') {
        const rating = interaction.values[0];
        const log = client.channels.cache.get(CONFIG.LOGS_CHANNEL);
        const trans = client.channels.cache.get(CONFIG.TRANSCRIPT_CHANNEL);
        const embed = new EmbedBuilder().setTitle("تذكرة مغلقة").addFields({name:"التقييم", value:`${rating}/5`}).setColor("#FF0000");
        if(log) log.send({ embeds: [embed] });
        if(trans) trans.send({ embeds: [embed] });
        await interaction.reply("سيتم الحذف خلال 5 ثوانٍ...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// التأكد من وجود التوكن قبل محاولة الاتصال
if (!CONFIG.TOKEN) {
    console.error("❌ خطأ قاتل: لم يتم العثور على التوكن في Variables!");
} else {
    client.login(CONFIG.TOKEN).catch(err => console.error("❌ فشل تسجيل الدخول:", err.message));
                  }
