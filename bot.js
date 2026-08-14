const http = require('http');
const { createBot } = require('./index.js'); // Mengambil eksport utama dari index.js projek[cite: 2]

// ==========================================
// 1. HTTP DUMMY SERVER (Untuk Hosting 24/7)
// ==========================================
const HTTP_PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.write('Bot Minecraft Bedrock sedang berjalan aktif!');
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`[HTTP] Server dummy aktif pada port ${HTTP_PORT}`);
});

// ==========================================
// 2. TETAPAN BOT MINECRAFT BEDROCK
// ==========================================
const BOT_CONFIG = {
  host: process.env.SERVER_HOST || 'bedrock-eu-poland.orc.host', // Masukkan IP / Host
  port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 19204, // Port dikunci ke Integer
  username: process.env.BOT_NAME || 'BedrockBot',               // Nama Bot
  offline: true,                                                 // Offline/Cracked (Tanpa Xbox Live)
  skipPing: true,                                                // Buka true supaya tidak terikat ke port default 19132[cite: 2]
  physicsEnabled: false                                          // Matikan fizik elak daripada di-kick (bad_packet)[cite: 2]
};

let bot = null;

// ==========================================
// 3. FUNGSI PELANCARAN & PERISTIWA BOT
// ==========================================
function startBot() {
  console.log(`[Bot] Menyambung ke ${BOT_CONFIG.host}:${BOT_CONFIG.port}...`);
  
  bot = createBot(BOT_CONFIG);

  // Peristiwa: Berjaya Menyambung
  bot.on('connect', () => {
    console.log('[+] Sambungan berjaya dibuat!');
  });

  // Peristiwa: Berjaya Log Masuk (start_game packet received)
  bot.on('login', () => {
    console.log('[+] Log masuk berjaya!');
    if (bot.game) {
      console.log(`[+] Mod Permainan: ${bot.game.gameMode} | Dimensi: ${bot.game.dimension}`);
    }
  });

  // Peristiwa: Bot muncul di dalam dunia Minecraft (Spawn)
  bot.on('spawn', () => {
    console.log(`[+] Bot muncul pada koordinat: ${bot.position}`);
    bot.chat('Bot Bedrock sedia digunakan!');
  });

  // Peristiwa: Mendengar dan membalas Chat
  bot.on('chat', (username, message) => {
    // Abaikan mesej daripada bot sendiri
    if (username === bot.username) return;

    console.log(`<${username}>: ${message}`);

    // Contoh Arahan Chat Sederhana
    const msg = message.toLowerCase();
    
    if (msg === '!ping') {
      bot.chat('pong! 🏓');
    } else if (msg === '!hp') {
      bot.chat(`Health: ${bot.health ?? 'N/A'}/20 | Food: ${bot.food ?? 'N/A'}/20`);
    } else if (msg === '!pos') {
      bot.chat(`Posisi saya: ${bot.position}`);
    }
  });

  // Peristiwa: Terputus Sambungan atau Di-kick
  bot.on('kicked', (reason) => {
    console.log('[KICKED] Bot telah dikeluarkan:', reason);
  });

  bot.on('end', (reason) => {
    console.log('[END] Sambungan bot terputus:', reason);
    console.log('[RECONNECT] Mencuba menyambung semula dalam masa 10 saat...');
    setTimeout(startBot, 10000); // Reconnect automatik selepas 10 detik
  });

  // Peristiwa: Pengendalian Ralat
  bot.on('error', (err) => {
    console.error('[ERROR] Ralat berlaku:', err.message);
  });
}

// Jalankan bot
startBot();
