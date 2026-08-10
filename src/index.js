require('dotenv').config();

const express = require('express');
const { line, config, getConversationId, getDisplayName } = require('./line');
const db = require('./db');
const { startScheduler, runSummaryJob } = require('./scheduler');

const app = express();

app.post('/webhook', line.middleware(config), async (req, res) => {
  res.sendStatus(200); // 先回200，避免LINE重送；事件非同步處理
  const events = req.body.events || [];
  for (const event of events) {
    handleEvent(event).catch((err) => console.error('[webhook] event error:', err));
  }
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const conversationId = getConversationId(event.source);
  const displayName = await getDisplayName(event.source);

  await db.appendMessage(conversationId, {
    userId: event.source.userId,
    displayName,
    text: event.message.text,
    timestamp: event.timestamp,
  });
}

// 觸發一次摘要工作。本機開發沒設定 SUMMARY_TRIGGER_SECRET 時可直接呼叫；
// 正式環境設定後，需帶正確的 x-trigger-secret header 才能觸發（給外部cron服務排程呼叫）。
app.post('/tasks/summary', express.json(), async (req, res) => {
  const secret = process.env.SUMMARY_TRIGGER_SECRET;
  if (secret && req.get('x-trigger-secret') !== secret) {
    return res.sendStatus(401);
  }
  await runSummaryJob();
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
  startScheduler();
});
