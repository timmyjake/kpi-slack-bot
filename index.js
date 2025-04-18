const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/kpi',
});

// Simple test response for /kpi slash command
app.command('/kpi', async ({ ack, respond }) => {
  await ack();
  await respond('✅ /kpi command received!');
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ KPI bot is running on /kpi');
})();
