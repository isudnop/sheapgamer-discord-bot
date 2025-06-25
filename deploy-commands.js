// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('ทดสอบความเร็วระหว่างบอทกับ Discord'),
  new SlashCommandBuilder().setName('botinfo').setDescription('แสดงข้อมูลของบอทและระบบที่รัน'),
  new SlashCommandBuilder().setName('help').setDescription('แสดงรายการคำสั่งทั้งหมด'),
  new SlashCommandBuilder().setName('rss-setup').setDescription('ตั้งค่าห้องสำหรับโพสต์ RSS'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('📡 กำลังลงทะเบียน Slash Command...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // หรือใช้ Routes.applicationGuildCommands(clientId, guildId) สำหรับ testing
      { body: commands }
    );

    console.log('✅ ลงทะเบียนคำสั่งสำเร็จ!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการลงทะเบียน:', error);
  }
})();