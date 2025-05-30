const express = require('express');
const app = express();
const path = require('path');

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.png'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`QR server running on http://localhost:${PORT}/qr`);
});
