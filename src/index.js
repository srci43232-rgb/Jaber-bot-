const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, ModalBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const { createTranscript } = require('discord-html-transcripts');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;
const PREFIX = '!';

// ========== الايديهات ==========
const GUILD_ID = '1267986207569350709';
const OWNER_ROLE_ID = '1516441623662170172';
const ADMIN_ROLE_ID = '1517120729559203931';
const SUPPORT_ROLE_ID = '1517120729559203931';
const LOG_CHANNEL_ID = '1516499096796664030';
const CLAIM_LOG_CHANNEL_ID = '1516441752716709970';
const TRANSCRIPT_CHANNEL_ID = '1516508105704214629';

let botSettings = {
    panelTitle: '👑│مركز Jaber Pasha الأسطوري│👑',
    panelDescription: '**⟪ اهلاً بك في أفخم نظام دعم على الإطلاق ⟫**\n\n> 🔴 **طلب بنرات** - تصاميم نارية لامعة\n> ⚫ **طلب ستيكر** - ستيكرات فخمة سوداء\n> 🔵 **الدعم الفني** - فريق محترف 24/7\n\n**⚡ استجابة صاروخية | 🔒 سرية تامة | 💎 جودة ملكية**\n\n*اختر فئتك وسيب الباقي علينا*',
    panelColor: '#FF0000',
    panelImage: 'https://i.imgur.com/jaber_pasha.png'
};

const categories = {
    banners: {
        name: 'طلب بنرات',
        emoji: '🔴',
        color: '#FF0000',
        description: 'تصاميم نارية لامعة',
        questions: ['اسمك؟', 'نوع البنر؟', 'الألوان؟', 'المقاس؟', 'ملاحظات؟'],
        allowedRoles: [OWNER_ROLE_ID, ADMIN_ROLE_ID]
    },
    stickers: {
        name: 'طلب ستيكر',
        emoji: '⚫',
        color: '#000000',
        description: 'ستيكرات فخمة سوداء',
        questions: ['اسمك؟', 'الموضوع؟', 'الحجم؟', 'متحرك؟', 'ملاحظات؟'],
        allowedRoles: [OWNER_ROLE_ID, ADMIN_ROLE_ID]
    },
    support: {
        name: 'الدعم الفني',
        emoji: '🔵',
        color: '#0099FF',
        description: 'مساعدة فنية وحل المشاكل',
        questions: ['اسمك؟', 'المشكلة؟', 'متى بدأت؟', 'جربت حلول؟', 'ايدي الحساب؟'],
        allowedRoles: [OWNER_ROLE_ID, ADMIN_ROLE_ID, SUPPORT_ROLE_ID]
    }
};

const activeTickets = new Map();

