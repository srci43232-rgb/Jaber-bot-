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
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ]
});

// إعدادات الفخامة
const LUXURY_RED = "#FF0000"; 
const BRAND = "jaber_pasha";

client.once('ready', () => {
    console.log(`👑 الإمبراطور ${BRAND} متصل الآن وجاهز لخدمتكم!`);
});

// --- لوحة التحكم الرئيسية ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const mainPanel = new EmbedBuilder()
            .setTitle(`👑 الصرح الإمبراطوري لخدمات ${BRAND}`)
            .setDescription(`
                **مرحباً بك في وجهة التميز والإبداع** 💎
                نحن هنا لنحول أفكارك إلى واقع ملموس بلمسات فنية عالمية.

                🔴 **قسم البنرات الاحترافية (Red Shiny)**
                *تصاميم تعكس القوة والهيبة بلمسات حمراء لامعة.*

                ⚫ **قسم الاستيكرات الملكية (Black Shiny)**
                *أناقة اللون الأسود الفاخر في كل تفصيل.*

                🔵 **مركز الدعم والمساعدة (Blue Shiny)**
                *خدمة كبار الشخصيات لحل كافة الاستفسارات.*

                ---
                ℹ️ **يرجى اختيار القسم الموقر من القائمة أدناه لبدء الطلب.**
            `)
            .setColor(LUXURY_RED)
            .setThumbnail(message.guild.iconURL())
            .setImage('https://i.imgur.com/example_red_banner.png') // يمكنك وضع رابط صورة فخمة هنا
            .setFooter({ text: `المنصة الرسمية لـ ${BRAND}`, iconURL: client.user.displayAvatarURL() });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('luxury_menu')
                .setPlaceholder('إختر الوجهة المطلوبة من هنا...')
                .addOptions([
                    { label: 'طلب بنر (Red Shiny)', value: 'banner', emoji: '🔴', description: 'لطلب تصميم بنر إحترافي فخم' },
                    { label: 'طلب استيكر (Black Shiny)', value: 'sticker', emoji: '⚫', description: 'لطلب استيكرات ملكية مميزة' },
                    { label: 'الدعم الفني (Blue Shiny)', value: 'support', emoji: '🔵', description: 'للتواصل المباشر مع الإدارة' },
                ]),
        );

        await message.channel.send({ embeds: [mainPanel], components: [menu] });
    }
});

// --- التعامل مع التفاعلات ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. الاستمارة (Modal)
    if (interaction.isStringSelectMenu() && interaction.customId === 'luxury_menu') {
        const type = interaction.values[0];
        const modal = new ModalBuilder()
            .setCustomId(`modal_${type}`)
            .setTitle(`استمارة تقديم الطلب - ${BRAND}`);

        const nameInput = new TextInputBuilder()
            .setCustomId('u_name')
            .setLabel("الاسم الكريم")
            .setPlaceholder("يرجى كتابة اسمك الموقر هنا...")
            .setStyle(TextInputStyle.Short).setRequired(true);

        const detailsInput = new TextInputBuilder()
            .setCustomId('u_details')
            .setLabel("تفاصيل طلبك الفاخر")
            .setPlaceholder("اشرح لنا تفاصيل ما تحتاجه بدقة لنبدء العمل...")
            .setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(detailsInput));
        await interaction.showModal(modal);
    }

    // 2. إنشاء التذكرة
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const name = interaction.fields.getTextInputValue('u_name');
        const details = interaction.fields.getTextInputValue('u_details');
        const type = interaction.customId.replace('modal_', '');

        let category = interaction.guild.channels.cache.find(c => c.name === "TICKETS" && c.type === ChannelType.GuildCategory);
        if (!category) category = await interaction.guild.channels.create({ name: 'TICKETS', type: ChannelType.GuildCategory });

        const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'support');

        const channel = await interaction.guild.channels.create({
            name: `${type}-${interaction.user.username}`,
            parent: category.id,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                ...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 تذكرة جديدة | صرح ${BRAND}`)
            .setColor(LUXURY_RED)
            .setDescription(`
                **مرحباً بك في عالم ${BRAND}** ✨
                لقد تلقينا طلبك الموقر بكل اهتمام، وفريقنا المختص سيتواصل معك في أقرب وقت.

                ---
                👤 **مقدم الطلب:** ${name}
                📑 **بيانات الطلب:** \`\`\`${details}\`\`\`
                ---
                *يرجى انتظار الرد، نحن نعمل على راحتكم.*
            `)
            .setTimestamp()
            .setFooter({ text: `نظام إدارة التذاكر الفخم - ${BRAND}` });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('reg_btn').setLabel('تسجيل التذكرة').setStyle(ButtonStyle.Success).setEmoji('📜'),
            new ButtonBuilder().setCustomId('rate_btn').setLabel('تقييم الخدمة').setStyle(ButtonStyle.Primary).setEmoji('⭐'),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `${interaction.user} ${staffRole ? `| <@&${staffRole.id}>` : ""}`, embeds: [ticketEmbed], components: [buttons] });
        await interaction.editReply({ content: `✅ تم إنشاء تذكرتك بنجاح في القناة: ${channel}` });
    }

    // 3. تشغيل الأزرار
    if (interaction.isButton()) {
        if (interaction.customId === 'reg_btn') {
            const regEmbed = new EmbedBuilder()
                .setDescription(`✅ **تم تسجيل هذه التذكرة رسمياً في أرشيف ${BRAND}.**`)
                .setColor(LUXURY_RED);
            await interaction.reply({ embeds: [regEmbed] });
        }

        if (interaction.customId === 'rate_btn') {
            const rateMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('rate_action')
                    .setPlaceholder('قم بتقييم تجربتك الملكية معنا...')
                    .addOptions([
                        { label: 'إمتياز 5/5', value: '5', emoji: '💎' },
                        { label: 'جيد جداً 4/5', value: '4', emoji: '⭐' },
                        { label: 'متوسط 3/5', value: '3', emoji: '✨' },
                    ]),
            );
            await interaction.reply({ content: 'نحن نقدر رأيك كثيراً:', components: [rateMenu], ephemeral: true });
        }

        if (interaction.customId === 'close_btn') {
            await interaction.reply({ content: "🔒 **يتم الآن أرشفة وإغلاق التذكرة...**" });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }

    // 4. معالجة التقييم
    if (interaction.isStringSelectMenu() && interaction.customId === 'rate_action') {
        await interaction.update({ content: `✅ شكراً لك! تم استلام تقييمك (${interaction.values[0]} نجوم). يسعدنا خدمتك دائماً في ${BRAND}.`, components: [] });
    }
});

client.login(process.env.TOKEN);
