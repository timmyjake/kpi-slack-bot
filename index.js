const { App } = require('@slack/bolt');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/kpi', (req, res) => {
  console.log('✅ POST hit on /kpi');
  res.status(200).send('KPI endpoint active');
});

app.get('/', (req, res) => {
  res.status(200).send('Slack bot root is alive');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡️ Express server is live on port ${PORT}`);
});
