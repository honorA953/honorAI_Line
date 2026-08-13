const cron = require('node-cron');
const { client } = require('./line');
const db = require('./db');
const { summarizeMessages } = require('./summarize');
const { createExecutiveSummaryFlex, createConstructionNewsFlex } = require('./flex');
const { getDailyConstructionDigest } = require('./news');

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
  if (!conversationId) return null;
  if (conversationId.includes(':')) {
    const [, id] = conversationId.split(':');
    return id;
  }
  return conversationId;
}

/**
 * 執行每日晚間對話總結與歸檔
 */
async function runSummaryJob() {
  const conversationIds = await db.getAllConversationIds();
  for (const conversationId of conversationIds) {
    const messages = await db.getMessages(conversationId);
    if (!messages.length) continue;

    try {
      const summary = await summarizeConversation(messages);
      const targetId = extractTargetId(conversationId);
      if (!targetId) continue;

      let pushMsg;
      try {
        pushMsg = createExecutiveSummaryFlex({
          title: '🗓️ 今日對話總結與智庫簡報',
          summaryText: summary,
        });
      } catch (_) {
        pushMsg = { type: 'text', text: `🗓️ 今日總結\n\n${summary}` };
      }

      await client.pushMessage({
        to: targetId,
        messages: [pushMsg],
      });
      await db.appendHistory({
        conversationId,
        messages,
        summary,
        generatedAt: new Date().toISOString(),
      });
      await db.clearMessages(conversationId);
      console.log(`[summary] pushed & cleared for ${conversationId}`);
    } catch (err) {
      console.error(`[summary] failed for ${conversationId}:`, err.message);
    }
  }
}

/**
 * 執行每日晨間建築與營造產業新聞推播
 */
async function runNewsJob() {
  console.log('[news-job] Starting daily construction news push...');
  try {
    const digest = await getDailyConstructionDigest();
    let pushMsg;
    try {
      pushMsg = createConstructionNewsFlex(digest);
    } catch (err) {
      console.error('[news-job] Flex generation failed, fallback to text:', err.message);
      const textLines = [
        `🏗️ 今日建築與營造產業情報 (${digest.date})`,
        '',
        `📈 今日產業核心脈動：\n${digest.overview}`,
        '',
        '📌 重點精選：',
        ...digest.items.map(
          (it, i) =>
            `${i + 1}. [${it.category}] ${it.title}\n${it.summary}\n💡 觀點: ${it.insight}\n🔗 ${it.url}`
        ),
      ];
      pushMsg = { type: 'text', text: textLines.join('\n') };
    }

    // 取得推播目標（可由環境變數指定，若未指定則推播給所有已知活躍對話）
    let targetIds = [];
    if (process.env.NEWS_PUSH_TARGET) {
      targetIds = process.env.NEWS_PUSH_TARGET.split(',')
        .map((t) => extractTargetId(t.trim()))
        .filter(Boolean);
    } else {
      const allConvs = await db.getAllConversationIds();
      targetIds = allConvs.map(extractTargetId).filter(Boolean);
    }

    // 去除重複 ID
    targetIds = Array.from(new Set(targetIds));

    if (targetIds.length === 0) {
      console.log('[news-job] No subscriber targets found.');
      return { success: true, count: 0 };
    }

    console.log(`[news-job] Pushing construction news to ${targetIds.length} target(s)...`);
    for (const targetId of targetIds) {
      try {
        await client.pushMessage({
          to: targetId,
          messages: [pushMsg],
        });
        console.log(`[news-job] Pushed news to ${targetId}`);
      } catch (err) {
        console.error(`[news-job] Failed pushing news to ${targetId}:`, err.message);
      }
    }

    return { success: true, count: targetIds.length };
  } catch (err) {
    console.error('[news-job] Fatal error in runNewsJob:', err);
    throw err;
  }
}

function startScheduler() {
  // 晚間對話總結（預設 21:00）
  const summaryCron = process.env.SUMMARY_CRON || '0 21 * * *';
  cron.schedule(summaryCron, () => {
    console.log(`[scheduler] running summary job (${new Date().toISOString()})`);
    runSummaryJob();
  });
  console.log(`[scheduler] registered summary cron: ${summaryCron}`);

  // 晨間建築新聞推播（預設 08:00）
  const newsCron = process.env.CONSTRUCTION_NEWS_CRON || '0 8 * * *';
  cron.schedule(newsCron, () => {
    console.log(`[scheduler] running daily construction news job (${new Date().toISOString()})`);
    runNewsJob();
  });
  console.log(`[scheduler] registered construction news cron: ${newsCron}`);
}

module.exports = {
  startScheduler,
  runSummaryJob,
  runNewsJob,
  summarizeConversation,
  extractTargetId,
};
