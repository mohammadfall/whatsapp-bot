# 📱 WhatsApp Bot with Google Sheets Integration

A Node.js-based bot that sends automated WhatsApp messages using [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) and pulls message data from a Google Spreadsheet.

---

## ✨ Features

- ✅ Auto-send messages from a Google Sheet (`send_log`).
- ✅ Updates status to `done` after sending.
- ✅ Compatible with dynamic message templates.
- ✅ QR-based WhatsApp authentication.
- ✅ `.env` protected keys & settings.

---

## ⚙️ Technologies

- Node.js
- whatsapp-web.js
- google-spreadsheet
- dotenv
- qrcode

---

## 📂 Folder Structure

```bash
whatsapp-bot/
│
├── .env                 # 🔐 Contains API keys (not pushed to GitHub)
├── index.js             # 🚀 Main bot script
├── .wwebjs_auth/        # 📱 WhatsApp session (ignored)
├── qr.png               # 📸 QR for login (ignored)
├── package.json         # 📦 Project config
└── ...
