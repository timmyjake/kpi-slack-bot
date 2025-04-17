// Updated Node.js Slack KPI Bot - Multi-section Modal Version (Phase 2) with Google Sheets Logging
const { App } = require('@slack/bolt');
require('dotenv').config();
const schedule = require('node-schedule');
const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '1eIZsBSc-EotNs3wzRpesiKW585jOH-6Bg5YCKbcgR2I';
const SHEET_TAB = 'FormResponses';

const auth = new google.auth.GoogleAuth({
  keyFile: './slack-kpi-bot-457122-9340357cc9e2.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/kpi',
  socketMode: false,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Reminder every Friday at 4PM
schedule.scheduleJob('0 16 * * 5', async () => {
  try {
    await app.client.chat.postMessage({
      channel: '#weekly-kpis',
      text: '🔔 Friendly reminder: PMs, please submit your /kpi check-in before the weekend.'
    });

    const users = [
      { name: 'Marcel Waggoner', slackId: 'U1234567890' },
      { name: 'Seth Winrod', slackId: 'U0987654321' }
    ];

    for (const user of users) {
      await app.client.chat.postMessage({
        channel: user.slackId,
        text: `🔔 Hey ${user.name}, don't forget to submit your /kpi check-in before the weekend.`
      });
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
});

const section1Data = new Map();

// Slash command handler to open KPI modal
app.command('/kpi', async ({ command, ack, client }) => {
  await ack();

  await client.views.open({
    trigger_id: command.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'submit_kpi_section1',
      title: { type: 'plain_text', text: 'KPI Check-In – Section 1' },
      submit: { type: 'plain_text', text: 'Next' },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: 'input',
          block_id: 'projects_started',
          label: { type: 'plain_text', text: 'Projects Started This Week' },
          element: { type: 'plain_text_input', action_id: 'input' },
        }
      ]
    }
  });
});

app.view('submit_kpi_section2', async ({ ack, body, view, client }) => {
  await ack();
  const user = body.user.name;
  const section1 = section1Data.get(body.user.id);
  const section2 = view.state.values;

  const timestamp = new Date().toISOString();
  const row = [
    timestamp,
    user,
    section1.projects_started.input.value,
    section1.projects_completed.input.value,
    section1.active_projects.input.value,
    section1.avg_completion_time.input.value,
    section1.final_punch.input.value,
    section1.on_schedule.input.value,
    section1.delays_issues.input.value,
    section1.ready_clean.input.value,
    section1.awaiting_inspection.input.value,
    section1.subs_hired.input.value,
    section1.no_show_subs.input.value,
    section2.subs_written_up.input.value,
    section2.delayed_orders.input.value,
    section2.late_orders.input.value,
    section2.folders_updated.input.value,
    section2.checklists_submitted.input.value,
    section2.missed_comms.input.value,
    section2.safety_hazards.input.value,
    section2.legal_permits.input.value,
    section2.buildertrend_issues.input.value,
    section2.slack_comms.input.value
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error('Google Sheets logging failed:', err);
  }

  const summary = `*Weekly KPI Summary from ${user}*
` +
    `📦 *Production*
` +
    `• Projects Started: ${section1.projects_started.input.value}
` +
    `• Projects Completed: ${section1.projects_completed.input.value}
` +
    `• Active Projects: ${section1.active_projects.input.value}
` +
    `• Avg Completion Time: ${section1.avg_completion_time.input.value}

` +
    `📅 *Schedule & Turnover*
` +
    `• Final Punch Passed: ${section1.final_punch.input.value}
` +
    `• % On Schedule: ${section1.on_schedule.input.value}
` +
    `• Delays/Issues: ${section1.delays_issues.input.value}
` +
    `• Ready for Clean: ${section1.ready_clean.input.value}
` +
    `• Awaiting Inspection: ${section1.awaiting_inspection.input.value}

` +
    `🧰 *Subs & Labor*
` +
    `• Subs Hired: ${section1.subs_hired.input.value}
` +
    `• Subs No-Showed: ${section1.no_show_subs.input.value}
` +
    `• Subs Written Up: ${section2.subs_written_up.input.value}

` +
    `🔧 *Procurement*
` +
    `• Delayed Orders: ${section2.delayed_orders.input.value}
` +
    `• Late Orders: ${section2.late_orders.input.value}

` +
    `📸 *Docs & Accountability*
` +
    `• Folders Updated: ${section2.folders_updated.input.value}
` +
    `• Checklists Submitted: ${section2.checklists_submitted.input.value}
` +
    `• Missed Comms: ${section2.missed_comms.input.value}

` +
    `⚠️ *Risk*
` +
    `• Safety Hazards: ${section2.safety_hazards.input.value}
` +
    `• Permitting Issues: ${section2.legal_permits.input.value}

` +
    `🧱 *Buildertrend / Slack*
` +
    `• Buildertrend Notes: ${section2.buildertrend_issues.input.value}
` +
    `• Slack Discipline: ${section2.slack_comms.input.value}`;

  await client.chat.postMessage({
    channel: '#weekly-kpis',
    text: summary,
  });

  section1Data.delete(body.user.id);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Full KPI Bot is running with reminder and Sheets logging!');
})();
