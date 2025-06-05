const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const qrcode = require('qrcode');
const fs = require('fs');
require('dotenv').config();

// WhatsApp setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// ✅ Google Sheets setup - parsing private key correctly
const creds = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  token_uri: "https://oauth2.googleapis.com/token",
};

const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

// إرسال الرسائل المعلقة
async function sendPendingMessages() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['send_log'];
  const rows = await sheet.getRows();

  for (let row of rows) {
    if (row.status !== 'pending') continue;

    const name = row.name || '';
    const phone = row.phone?.toString().replace(/\D/g, '');
    const chatId = `${phone}@c.us`;

    const message = `السلام عليكم ورحمة الله كيفك ${name} 🤍\n\nتم رفع المحاضره عالمنصه ✅`;

    try {
      await client.sendMessage(chatId, message);
      row.status = 'done';
      row.timestamp = new Date().toISOString();
      await row.save();
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Sent to ${name} - ${phone}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${name} (${phone}): ${err.message}`);
    }
  }
}

// QR Code event
client.on('qr', async (qr) => {
  console.log('QR code ready, open /qr in browser');
  await qrcode.toFile('qr.png', qr);
});

// On ready
client.on('ready', async () => {
  console.log('✅ WhatsApp is ready!');
  setInterval(async () => {
    console.log('🔁 Checking for pending messages...');
    await sendPendingMessages();
  }, 15000);
});

// Start
client.initialize();
