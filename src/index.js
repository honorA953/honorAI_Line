require('dotenv').config();

const express = require('express');
const { line, config, client, getConversationId, getDisplayName } = require('./line');
const db = require('./db');
const { startScheduler, runSummaryJob, summarizeConversation } = require('./scheduler');

const SUMMARY_KEYWORD = process.env.SUMMARY_KEYWORD || '摘要';

const app = express();

// 同一個對話的事件依序處理（避免同時收到多筆訊息時競速，導致摘要搶在前一則訊息寫入前執行）
const conversationQueues = new Map();

function runSerialized(conversationId, task) {
  const previous = conversationQueues.get(conversationId) || Promise.resolve();
  const current = previous.then(task, task);
  conversationQueues.set(conversationId, current.catch(() => {}));
  return current;
}

app.post('/webhook', line.middleware(config), async (req, res) => {
  res.sendStatus(200); // 先回200，避免LINE重送；事件非同步處理
  const events = req.body.events || [];
  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;
    const conversationId = getConversationId(event.source);
    runSerialized(conversationId, () => handleEvent(event, conversationId)).catch((err) =>
      console.error('[webhook] event error:', err)
    );
  }
});

async function handleEvent(event, conversationId) {
  if (event.message.text.trim() === SUMMARY_KEYWORD) {
    return replyImmediateSummary(event.replyToken, conversationId);
  }

  const displayName = await getDisplayName(event.source);
  await db.appendMessage(conversationId, {
    userId: event.source.userId,
    displayName,
    text: event.message.text,
    timestamp: event.timestamp,
  });
}

async function replyImmediateSummary(replyToken, conversationId) {
  const messages = await db.getMessages(conversationId);
  if (!messages.length) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: '目前還沒有累積新的對話內容。' }],
    });
    return;
  }

  const summary = await summarizeConversation(messages);
  await client.replyMessage({
    replyToken,
    messages: [{ type: 'text', text: `📋 對話摘要\n\n${summary}` }],
  });
  await db.appendHistory({
    conversationId,
    messages,
    summary,
    generatedAt: new Date().toISOString(),
  });
  await db.clearMessages(conversationId);
  console.log(`[summary] replied on-demand & cleared for ${conversationId}`);
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
