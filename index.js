const { Client, RemoteAuth } = require('whatsapp-web.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { FirestoreStore } = require('whatsapp-web.js/src/store/remote-auth');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDlVNLjN8QMcQLMDO6lNrjDv5EbgPtlxv4",
  authDomain: "whatsapp-bot-65a1c.firebaseapp.com",
  projectId: "whatsapp-bot-65a1c",
  storageBucket: "whatsapp-bot-65a1c.firebasestorage.app",
  messagingSenderId: "740872188130",
  appId: "1:740872188130:web:96cde883bf297442eeaebb",
  measurementId: "G-TV7G5FKXBF"
};

// ✅ Init Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ WhatsApp Client with RemoteAuth
const client = new Client({
  authStrategy: new RemoteAuth({
    store: new FirestoreStore({ firestore: db, path: 'sessions' }),
    backupSyncIntervalMs: 300000,
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// ✅ Google Sheets setup
const creds = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  token_uri: "https://oauth2.googleapis.com/token",
};

const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

// ✉️ إرسال الرسائل المعلقة
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

// QR Code display
client.on('qr', (qr) => {
  console.log('📸 Scan this QR code:');
  qrcode.generate(qr, { small: true });
});

// On Ready
client.on('ready', async () => {
  console.log('✅ WhatsApp is ready!');
  setInterval(async () => {
    console.log('🔁 Checking for pending messages...');
    await sendPendingMessages();
  }, 15000);
});

// Start
client.initialize();
