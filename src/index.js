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
        GatewayIntentBits.MessageContent
    ]
});

// إعدادات الهوية والألوان
const THEME_COLOR = "#FF0000"; // الأحمر اللامع المطلوب
const BRAND_NAME = "jaber_pasha_";

client.once('ready', () => {
    console.log(`✅ ${BRAND_NAME} System is Online!`);
    console.log(`Logged in as: ${client.user.tag}`);
});

// أمر التأسيس (!setup)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!setup') {
        // التحقق من صلاحيات العضو الذي يكتب الأمر
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("عذراً، هذا الأمر للمسؤولين فقط.");
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle(`✨ مركز تميز ${BRAND_NAME}`)
            .setColor(THEME_COLOR)
            .setThumbnail(message.guild.iconURL())
            .setDescription(`
                **أهلاً بك في المنصة الرسمية والوحيدة لـ ${BRAND_NAME}** 💎
                نحن نقدم أرقى الخدمات التصميمية والفنية بجودة لا تضاهى.

                **يرجى اختيار القسم المناسب لبدء طلبك:**

                🔴 **قسم طلب البنرات الاحترافية**
                *عالم من الإبداع باللون الأحمر اللامع.*

                ⚫ **قسم الاستيكرات الفاخرة**
                *أناقة اللون الأسود الملكي في تصاميمك.*

                🔵 **قسم الدعم الفني المباشر**
                *مساعدة تقنية شاملة من فريقنا المختص.*

                ---
                ℹ️ *بمجرد الاختيار، سيُطلب منك تعبئة نموذج البيانات.*
            `)
            .setFooter({ text: `${BRAND_NAME} | Quality Above All`, iconURL: client.user.displayAvatarURL() });

        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('main_menu')
                    .setPlaceholder('إختر الفئة التي تود التواصل معها...')
                    .addOptions([
                        { label: 'طلب بنر (Red Shiny)', value: 'banner', emoji: '🔴', description: 'تصاميم بنرات احترافية' },
                        { label: 'طلب استيكر (Black Shiny)', value: 'sticker', emoji: '⚫', description: 'تصاميم استيكرات ملكية' },
                        { label: 'الدعم الفني (Blue Shiny)', value: 'support', emoji: '🔵', description: 'تواصل مع الإدارة مباشرة' },
                    ]),
            );

        await message.channel.send({ embeds: [mainEmbed], components: [menu] });
    }
});

// التعامل مع التفاعلات
client.on('interactionCreate', async (interaction) => {
    
    // 1. نظام القوائم (Select Menu) لتجهيز المودال
    if (interaction.isStringSelectMenu() && interaction.customId === 'main_menu') {
        const type = interaction.values[0];
        const modal = new ModalBuilder()
            .setCustomId(`modal_${type}`)
            .setTitle(`بيانات طلب: ${type}`);

        const nameInput = new TextInputBuilder()
            .setCustomId('user_name').setLabel("اسمك الثنائي").setPlaceholder("اكتب اسمك هنا...").setStyle(TextInputStyle.Short).setRequired(true);
        const detailsInput = new TextInputBuilder()
            .setCustomId('user_details').setLabel("تفاصيل الطلب / المشكلة").setPlaceholder("اشرح ما تحتاجه بدقة لخدمتك بشكل أفضل...").setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(detailsInput));
        await interaction.showModal(modal);
    }

    // 2. نظام المودال (إنشاء التذكرة)
    if (interaction.isModalSubmit()) {
        const name = interaction.fields.getTextInputValue('user_name');
        const details = interaction.fields.getTextInputValue('user_details');
        const type = interaction.customId.replace('modal_', '');

        await interaction.deferReply({ ephemeral: true });

        // البحث عن أو إنشاء الكاتيجوري
        let category = interaction.guild.channels.cache.find(c => c.name === "TICKETS" && c.type === ChannelType.GuildCategory);
        if (!category) {
            category = await interaction.guild.channels.create({ name: 'TICKETS', type: ChannelType.GuildCategory });
        }

        // البحث عن رتبة الدعم (يجب أن يكون اسم الرتبة "Support" أو سيعمل للإدارة فقط)
        const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'support');

        // إنشاء قناة التذكرة
        const ticketChannel = await interaction.guild.channels.create({
            name: `${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
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
            .setDescription(`مرحباً بك ${interaction.user}، تم استلام طلبك في قسم **${type}**.`)
            .addFields(
                { name: '👤 صاحب الطلب:', value: `**${name}**`, inline: true },
                { name: '📑 تفاصيل الطلب:', value: `\`\`\`${details}\`\`\`` }
            )
            .setTimestamp()
            .setFooter({ text: `نظام إدارة تذاكر ${BRAND_NAME}` });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('reg_btn').setLabel('تسجيل التذكرة').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('rate_btn').setLabel('تقييم الخدمة').setStyle(ButtonStyle.Primary).setEmoji('⭐'),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ content: `${interaction.user} ${staffRole ? `| <@&${staffRole.id}>` : ""}`, embeds: [ticketEmbed], components: [buttons] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك بنجاح في القناة: ${ticketChannel}` });
    }

    // 3. نظام الأزرار (تسجيل، تقييم، إغلاق)
    if (interaction.isButton()) {
        if (interaction.customId === 'reg_btn') {
            await interaction.reply({ content: `**✅ تم تسجيل هذه التذكرة رسمياً في قاعدة بيانات ${BRAND_NAME}.**` });
        }

        if (interaction.customId === 'rate_btn') {
            const rateMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('rating_process').setPlaceholder('قيم مستوى الخدمة...').addOptions([
                    { label: '⭐ ممتاز جداً', value: '5' },
                    { label: '⭐ جيد جداً', value: '4' },
                    { label: '⭐ متوسط', value: '3' },
                ])
            );
            await interaction.reply({ content: 'رأيك يهمنا لتطوير خدماتنا:', components: [rateMenu], ephemeral: true });
        }

        if (interaction.customId === 'close_btn') {
            await interaction.reply("🔒 سيتم إغلاق التذكرة نهائياً خلال 5 ثوانٍ...");
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }

    // معالجة اختيار التقييم
    if (interaction.isStringSelectMenu() && interaction.customId === 'rating_process') {
        await interaction.update({ content: `شكراً لك! تم استلام تقييمك (${interaction.values[0]} نجوم). يسعدنا دائماً خدمتك في ${BRAND_NAME}.`, components: [] });
    }
});

client.login("YOUR_BOT_TOKEN");
