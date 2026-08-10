const cron = require('node-cron');
const { client } = require('./line');
const db = require('./db');
const { summarizeMessages } = require('./summarize');

const MAX_PER_BATCH = parseInt(process.env.MAX_MESSAGES_PER_SUMMARY || '300', 10);

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

// 訊息量超過單次上限時，先分段摘要，再把各段摘要合併成最終摘要
async function summarizeConversation(messages) {
  if (messages.length <= MAX_PER_BATCH) {
    return summarizeMessages(messages);
  }
  const batches = chunk(messages, MAX_PER_BATCH);
  const partials = [];
  for (const batch of batches) {
    partials.push(await summarizeMessages(batch));
  }
  const combined = partials.map((p, i) => `【第${i + 1}段摘要】\n${p}`).join('\n\n');
  return summarizeMessages([{ displayName: '系統', text: combined, timestamp: Date.now() }]);
}

function extractTargetId(conversationId) {
  const [, id] = conversationId.split(':');
  return id;
}

async function runSummaryJob() {
  const conversationIds = await db.getAllConversationIds();
  for (const conversationId of conversationIds) {
    const messages = await db.getMessages(conversationId);
    if (!messages.length) continue;

    try {
      const summary = await summarizeConversation(messages);
      const targetId = extractTargetId(conversationId);
      await client.pushMessage({
        to: targetId,
        messages: [{ type: 'text', text: `📋 對話摘要\n\n${summary}` }],
      });
      await db.clearMessages(conversationId);
      console.log(`[summary] pushed & cleared for ${conversationId}`);
    } catch (err) {
      console.error(`[summary] failed for ${conversationId}:`, err.message);
      // 失敗時保留訊息，等下一次排程重試
    }
  }
}

function startScheduler() {
  const expr = process.env.SUMMARY_CRON || '0 21 * * *';
  cron.schedule(expr, () => {
    console.log(`[scheduler] running summary job (${new Date().toISOString()})`);
    runSummaryJob();
  });
  console.log(`[scheduler] registered cron: ${expr}`);
}

module.exports = { startScheduler, runSummaryJob };
