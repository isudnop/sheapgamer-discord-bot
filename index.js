require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, Events, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const Parser = require('rss-parser');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const RSS_FEED_URL = process.env.RSS_FEED_URL || 'https://rss.app/feeds/COiTZRnT26oDqrJf.xml';
const RSS_CHECK_INTERVAL_MS = 900000; // 15 minutes

const GUID_FILE = path.resolve(__dirname, 'last_processed_guid.json');
const CONFIG_FILE = path.resolve(__dirname, 'config.json');
const GUILD_SETUP_FILE = path.resolve(__dirname, 'guild_setup.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
});

const parser = new Parser();
let lastProcessedGuid = null;
let config = {};
let guildSetup = {};

async function loadJsonFile(filePath, fallback = {}) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return fallback;
    }
}

async function saveJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function loadLastProcessedGuid() {
    const data = await loadJsonFile(GUID_FILE, { lastGuid: null });
    lastProcessedGuid = data.lastGuid;
}

async function saveLastProcessedGuid(guid) {
    await saveJsonFile(GUID_FILE, { lastGuid: guid });
}

async function loadConfig() {
    config = await loadJsonFile(CONFIG_FILE);
}

async function saveConfig() {
    await saveJsonFile(CONFIG_FILE, config);
}

async function loadGuildSetup() {
    guildSetup = await loadJsonFile(GUILD_SETUP_FILE);
}

async function saveGuildSetup() {
    await saveJsonFile(GUILD_SETUP_FILE, guildSetup);
}

function getImageFromEntry(entry) {
    let imageUrl = null;

    if (entry.media?.content?.length) {
        for (const media of entry.media.content) {
            if (media.url && media.type?.startsWith('image/')) {
                imageUrl = media.url;
                break;
            }
        }
    }

    if (!imageUrl && entry.enclosure?.url?.startsWith('http') && entry.enclosure.type?.startsWith('image/')) {
        imageUrl = entry.enclosure.url;
    }

    if (!imageUrl && (entry.summary || entry.content)) {
        const html = entry.content || entry.summary;
        const match = html.match(/<img[^>]+src="([^">]+)"/i);
        if (match) imageUrl = match[1];
    }

    return imageUrl?.startsWith('http') ? imageUrl : null;
}

