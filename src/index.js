const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField, ModalBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js");

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

const tickets = new Map();
const LOG_CHANNEL_ID = "1511144814089994372";

client.once("clientReady", () => {
console.log("Bot Ready - FINAL 100%");
console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
try {
if (!interaction.guild) return;
if (interaction.isChatInputCommand() && interaction.commandName === "setup") {
const file = new AttachmentBuilder("./banner.jpg");
const embed = new EmbedBuilder().setTitle("🎫 نظام التكتات الاحترافي | Jaber Pasha").setDescription("**🔥 أهلاً بك في نظام الدعم الفني الرسمي 🔥**\\n\\n**⚡ لفتح تذكرة جديدة اختر الفئة المناسبة من القائمة**\\n\\n**📜 قوانين التذاكر:**\\n**1-** يُمنع فتح تذاكر عشوائية أو للمزاح\\n**2-** اشرح طلبك بالتفصيل بعد فتح التذكرة\\n**3-** ممنوع منشن الإدارة بدون سبب\\n**4-** انتظر رد فريق الدعم ولا تكرر المنشن\\n\\n**⏰ مدة الرد: 1 - 24 ساعة**\\n**🎯 نخدمكم بكل احترافية**").setColor(0xFF0000).setImage("attachment://banner.jpg").setThumbnail(interaction.guild.iconURL()).setFooter({text:"Jaber Pasha Support • نظام تكتات متطور",iconURL:interaction.guild.iconURL()}).setTimestamp();
const menu = new StringSelectMenuBuilder().setCustomId("ticket_menu").setPlaceholder("🛒 اضغط هنا لاختيار نوع التذكرة").addOptions([{label:"طلب بنرات احترافية",value:"banners",emoji:"🔴",description:"بنرات سيرفرات، شخصية، يوتيوب"},{label:"طلب استيكر مميز",value:"sticker",emoji:"⚫",description:"استيكرات ديسكورد ثابتة ومتحركة"},{label:"الدعم الفني",value:"support",emoji:"🔵",description:"حل مشاكل واستفسارات"}]);
const row = new ActionRowBuilder().addComponents(menu);
await interaction.reply({embeds:[embed],components:[row],files:});
}
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {
const type = interaction.values[0];
const modal = new ModalBuilder().setCustomId(`ticket_form_${type}`).setTitle("📝 املأ بيانات التذكرة كاملة");
const name = new TextInputBuilder().setCustomId("name").setLabel("اسمك الكامل").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50);
const age = new TextInputBuilder().setCustomId("age").setLabel("عمرك").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3);
let detail;
if (type === "banners") detail = new TextInputBuilder().setCustomId("detail").setLabel("البنر الذي تريده").setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder("مثال: بنر سيرفر قيمنق لون أحمر وأسود...");
if (type === "sticker") detail = new TextInputBuilder().setCustomId("detail").setLabel("الاستيكر الذي تريده").setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder("مثال: استيكر متحرك يكتب اسمي...");
if (type === "support") detail = new TextInputBuilder().setCustomId("detail").setLabel("ما هي مشكلتك؟").setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder("اشرح مشكلتك بالتفصيل...");
modal.addComponents(new ActionRowBuilder().addComponents(name),new ActionRowBuilder().addComponents(age),new ActionRowBuilder().addComponents(detail));
await interaction.showModal(modal);
}
if (interaction.isModalSubmit() && interaction.customId.startsWith("ticket_form_")) {
const type = interaction.customId.split("_")[2];
const name = interaction.fields.getTextInputValue("name");
const age = interaction.fields.getTextInputValue("age");
const detail = interaction.fields.getTextInputValue("detail");
const typeName = {banners:"بنرات",sticker:"استيكر",support:"دعم-فني"}[type];
const emoji = {banners:"🔴",sticker:"⚫",support:"🔵"}[type];
const detailTitle = {banners:"تفاصيل البنر",sticker:"تفاصيل الاستيكر",support:"تفاصيل المشكلة"}[type];
const channel = await interaction.guild.channels.create({name:`${emoji}${typeName}-${interaction.user.username}`,type:ChannelType.GuildText,permissionOverwrites:[{id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}]});
tickets.set(channel.id,{userId:interaction.user.id,userName:name,userAge:age,detail:detail,type:typeName,emoji:emoji,claimed:false,claimer:null,claimerTag:null,createdAt:Date.now(),ratingSent:false});
const embed = new EmbedBuilder().setTitle(`${emoji} تذكرة ${typeName} | معلومات العميل`).setColor(0xFF0000).setThumbnail(interaction.user.displayAvatarURL({dynamic:true})).addFields({name:"👤 اسم العميل",value:`\`\`\`${name}\`\`\``,inline:true},{name:"🎂 العمر",value:`\`\`\`${age} سنة\`\`\``,inline:true},{name:"📝 نوع التذكرة",value:`\`\`\`${typeName}\`\`\``,inline:true},{name:`📋 ${detailTitle}`,value:`\`\`\`${detail}\`\`\``,inline:false},{name:"📊 الحالة",value:"```لم يتم الاستلام ⏳```",inline:true},{name:"🙋‍♂️ المستلم",value:"```لا يوجد```",inline:true}).setFooter({text:`فتحها: ${interaction.user.tag} • ID: ${interaction.user.id}`,iconURL:interaction.user.displayAvatarURL()}).setTimestamp();
const btn1 = new ButtonBuilder().setCustomId("claim").setLabel("استلام التذكرة").setStyle(ButtonStyle.Success).setEmoji("🙋‍♂️");
const btn2 = new ButtonBuilder().setCustomId("archive").setLabel("تسجيل التذكرة").setStyle(ButtonStyle.Danger).setEmoji("🗂️");
const row = new ActionRowBuilder().addComponents(btn1,btn2);
await channel.send({content:`مرحباً ${interaction.user}`,embeds:[embed],components:[row]});
await interaction.reply({content:`✅ تم فتح تذكرتك بنجاح ${channel}`,ephemeral:true});
const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
if (logChannel) {
const logEmbed = new EmbedBuilder().setTitle("📥 تم فتح تذكرة جديدة").setColor(0x00FF00).addFields({name:"العميل",value:`${interaction.user}`,inline:true},{name:"النوع",value:typeName,inline:true},{name:"التذكرة",value:`${channel}`,inline:true}).setTimestamp();
logChannel.send({embeds:[logEmbed]}).catch(()=>{});
}
}
if (interaction.isButton()) {
if (!interaction.channel) return;
const ticket = tickets.get(interaction.channel.id);
if (!ticket &&!interaction.customId.startsWith("rate_")) return;
if (interaction.customId === "claim") {
if (ticket.claimed) return interaction.reply({content:"⚠️ التذكرة مستلمة بالفعل",ephemeral:true});
ticket.claimed = true;
ticket.claimer = interaction.user.id;
ticket.claimerTag = interaction.user.tag;
const msg = await interaction.channel.messages.fetch({limit:10});
const embedMsg = msg.find(m=>m.embeds.length>0);
if (embedMsg) {
const oldEmbed = embedMsg.embeds[0];
const newEmbed = EmbedBuilder.from(oldEmbed).spliceFields(4,2,{name:"📊 الحالة",value:"```تم الاستلام ✅```",inline:true},{name:"🙋‍♂️ المستلم",value:`\`\`\`${interaction.user.tag}\`\`\``,inline:true});
await embedMsg.edit({embeds:[newEmbed]});
}
await interaction.reply({content:`✅ تم استلام التذكرة بواسطة ${interaction.user}`});
const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
if (logChannel) {
const logEmbed = new EmbedBuilder().setTitle("تم استلام تذكرة 🙋‍♂️").setColor(0xFFAA00).addFields({name:"التذكرة",value:`${interaction.channel}`,inline:false},{name:"المستلم",value:`${interaction.user}`,inline:false},{name:"العميل",value:`<@${ticket.userId}>`,inline:false}).setTimestamp();
logChannel.send({embeds:[logEmbed]}).catch(()=>{});
}
}
if (interaction.customId === "archive") {
if (ticket.ratingSent) return interaction.reply({content:"⚠️ تم إرسال التقييم مسبقاً",ephemeral:true});
ticket.ratingSent = true;
await interaction.reply({content:"🗂️ **تم تسجيل التذكرة - الرجاء تقييم الخدمة**"});
const ratingEmbed = new EmbedBuilder().setTitle("⭐ قيّم تجربتك مع الدعم الفني").setDescription("**شكراً لاستخدامك نظام التكتات**\\n\\n**كيف كانت تجربتك معنا؟**\\nاختر تقييمك من الأزرار بالأسفل\\n**⚠️ سيتم مسح التذكرة تلقائياً بعد 5 ثواني من التقييم**").setColor(0xFF0000).setThumbnail(interaction.guild.iconURL()).setFooter({text:"رأيك يهمنا لتطوير الخدمة"});
const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`rate_5_${ticket.userId}_${ticket.claimer||"none"}_${interaction.channel.id}`).setLabel("ممتاز").setStyle(ButtonStyle.Success).setEmoji("⭐"),new ButtonBuilder().setCustomId(`rate_4_${ticket.userId}_${ticket.claimer||"none"}_${interaction.channel.id}`).setLabel("جيد جداً").setStyle(ButtonStyle.Primary).setEmoji("🌟"),new ButtonBuilder().setCustomId(`rate_3_${ticket.userId}_${ticket.claimer||"none"}_${interaction.channel.id}`).setLabel("جيد").setStyle(ButtonStyle.Primary).setEmoji("✨"),new ButtonBuilder().setCustomId(`rate_2_${ticket.userId}_${ticket.claimer||"none"}_${interaction.channel.id}`).setLabel("مقبول").setStyle(ButtonStyle.Secondary).setEmoji("💫"),new ButtonBuilder().setCustomId(`rate_1_${ticket.userId}_${ticket.claimer||"none"}_${interaction.channel.id}`).setLabel("سيء").setStyle(ButtonStyle.Danger).setEmoji("❌"));
await interaction.channel.send({content:`<@${ticket.userId}>`,embeds:[ratingEmbed],components:[row]});
}
if (interaction.customId.startsWith("rate_")) {
const[,stars,userId,claimerId,channelId]=interaction.customId.split("_");
const starsText={"5":"⭐⭐⭐⭐⭐ ممتاز","4":"⭐⭐⭐⭐ جيد جداً","3":"⭐⭐⭐ جيد","2":"⭐⭐ مقبول","1":"⭐ سيء"}[stars];
const ticket=tickets.get(channelId);
if(!ticket)return;
await interaction.update({content:`✅ **شكراً لتقييمك: ${starsText}**\\n🗂️ جاري حفظ التذكرة ومسحها خلال 5 ثواني...`,embeds:[],components:[]});
const messages=await interaction.channel.messages.fetch({limit:100});
let transcript=`════════════════════════════════════════\\n سجل محادثة التذكرة - Jaber Pasha\\n════════════════════════════════════════\\n\\nاسم التذكرة: ${interaction.channel.name}\\nنوع التذكرة: ${ticket.type}\\nالعميل: ${ticket.userName} (${userId})\\nالمستلم: ${ticket.claimerTag||"لا يوجد"}\\nالتقييم: ${starsText}\\nمدة التذكرة: ${Math.floor((Date.now()-ticket.createdAt)/1000/60)} دقيقة\\nتاريخ الإنشاء: ${new Date(ticket.createdAt).toLocaleString("ar-EG")}\\n\\n════════════════════════════════════════\\n المحادثة\\n════════════════════════════════════════\\n\\n`;
messages.reverse().forEach(msg=>{if(!msg.author.bot||msg.embeds.length>0){const time=new Date(msg.createdTimestamp).toLocaleTimeString("ar-EG");transcript+=`[${time}] ${msg.author.tag}:\\n`;if(msg.content)transcript+=`${msg.content}\\n`;if(msg.embeds.length>0){msg.embeds.forEach(e=>{if(e.title)transcript+=` 📌 ${e.title}\\n`;if(e.description)transcript+=` ${e.description}\\n`;e.fields?.forEach(f=>transcript+=` • ${f.name}: ${f.value}\\n`);});}transcript+=`\\n`;}});
transcript+=`\\n════════════════════════════════════════\\n نهاية السجل\\n════════════════════════════════════════`;
const logChannel=interaction.client.channels.cache.get(LOG_CHANNEL_ID);
if(logChannel){
const duration=Math.floor((Date.now()-ticket.createdAt)/1000/60);
const logEmbed=new EmbedBuilder().setTitle("تقييم + تسجيل تذكرة ⭐").setColor(stars>=4?0x00FF00:stars>=3?0xFFAA00:0xFF0000).addFields({name:"العميل",value:`<@${userId}>`,inline:false},{name:"التقييم",value:starsText,inline:false},{name:"المستلم",value:claimerId!=="none"?`<@${claimerId}>`:"لا يوجد",inline:false},{name:"مدة التذكرة",value:`${duration} دقيقة`,inline:false},{name:"التذكرة",value:`${ticket.emoji}${ticket.type}-jaber_pasha`,inline:false}).setFooter({text:"Jaber Pasha Support System"}).setTimestamp();
await logChannel.send({embeds:[logEmbed]}).catch(()=>{});
const transcriptFile=new AttachmentBuilder(Buffer.from("\uFEFF" + transcript,"utf-8"),{name:`transcript-${interaction.channel.name}.txt`});
await logChannel.send({files:[transcriptFile]}).catch(()=>{});
}
setTimeout(()=>{interaction.channel.delete().catch(()=>{});tickets.delete(channelId);},5000);
}
}
} catch (err) {
console.log("Error:", err.message);
}
});

client.login(process.env.TOKEN);
