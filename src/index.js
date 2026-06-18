const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelType, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// حط ايدي رتبة الدعم الفني هنا - لو مش عايز سيبه فاضي ''
const SUPPORT_ROLE_ID = 'ايدي_رتبة_الدعم';

const openTickets = new Map();
const claimedTickets = new Map();

client.on('clientReady', async () => {
    console.log('Bot Ready - الاحترافي شغال');
    console.log(`Logged in as ${client.user.tag}`);

    client.user.setPresence({
        activities: [{
            name: 'نظام التذاكر الاحترافي 🔥',
            type: ActivityType.Watching
        }],
        status: 'dnd'
    });

    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [{ name: 'setup', description: 'ارسال بانل التذاكر' }] }
        );
        console.log('تم تسجيل الامر /setup');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ معندكش صلاحية', ephemeral: true });
        }

const embed = new EmbedBuilder()
 .setTitle("👑│نظام التذاكر الأسطوري│👑")
 .setDescription(`
> **```أهلاً بك في إمبراطورية الدعم الفني```** ✨
> 
> **▬▬▬**
> 
> **⚡ اختر خدمتك من الأزرار بالأسفل وسيتم فتح تذكرة خاصة بك فوراً**
> 
> **🎨 طلب بنر** ⇢ تصميم بنرات احترافية بمقاسات مخصصة
> **✨ طلب استيكر** ⇢ ستكرات ديسكورد فخمة بستايلك
> **🛠️ الدعم الفني** ⇢ حل جميع مشاكلك التقنية
> 
> **▬▬▬**
> 
> **⚠️ مهم جداً:** بعد اختيار الخدمة هتملى بياناتك في نموذج سري
> عشان نقدر نخدمك بأسرع وقت وبأعلى جودة ممكنة
 `)
 .setColor("#FFD700")
 .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
 .setFooter({ 
    text: `⚡ ${interaction.guild.name} │ اختر خدمتك الآن`, 
    iconURL: client.user.displayAvatarURL() 
 })
 .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setCustomId('ticket_banner')
               .setLabel('طلب بنر')
               .setEmoji('🎨')
               .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
               .setCustomId('ticket_sticker')
               .setLabel('طلب استيكر')
               .setEmoji('✨')
               .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
               .setCustomId('ticket_support')
               .setLabel('الدعم الفني')
               .setEmoji('🛠️')
               .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ تم ارسال البانل بنجاح', ephemeral: true });
    }

    if (interaction.isButton()) {
        let modal;

        if (interaction.customId === 'ticket_banner') {
            modal = new ModalBuilder()
               .setCustomId('modal_banner')
               .setTitle('بيانات طلب البنر')
               .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('banner_text')
                           .setLabel('النص المطلوب على البنر')
                           .setStyle(TextInputStyle.Short)
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('banner_size')
                           .setLabel('مقاس البنر المطلوب')
                           .setStyle(TextInputStyle.Short)
                           .setPlaceholder('مثال: 1024x576')
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('banner_colors')
                           .setLabel('الألوان المفضلة')
                           .setStyle(TextInputStyle.Short)
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('banner_details')
                           .setLabel('تفاصيل اضافية')
                           .setStyle(TextInputStyle.Paragraph)
                           .setRequired(false)
                    )
                );
        }

        if (interaction.customId === 'ticket_sticker') {
            modal = new ModalBuilder()
               .setCustomId('modal_sticker')
               .setTitle('بيانات طلب الاستيكر')
               .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('sticker_text')
                           .setLabel('النص/الفكرة للاستيكر')
                           .setStyle(TextInputStyle.Short)
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('sticker_style')
                           .setLabel('ستايل الاستيكر')
                           .setStyle(TextInputStyle.Short)
                           .setPlaceholder('انمي، ميمز، ميني، الخ...')
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('sticker_size')
                           .setLabel('الحجم المطلوب')
                           .setStyle(TextInputStyle.Short)
                           .setPlaceholder('320x320 لديسكورد')
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('sticker_details')
                           .setLabel('تفاصيل اضافية')
                           .setStyle(TextInputStyle.Paragraph)
                           .setRequired(false)
                    )
                );
        }

        if (interaction.customId === 'ticket_support') {
            modal = new ModalBuilder()
               .setCustomId('modal_support')
               .setTitle('بيانات طلب الدعم')
               .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('support_subject')
                           .setLabel('موضوع المشكلة')
                           .setStyle(TextInputStyle.Short)
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('support_details')
                           .setLabel('اشرح مشكلتك بالتفصيل')
                           .setStyle(TextInputStyle.Paragraph)
                           .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                           .setCustomId('support_tried')
                           .setLabel('ايش جربت تحل المشكلة؟')
                           .setStyle(TextInputStyle.Paragraph)
                           .setRequired(false)
                    )
                );
        }

        // زر استلام التذكرة
        if (interaction.customId === 'claim_ticket') {
            if (!openTickets.has(interaction.channel.id)) {
                return interaction.reply({ content: '❌ هذه ليست تذكرة', ephemeral: true });
            }
            if (claimedTickets.has(interaction.channel.id)) {
                return interaction.reply({ content: `❌ التذكرة مستلمة بالفعل من ${claimedTickets.get(interaction.channel.id)}`, ephemeral: true });
            }
            if (SUPPORT_ROLE_ID &&!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
                return interaction.reply({ content: '❌ فقط فريق الدعم يقدر يستلم التذاكر', ephemeral: true });
            }

            claimedTickets.set(interaction.channel.id, interaction.user);

            const claimEmbed = new EmbedBuilder()
               .setColor('#00FF00')
               .setDescription(`✅ **تم استلام التذكرة بواسطة:** ${interaction.user}`)
               .setTimestamp();

            await interaction.reply({ embeds: [claimEmbed] });
            return;
        }

        // زر اغلاق التذكرة مع التقييم
        if (interaction.customId === 'close_ticket') {
            if (!openTickets.has(interaction.channel.id)) {
                return interaction.reply({ content: '❌ هذه ليست تذكرة', ephemeral: true });
            }

            const ticketOwnerId = openTickets.get(interaction.channel.id);

            const ratingEmbed = new EmbedBuilder()
               .setTitle('⭐ قيّم تجربتك')
               .setDescription('> **شكراً لاستخدامك نظام التذاكر**\n> من فضلك قيّم الخدمة من 1 إلى 5 نجوم')
               .setColor('#FFD700')
               .setFooter({ text: 'تقييمك يساعدنا على التطوير' });

            const ratingRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rate_1').setLabel('1⭐').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('rate_2').setLabel('2⭐').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('rate_3').setLabel('3⭐').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rate_4').setLabel('4⭐').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('rate_5').setLabel('5⭐').setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ content: `<@${ticketOwnerId}>`, embeds: [ratingEmbed], components: [ratingRow] });

            // اغلاق بعد 30 ثانية لو مقيمش
            setTimeout(() => {
                if (interaction.channel) {
                    openTickets.delete(ticketOwnerId);
                    openTickets.delete(interaction.channel.id);
                    claimedTickets.delete(interaction.channel.id);
                    interaction.channel.delete().catch(() => {});
                }
            }, 30000);
            return;
        }

        // ازرار التقييم
        if (interaction.customId.startsWith('rate_')) {
            const rating = interaction.customId.split('_')[1];
            const ticketOwnerId = openTickets.get(interaction.channel.id);

            if (interaction.user.id!== ticketOwnerId) {
                return interaction.reply({ content: '❌ فقط صاحب التذكرة يقدر يقيّم', ephemeral: true });
            }

            const stars = '⭐'.repeat(parseInt(rating));
            const finalEmbed = new EmbedBuilder()
               .setTitle('✅ تم التقييم بنجاح')
               .setDescription(`> **شكراً لتقييمك**\n> تقييمك: ${stars}\n> سيتم اغلاق التذكرة خلال 3 ثواني...`)
               .setColor('#00FF00')
               .setTimestamp();

            await interaction.update({ embeds: [finalEmbed], components: [] });

            setTimeout(() => {
                openTickets.delete(ticketOwnerId);
                openTickets.delete(interaction.channel.id);
                claimedTickets.delete(interaction.channel.id);
                interaction.channel.delete().catch(() => {});
            }, 3000);
            return;
        }

        if (modal) await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        if (openTickets.has(interaction.user.id)) {
            return interaction.reply({ content: '❌ عندك تذكرة مفتوحة بالفعل. اقفلها الأول', ephemeral: true });
        }

        let ticketName, embed, fields = [];

        if (interaction.customId === 'modal_banner') {
            ticketName = `🎨-بنر-${interaction.user.username}`;
            fields.push(
                { name: '📝 النص المطلوب', value: interaction.fields.getTextInputValue('banner_text'), inline: true },
                { name: '📐 المقاس', value: interaction.fields.getTextInputValue('banner_size'), inline: true },
                { name: '🎨 الألوان', value: interaction.fields.getTextInputValue('banner_colors'), inline: true },
                { name: '📋 تفاصيل اضافية', value: interaction.fields.getTextInputValue('banner_details') || 'لا يوجد' }
            );
            embed = new EmbedBuilder().setColor('#FF0000').setTitle('🎨 تذكرة طلب بنر');
        }

        if (interaction.customId === 'modal_sticker') {
            ticketName = `✨-استيكر-${interaction.user.username}`;
            fields.push(
                { name: '💬 الفكرة/النص', value: interaction.fields.getTextInputValue('sticker_text'), inline: true },
                { name: '🎭 الستايل', value: interaction.fields.getTextInputValue('sticker_style'), inline: true },
                { name: '📐 الحجم', value: interaction.fields.getTextInputValue('sticker_size'), inline: true },
                { name: '📋 تفاصيل اضافية', value: interaction.fields.getTextInputValue('sticker_details') || 'لا يوجد' }
            );
            embed = new EmbedBuilder().setColor('#2B2D31').setTitle('✨ تذكرة طلب استيكر');
        }

        if (interaction.customId === 'modal_support') {
            ticketName = `🛠️-دعم-${interaction.user.username}`;
            fields.push(
                { name: '📌 الموضوع', value: interaction.fields.getTextInputValue('support_subject') },
                { name: '📄 شرح المشكلة', value: interaction.fields.getTextInputValue('support_details') },
                { name: '🔧 المحاولات السابقة', value: interaction.fields.getTextInputValue('support_tried') || 'لا يوجد' }
            );
            embed = new EmbedBuilder().setColor('#5865F2').setTitle('🛠️ تذكرة دعم فني');
        }

        const permissionOverwrites = [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
        ];

        if (SUPPORT_ROLE_ID && SUPPORT_ROLE_ID!== 'ايدي_رتبة_الدعم') {
            permissionOverwrites.push({
                id: SUPPORT_ROLE_ID,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            permissionOverwrites: permissionOverwrites
        });

        embed.setDescription(`> **مرحباً ${interaction.user}**\n> تم فتح تذكرتك بنجاح، فريقنا هيرد عليك في أقرب وقت`)
           .addFields(fields)
           .addFields(
                { name: '👤 صاحب التذكرة', value: `${interaction.user.tag}`, inline: true },
                { name: '📅 تاريخ الفتح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
           .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
           .setFooter({ text: `ID: ${interaction.user.id}`, iconURL: interaction.guild.iconURL() })
           .setTimestamp();

        const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setCustomId('claim_ticket')
               .setLabel('استلام التذكرة')
               .setEmoji('✋')
               .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
               .setCustomId('close_ticket')
               .setLabel('اغلاق التذكرة')
               .setEmoji('🔒')
               .setStyle(ButtonStyle.Danger)
        );

        const mentionText = SUPPORT_ROLE_ID && SUPPORT_ROLE_ID!== 'ايدي_رتبة_الدعم'? `${interaction.user} | <@&${SUPPORT_ROLE_ID}>` : `${interaction.user}`;
        await ticketChannel.send({ content: mentionText, embeds: [embed], components: [buttonsRow] });

        openTickets.set(ticketChannel.id, interaction.user.id);
        openTickets.set(interaction.user.id, ticketChannel.id);

        await interaction.reply({ content: `✅ تم فتح تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