// ========== لوحة التحكم ==========
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl" style="background:#0f0f0f; color:#fff; font-family: Tahoma;">
        <head><title>لوحة تحكم Jaber Pasha</title></head>
        <body style="max-width:600px; margin:50px auto; padding:20px;">
            <h1 style="color:#FF0000; text-align:center;">👑 لوحة تحكم Jaber Pasha</h1>
            <form method="POST" action="/update">
                <label>عنوان البانل:</label><br>
                <input name="panelTitle" value="${botSettings.panelTitle}" style="width:100%; padding:10px; margin:10px 0; background:#1a1a1a; color:#fff; border:1px solid #FF0000;"><br>
                <label>الوصف:</label><br>
                <textarea name="panelDescription" rows="8" style="width:100%; padding:10px; margin:10px 0; background:#1a1a1a; color:#fff; border:1px solid #FF0000;">${botSettings.panelDescription}</textarea><br>
                <label>رابط الصورة:</label><br>
                <input name="panelImage" value="${botSettings.panelImage}" style="width:100%; padding:10px; margin:10px 0; background:#1a1a1a; color:#fff; border:1px solid #FF0000;"><br>
                <label>اللون Hex:</label><br>
                <input name="panelColor" value="${botSettings.panelColor}" style="width:100%; padding:10px; margin:10px 0; background:#1a1a1a; color:#fff; border:1px solid #FF0000;"><br>
                <button type="submit" style="width:100%; padding:15px; background:#FF0000; color:#fff; border:none; font-size:18px; font-weight:bold; cursor:pointer;">💾 حفظ وتحديث البوت</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/update', (req, res) => {
    botSettings.panelTitle = req.body.panelTitle;
    botSettings.panelDescription = req.body.panelDescription;
    botSettings.panelColor = req.body.panelColor;
    botSettings.panelImage = req.body.panelImage;
    res.send('<h1 style="color:lime; text-align:center; margin-top:100px; font-family:Tahoma;">✅ تم الحفظ! جاري عمل ريستارت...</h1><script>setTimeout(()=>window.location="/",2000)</script>');
    setTimeout(() => process.exit(0), 1000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dashboard running on ${PORT}`));

// ========== الاوامر ==========
client.on('messageCreate', async message => {
    try {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;
        if (message.guild?.id!== GUILD_ID) return;
        
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'setup') {
            if (!message.member.roles.cache.has(OWNER_ROLE_ID) &&!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('❌ الأمر للمالك فقط').catch(() => {});
            }
            
            const embed = new EmbedBuilder()
           .setTitle(botSettings.panelTitle)
           .setDescription(botSettings.panelDescription)
           .setColor(botSettings.panelColor)
           .setImage(botSettings.panelImage)
           .setThumbnail(message.guild.iconURL())
           .setFooter({ text: 'Jaber Pasha System', iconURL: client.user.displayAvatarURL() });
            
            const row = new ActionRowBuilder()
           .addComponents(new ButtonBuilder().setCustomId('open_ticket').setLabel('🎫 فتح تذكرة').setStyle(ButtonStyle.Danger));
            
            await message.channel.send({ embeds: [embed], components: [row] });
            await message.delete().catch(() => {});
        }

        if (command === 'restart') {
            if (!message.member.roles.cache.has(OWNER_ROLE_ID)) return;
            await message.reply('🔄 جاري اعادة التشغيل...');
            process.exit(0);
        }
    } catch (error) {
        console.error('Message Error:', error);
    }
});

// ========== التفاعلات ==========
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.guild?.id!== GUILD_ID) return;

        if (interaction.isButton() && interaction.customId === 'open_ticket') {
            const menu = new StringSelectMenuBuilder()
           .setCustomId('select_category')
           .setPlaceholder('اختر نوع طلبك')
           .addOptions(Object.keys(categories).map(key => ({
                label: categories[key].name,
                value: key,
                emoji: categories[key].emoji,
                description: categories[key].description
            })));
            const row = new ActionRowBuilder().addComponents(menu);
            return await interaction.reply({ content: '**اختر الفئة المناسبة لطلبك:**', components: [row], ephemeral: true });
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'select_category') {
            const categoryKey = interaction.values[0];
            const category = categories[categoryKey];
            const modal = new ModalBuilder().setCustomId(`ticket_form_${categoryKey}`).setTitle(`معلومات ${category.name}`);
            const inputs = category.questions.map((q, i) =>
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                   .setCustomId(`q${i}`)
                   .setLabel(q)
                   .setStyle(i < 3? TextInputStyle.Short : TextInputStyle.Paragraph)
                   .setRequired(true)
                   .setMaxLength(100)
                )
            );
            modal.addComponents(...inputs);
            return await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_form_')) {
            await interaction.deferReply({ ephemeral: true });

            const categoryKey = interaction.customId.replace('ticket_form_', '');
            const category = categories[categoryKey];

            const ticketChannel = await interaction.guild.channels.create({
                name: `🎫-${category.name}-${interaction.user.username}`.slice(0, 100).replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '-'),
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
                   ...category.allowedRoles.map(roleId => ({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ManageMessages]
                    }))
                ]
            });

            let answers = '';
            const answersArray = [];
            for (let i = 0; i < category.questions.length; i++) {
                const answer = interaction.fields.getTextInputValue(`q${i}`);
                answers += `**${category.questions[i]}**\n> ${answer}\n\n`;
                answersArray.push({ question: category.questions[i], answer });
            }

            activeTickets.set(ticketChannel.id, {
                owner: interaction.user.id,
                category: categoryKey,
                claimedBy: null,
                answers: answersArray
            });

            const embed = new EmbedBuilder()
           .setTitle(`${category.emoji} تذكرة ${category.name}`)
           .setDescription(answers)
           .setColor(category.color)
           .setFooter({ text: `تم الفتح بواسطة ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
           .setTimestamp();

            const buttons = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder().setCustomId('claim_ticket').setLabel('✋ استلام التذكرة').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 اغلاق التذكرة').setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `${interaction.user} ||${category.allowedRoles.map(r => `<@&${r}>`).join(' ')}||`, embeds: [embed], components: [buttons] });
            await interaction.editReply({ content: `✅ تم فتح تذكرتك: ${ticketChannel}` });

            const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
               .setTitle('📥 تم فتح تذكرة جديدة')
               .addFields(
                    { name: 'الفئة', value: `${category.emoji} ${category.name}`, inline: true },
                    { name: 'العضو', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                    { name: 'التذكرة', value: `${ticketChannel}`, inline: true },
                    { name: '📋 المعلومات', value: answers.slice(0, 1024) }
                )
               .setColor(category.color)
               .setThumbnail(interaction.user.displayAvatarURL())
               .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        if (interaction.isButton() && interaction.customId === 'claim_ticket') {
            const ticketData = activeTickets.get(interaction.channel.id);
            if (!ticketData) return await interaction.reply({ content: '❌ هذه ليست تذكرة', ephemeral: true });

            const category = categories[ticketData.category];
            if (!category.allowedRoles.some(role => interaction.member.roles.cache.has(role))) {
                return await interaction.reply({ content: '❌ معندكش صلاحية استلام التذكرة دي', ephemeral: true });
            }

            if (ticketData.claimedBy) {
                return await interaction.reply({ content: `❌ التذكرة مستلمة بالفعل من <@${ticketData.claimedBy}>`, ephemeral: true });
            }

            ticketData.claimedBy = interaction.user.id;
            activeTickets.set(interaction.channel.id, ticketData);

            await interaction.reply({ content: `✅ تم استلام التذكرة بواسطة ${interaction.user}` });

            const claimLog = client.channels.cache.get(CLAIM_LOG_CHANNEL_ID);
            if (claimLog) {
                const embed = new EmbedBuilder()
               .setTitle('✋ تم استلام تذكرة')
               .addFields(
                    { name: 'التذكرة', value: `${interaction.channel}`, inline: true },
                    { name: 'المستلم', value: `${interaction.user}`, inline: true },
                    { name: 'صاحب التذكرة', value: `<@${ticketData.owner}>`, inline: true },
                    { name: 'الفئة', value: `${category.emoji} ${category.name}`, inline: true }
                )
               .setColor('#00FF00')
               .setTimestamp();
                await claimLog.send({ embeds: [embed] });
            }
        }

        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            return await interaction.reply({
                content: '**قيّم تجربتك معنا** ⭐',
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('rate_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('rate_4').setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('rate_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('rate_2').setLabel('⭐⭐').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('rate_1').setLabel('⭐').setStyle(ButtonStyle.Danger)
                )],
                ephemeral: true
            });
        }

        if (interaction.isButton() && interaction.customId.startsWith('rate_')) {
            const rating = interaction.customId.split('_')[1];
            const ticketData = activeTickets.get(interaction.channel.id);
            
            await interaction.update({ content: `✅ شكراً لتقييمك ${rating} نجوم! جاري حفظ النسخة واغلاق التذكرة...`, components: [] });

            const transcript = await createTranscript(interaction.channel, {
                limit: -1,
                fileName: `ticket-${interaction.channel.name}.html`,
                poweredBy: false
            });

            const transcriptChannel = client.channels.cache.get(TRANSCRIPT_CHANNEL_ID);
            if (transcriptChannel) {
                const category = categories[ticketData?.category];
                const embed = new EmbedBuilder()
               .setTitle('📁 نسخة تذكرة محفوظة')
               .addFields(
                    { name: 'التذكرة', value: `${interaction.channel.name}`, inline: true },
                    { name: 'صاحب التذكرة', value: `<@${ticketData?.owner}>`, inline: true },
                    { name: 'المستلم', value: ticketData?.claimedBy? `<@${ticketData.claimedBy}>` : 'لم يستلمها احد', inline: true },
                    { name: 'التقييم', value: `${'⭐'.repeat(rating)}`, inline: true },
                    { name: 'الفئة', value: category? `${category.emoji} ${category.name}` : 'غير معروف', inline: true }
                )
               .setColor('#FFD700')
               .setTimestamp();
                await transcriptChannel.send({ embeds: [embed], files: [transcript] });
            }

            const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
               .setTitle('⭐ تم تقييم واغلاق تذكرة')
               .addFields(
                    { name: 'التذكرة', value: `${interaction.channel.name}`, inline: true },
                    { name: 'العضو', value: `<@${ticketData?.owner}>`, inline: true },
                    { name: 'التقييم', value: `${'⭐'.repeat(rating)}`, inline: true }
                )
               .setColor('#FFD700')
               .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            activeTickets.delete(interaction.channel.id);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }

    } catch (error) {
        console.error('Interaction Error:', error);
        const msg = '❌ حصل خطأ. تأكد من تفعيل MESSAGE CONTENT INTENT';
        if (interaction.deferred) await interaction.editReply({ content: msg }).catch(() => {});
        else if (!interaction.replied) await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
});

client.once('clientReady', () => console.log(`Logged in as ${client.user.tag}`));
client.login(TOKEN);
