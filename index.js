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

// Google Sheets setup
const creds = require('./credentials.json');
const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

// إرسال الرسائل المعلقة
async function sendPendingMessages() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['send_log'];
  const rows = await sheet.getRows();

  for (let row of rows) {
    if (row.status !== 'pending') continue;

    const name = row.name;
    const phone = row.phone;
    const message = row.message.replace('{name}', name);
    const chatId = phone + "@c.us";

    try {
      await client.sendMessage(chatId, message);
      row.status = 'done';
      row.timestamp = new Date().toISOString();
      await row.save();
      console.log(`✅ Sent to ${name} - ${phone}`);
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

// On ready, check every 15 seconds
client.on('ready', async () => {
  console.log('✅ WhatsApp is ready!');

  // يشيّك كل 15 ثانية
  setInterval(async () => {
    console.log('🔁 Checking for pending messages...');
    await sendPendingMessages();
  }, 15000);
});

// Start
client.initialize();
