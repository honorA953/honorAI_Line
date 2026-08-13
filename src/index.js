require('dotenv').config();

const dns = require('node:dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const express = require('express');
const { line, config, client, getConversationId, getDisplayName } = require('./line');
const db = require('./db');
const {
  startScheduler,
  runSummaryJob,
  runNewsJob,
  summarizeConversation,
} = require('./scheduler');
const {
  fetchLineContent,
  describeImage,
  transcribeAudio,
  enrichMessageText,
} = require('./multimodal');
const {
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createAudioFlex,
  createExecutiveSummaryFlex,
  createConstructionNewsFlex,
} = require('./flex');
const { getDailyConstructionDigest } = require('./news');

const SUMMARY_KEYWORD = process.env.SUMMARY_KEYWORD || '摘要';
const NEWS_KEYWORDS = ['建築新聞', '今日新聞', '新聞', '晨報', '建築晨報', '今日建築新聞', '工程新聞', '建築情報'];

const app = express();

// 同一個對話的事件依序處理（避免同時收到多筆訊息時競速）
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
    if (event.type !== 'message') continue;
    const conversationId = getConversationId(event.source);
    await db.registerConversation(conversationId);
    runSerialized(conversationId, () => handleEvent(event, conversationId)).catch((err) =>
      console.error('[webhook] event error:', err)
    );
  }
});

async function handleEvent(event, conversationId) {
  const messageType = event.message.type;
  let textContent = null;
  let replyMessages = [];

  if (messageType === 'text') {
    const rawText = event.message.text.trim();
    if (rawText === SUMMARY_KEYWORD) {
      return replyImmediateSummary(event.replyToken, conversationId);
    }
    if (NEWS_KEYWORDS.includes(rawText)) {
      return replyImmediateNews(event.replyToken);
    }
    // 檢查是否有網址（YouTube/網頁）並豐富化內容
    const { enrichedText, items } = await enrichMessageText(event.message.text);
    textContent = enrichedText;

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.type === 'youtube') {
          replyMessages.push(
            createVideoFlex({
              title: item.title,
              points: item.points,
              supplement: item.supplement,
              url: item.url,
            })
          );
        } else if (item.type === 'web') {
          replyMessages.push(
            createWebFlex({
              title: item.title,
              summary: item.summary,
              supplement: item.supplement,
              url: item.url,
            })
          );
        }
      }
    }
  } else if (messageType === 'image') {
    try {
      const buffer = await fetchLineContent(event.message.id);
      const imgData = await describeImage(buffer);
      textContent = imgData.textSummary;
      replyMessages.push(
        createImageFlex({
          description: imgData.description,
          ocr: imgData.ocr,
          supplement: imgData.supplement,
        })
      );
    } catch (err) {
      console.error('[webhook] image processing error:', err.message);
      textContent = '[🖼️ 傳送了圖片]';
    }
  } else if (messageType === 'audio') {
    try {
      const buffer = await fetchLineContent(event.message.id);
      const transcript = await transcribeAudio(buffer);
      textContent = `[🎙️ 語音訊息: "${transcript}"]`;
      replyMessages.push(
        createAudioFlex({
          transcript,
        })
      );
    } catch (err) {
      console.error('[webhook] audio processing error:', err.message);
      textContent = '[🎙️ 傳送了語音訊息]';
    }
  } else if (messageType === 'video') {
    textContent = '[🎬 傳送了一段影片檔案]';
  } else if (messageType === 'file') {
    const fileName = event.message.fileName || '檔案';
    textContent = `[📎 傳送了檔案: ${fileName}]`;
  }

  if (!textContent) return;

  const displayName = await getDisplayName(event.source);
  await db.appendMessage(conversationId, {
    userId: event.source.userId,
    displayName,
    text: textContent,
    timestamp: event.timestamp,
  });

  // 若有解析出影片/網頁摘要、圖片內容或語音，即時以高質感卡片回覆 LINE
  if (replyMessages.length > 0 && event.replyToken) {
    try {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: replyMessages.slice(0, 5), // LINE 限制單次回覆最多 5 則訊息
      });
      console.log(`[webhook] sent flex reply for ${messageType} to ${conversationId}`);
    } catch (err) {
      console.error('[webhook] flex reply error, falling back to text:', err.message);
      try {
        const fallbackText = items?.map((i) => i.textSummary).join('\n\n') || textContent;
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: fallbackText }],
        });
      } catch (_) {}
    }
  }
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
  try {
    const flexCard = createExecutiveSummaryFlex({
      title: '📋 對話深度總結報告',
      summaryText: summary,
    });
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[summary] flex failed, fallback to text:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: `📋 對話深度總結\n\n${summary}` }],
    });
  }

  await db.appendHistory({
    conversationId,
    messages,
    summary,
    generatedAt: new Date().toISOString(),
  });
  await db.clearMessages(conversationId);
  console.log(`[summary] replied on-demand & cleared for ${conversationId}`);
}

async function replyImmediateNews(replyToken) {
  try {
    const digest = await getDailyConstructionDigest();
    const flexCard = createConstructionNewsFlex(digest);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log('[news] replied on-demand construction news flex card');
  } catch (err) {
    console.error('[news] on-demand reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: '🏗️ 正在抓取最新建築與營造產業新聞，請稍候片刻再試。' }],
    });
  }
}

// 手動觸發晚間對話摘要排程
app.post('/tasks/summary', express.json(), async (req, res) => {
  const secret = process.env.SUMMARY_TRIGGER_SECRET;
  if (secret && req.get('x-trigger-secret') !== secret) {
    return res.sendStatus(401);
  }
  await runSummaryJob();
  res.json({ ok: true });
});

// 手動觸發晨間建築新聞推播排程
app.post('/tasks/news', express.json(), async (req, res) => {
  const secret = process.env.SUMMARY_TRIGGER_SECRET;
  if (secret && req.get('x-trigger-secret') !== secret) {
    return res.sendStatus(401);
  }
  const result = await runNewsJob();
  res.json({ ok: true, result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
  startScheduler();
});