async function checkRssFeed() {
    await loadGuildSetup();
    try {
        const feed = await parser.parseURL(RSS_FEED_URL);
        if (!feed?.items?.length) return;

        let newItems = [];

        if (!lastProcessedGuid) {
            newItems = feed.items;
            console.log("🔰 First run, all items will be sent.");
        } else {
            for (const entry of feed.items) {
                const guid = entry.guid || entry.id || entry.link || `NO_GUID_${entry.title}_${Date.now()}`;
                if (guid === lastProcessedGuid) break;
                newItems.push(entry);
            }
        }

        newItems = newItems.reverse();

        for (const [guildId, channelId] of Object.entries(config)) {
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (!channel?.isTextBased()) continue;

            const isFirstTime = !guildSetup[guildId];
            const itemsToSend = isFirstTime ? feed.items.slice().reverse() : newItems;

            if (isFirstTime) {
                console.log(`📌 First time in guild ${guildId}, sending all items`);
                guildSetup[guildId] = true;
                await saveGuildSetup();
            }

            for (const entry of itemsToSend) {
                const embed = new EmbedBuilder()
                    .setTitle(entry.title || "No Title")
                    .setURL(entry.link || "")
                    .setColor(0x0099FF);

                const img = getImageFromEntry(entry);
                if (img) embed.setImage(img);
                if (entry.isoDate) embed.setTimestamp(new Date(entry.isoDate));

                await channel.send({ embeds: [embed] }).catch(console.error);
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        const latestGuid = feed.items[0].guid || feed.items[0].id || feed.items[0].link;
        if (latestGuid) {
            await saveLastProcessedGuid(latestGuid);
            lastProcessedGuid = latestGuid;
        }

    } catch (err) {
        console.error("⚠️ RSS Check Error:", err);
    }
}

client.on(Events.MessageCreate, async message => {
  if (!message.guild || !message.member.permissions.has("Administrator")) return;
  if (message.content === '!rss-setup') {
    try {
      const allChannels = await message.guild.channels.fetch();
      const textChannels = [...allChannels.values()].filter(c => c.isTextBased() && (c.type === 0 || c.type === 5));

      if (textChannels.length === 0) {
        await message.reply("ไม่พบห้อง text ที่ใช้งานได้ในกิลด์นี้");
        return;
      }

      const chunks = [];
      for (let i = 0; i < textChannels.length; i += 25) {
        chunks.push(textChannels.slice(i, i + 25));
      }

      const rows = chunks.map((chunk, idx) => {
        const menu = new StringSelectMenuBuilder()
          .setCustomId(`select_channel_${idx}`)
          .setPlaceholder(`เลือกห้องที่จะให้โพสต์ RSS (ชุดที่ ${idx + 1})`)
          .addOptions(chunk.map(c => ({
            label: `#${c.name}`,
            value: c.id,
          })));
        return new ActionRowBuilder().addComponents(menu);
      });

      await message.reply({ content: 'เลือกห้องจากด้านล่าง: *ถ้าหากห้องเยอะจะแบ่งออกเป็นหลายส่วนเนื่องจากข้อจำกัดของ discord', components: rows });

    } catch (err) {
      console.error("เกิดข้อผิดพลาดขณะโหลดช่อง:", err);
      await message.reply("เกิดข้อผิดพลาดในการโหลดห้อง ลองใหม่อีกครั้งนะ");
    }
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isStringSelectMenu()) return;
  if (!interaction.customId.startsWith('select_channel_')) return;

  const selectedChannelId = interaction.values[0];
  config[interaction.guildId] = selectedChannelId;
  await saveConfig();

  delete guildSetup[interaction.guildId];
  await saveGuildSetup();

  await interaction.reply({ content: `✅ จะโพสต์ RSS ไปที่ <#${selectedChannelId}>`, ephemeral: true });

  await checkRssFeed();
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    const sent = await message.reply('🏓 Pong!');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit(`🏓 Pong! Latency: **${latency}ms** | API: **${Math.round(client.ws.ping)}ms**`);
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content === '!botinfo') {
    const uptime = process.uptime(); // วินาที
    const formatUptime = new Date(uptime * 1000).toISOString().substr(11, 8); // HH:mm:ss

    const embed = new EmbedBuilder()
      .setTitle('🤖 ข้อมูลระบบของบอท')
      .setColor(0x00AE86)
      .addFields(
        { name: '🕒 Uptime', value: `${formatUptime}`, inline: true },
        { name: '💾 Memory', value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: '🧠 CPU', value: os.cpus()[0].model, inline: false },
        { name: '💻 Platform', value: `${os.platform()} (${os.arch()})`, inline: true },
        { name: '📡 Node.js', value: process.version, inline: true },
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content === '!help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 คำสั่งทั้งหมดของบอท')
      .setColor(0x5865F2)
      .setDescription('รายการคำสั่งที่คุณสามารถใช้ได้:')
      .addFields(
        { name: '`!ping`', value: 'ทดสอบความเร็วระหว่างบอทกับ Discord (latency)', inline: false },
        { name: '`!botinfo`', value: 'แสดงข้อมูลระบบที่รันบอท เช่น CPU, RAM, uptime', inline: false },
        { name: '`!rss-setup`', value: 'ตั้งค่าห้องที่ใช้สำหรับโพสต์ RSS สำหรับเซิร์ฟเวอร์นี้', inline: false },
        { name: '`!help`', value: 'แสดงคำสั่งทั้งหมดที่มีอยู่', inline: false }
      )
      .setFooter({ text: `โดย ${client.user.username}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply(`🏓 Pong! API Latency: ${Math.round(client.ws.ping)}ms`);
  }

  else if (commandName === 'botinfo') {
    const uptime = process.uptime();
    const formatUptime = new Date(uptime * 1000).toISOString().substr(11, 8);

    const embed = new EmbedBuilder()
      .setTitle('🤖 ข้อมูลระบบของบอท')
      .setColor(0x00AE86)
      .addFields(
        { name: '🕒 Uptime', value: `${formatUptime}`, inline: true },
        { name: '💾 Memory', value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: '🧠 CPU', value: os.cpus()[0].model, inline: false },
        { name: '💻 Platform', value: `${os.platform()} (${os.arch()})`, inline: true },
        { name: '📡 Node.js', value: process.version, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 คำสั่งทั้งหมดของบอท')
      .setColor(0x5865F2)
      .setDescription('คำสั่งที่รองรับในเวอร์ชัน Slash Command:')
      .addFields(
        { name: '/ping', value: 'ทดสอบความเร็วระหว่างบอทกับ Discord' },
        { name: '/botinfo', value: 'แสดงข้อมูลระบบที่รันบอท' },
        { name: '/rss-setup', value: 'เลือกห้องโพสต์ RSS สำหรับเซิร์ฟเวอร์นี้' },
        { name: '/help', value: 'ดูคำสั่งทั้งหมด' }
      );

    await interaction.reply({ embeds: [embed] });
  }

 else if (commandName === 'rss-setup') {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "คุณต้องเป็นแอดมินเพื่อใช้คำสั่งนี้", ephemeral: true });
  }

  try {
    await interaction.deferReply({ ephemeral: true }); // แจ้ง Discord ว่ากำลังโหลด

    const allChannels = await interaction.guild.channels.fetch();
    const textChannels = [...allChannels.values()].filter(c =>
      c.isTextBased() && (c.type === 0 || c.type === 5)
    );

    if (textChannels.length === 0) {
      return interaction.editReply({ content: "ไม่พบห้อง text ที่ใช้งานได้ในกิลด์นี้" });
    }

    const chunks = [];
    for (let i = 0; i < textChannels.length; i += 25) {
      chunks.push(textChannels.slice(i, i + 25));
    }

    const rows = chunks.map((chunk, idx) => {
      const menu = new StringSelectMenuBuilder()
        .setCustomId(`select_channel_${idx}`)
        .setPlaceholder(`เลือกห้องสำหรับโพสต์ RSS (ชุด ${idx + 1})`)
        .addOptions(chunk.map(c => ({
          label: `#${c.name}`,
          value: c.id,
        })));
      return new ActionRowBuilder().addComponents(menu);
    });

    // แทนที่จะใช้ interaction.reply() เพราะ deferReply() ไปแล้ว ต้องใช้ editReply()
    await interaction.editReply({
      content: 'เลือกห้องที่ต้องการให้โพสต์ RSS ด้านล่าง (หากห้องเยอะจะแบ่งเป็นหลายเมนู)',
      components: rows,
    });

    // ถ้า handleRssSetup ต้องทำอะไรต่อหลังจากส่งเมนู ให้เรียกที่นี่
    // แต่ถ้า handleRssSetup มี interaction.reply/editReply อีก อย่าซ้ำกันนะ
    // await handleRssSetup(interaction);

  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการโหลดห้อง:", err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: "เกิดข้อผิดพลาดขณะโหลดห้อง ลองใหม่อีกครั้งนะ", components: [] });
    } else {
      await interaction.reply({ content: "เกิดข้อผิดพลาดขณะโหลดห้อง ลองใหม่อีกครั้งนะ", ephemeral: true });
    }
  }
}
});

client.on('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    await loadConfig();
    await loadGuildSetup();
    await loadLastProcessedGuid();

    setInterval(checkRssFeed, RSS_CHECK_INTERVAL_MS);
    await checkRssFeed();
});

client.login(DISCORD_BOT_TOKEN);