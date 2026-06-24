import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Siigo Mock API inicializada`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`🔔 Webhook n8n local: ${process.env.N8N_LOCAL_WEBHOOK_URL}`);
  console.log(`=================================`);
});