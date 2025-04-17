// index.js - KPI Slack Bot using Bolt.js (Node.js)
const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.command('/kpi', async ({ command, ack, client }) => {
  await ack();

  await client.views.open({
    trigger_id: command.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'submit_kpi_form',
      title: { type: 'plain_text', text: 'Weekly KPI Check-In' },
      submit: { type: 'plain_text', text: 'Submit' },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: 'input',
          block_id: 'projects_started',
          label: { type: 'plain_text', text: 'Projects Started This Week' },
          element: { type: 'plain_text_input', action_id: 'input' }
        },
        {
          type: 'input',
          block_id: 'projects_completed',
          label: { type: 'plain_text', text: 'Projects Completed This Week' },
          element: { type: 'plain_text_input', action_id: 'input' }
        },
        {
          type: 'input',
          block_id: 'active_projects',
          label: { type: 'plain_text', text: 'Total Active Projects' },
          element: { type: 'plain_text_input', action_id: 'input' }
        },
        {
          type: 'input',
          block_id: 'punch_passed',
          label: { type: 'plain_text', text: 'Final Punch Passed (# Passed / # Inspected)' },
          element: { type: 'plain_text_input', action_id: 'input' }
        },
        {
          type: 'input',
          block_id: 'delayed_orders',
          label: { type: 'plain_text', text: 'Delayed Material Orders' },
          element: { type: 'plain_text_input', action_id: 'input' }
        },
        {
          type: 'input',
          block_id: 'slack_communication',
          label: { type: 'plain_text', text: 'Daily Slack Communication? (Y/N)' },
          element: { type: 'plain_text_input', action_id: 'input' }
        }
      ]
    }
  });
});

app.view('submit_kpi_form', async ({ ack, body, view, client }) => {
  await ack();

  const user = body.user.name;
  const values = view.state.values;

  const summary = `*Weekly KPI Summary from ${user}*

` +
    `• Projects Started: ${values.projects_started.input.value}
` +
    `• Projects Completed: ${values.projects_completed.input.value}
` +
    `• Active Projects: ${values.active_projects.input.value}
` +
    `• Final Punch Passed: ${values.punch_passed.input.value}
` +
    `• Delayed Orders: ${values.delayed_orders.input.value}
` +
    `• Slack Communication Daily: ${values.slack_communication.input.value}`;

  await client.chat.postMessage({
    channel: '#weekly-kpis',
    text: summary
  });
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ KPI Bot is running!');
})();
