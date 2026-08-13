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
  getQuickReply,
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createAudioFlex,
  createExecutiveSummaryFlex,
  createConstructionNewsFlex,
  createMenuFlex,
  createNewsAnalysisFlex,
  createAssistantFlex,
} = require('./flex');
const { getDailyConstructionDigest } = require('./news');
const { askAssistant, analyzeNewsDeeply } = require('./assistant');

const SUMMARY_KEYWORD = process.env.SUMMARY_KEYWORD || '摘要';
const NEWS_KEYWORDS = [
  '建築新聞',
  '今日新聞',
  '新聞',
  '晨報',
  '建築晨報',
  '今日建築新聞',
  '工程新聞',
  '建築情報',
];
const REFRESH_NEWS_KEYWORDS = [
  '換新聞',
  '換一批',
  '換一批新聞',
  '下一批',
  '更多新聞',
  '最新新聞',
  '即時新聞',
  '換這批',
];
const MENU_KEYWORDS = ['選單', '功能', '按鈕', 'menu', 'help', '說明', '開始', '控制台'];
const CLEAR_KEYWORDS = ['清空記錄', '清空對話', '清除記錄', '清空'];

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
    const lowerText = rawText.toLowerCase();

    // 1. 快捷選單指令
    if (MENU_KEYWORDS.includes(lowerText)) {
      return replyImmediateMenu(event.replyToken);
    }

    // 2. 清空對話記錄指令
    if (CLEAR_KEYWORDS.includes(rawText)) {
      await db.clearMessages(conversationId);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: '🧹 已為您清空目前對話累積紀錄。隨時可點擊下方按鈕或傳送新訊息！',
            quickReply: getQuickReply(),
          },
        ],
      });
    }

    // 3. 對話即時摘要
    if (rawText === SUMMARY_KEYWORD || rawText === '摘要' || rawText === '對話摘要') {
      return replyImmediateSummary(event.replyToken, conversationId);
    }

    // 4. 新聞「換一批」次次更新
    if (REFRESH_NEWS_KEYWORDS.includes(rawText)) {
      return replyImmediateNews(event.replyToken, { topic: 'all', refresh: true });
    }

    // 5. 分類新聞專題
    if (rawText === '綠建ESG' || rawText === '綠建築' || lowerText === 'esg') {
      return replyImmediateNews(event.replyToken, { topic: 'esg' });
    }
    if (rawText === '房市都更' || rawText === '都更' || rawText === '危老' || rawText === '法規') {
      return replyImmediateNews(event.replyToken, { topic: 'regulation' });
    }
    if (rawText === '建築設計' || rawText === '空間設計' || rawText === '設計') {
      return replyImmediateNews(event.replyToken, { topic: 'design' });
    }
    if (rawText === '重大工程' || rawText === '營造工程' || rawText === '工程') {
      return replyImmediateNews(event.replyToken, { topic: 'engineering' });
    }
    if (rawText === '智慧建築' || lowerText === 'bim' || rawText === '建築科技') {
      return replyImmediateNews(event.replyToken, { topic: 'smart' });
    }

    // 6. 一般今日建築新聞
    if (NEWS_KEYWORDS.includes(rawText)) {
      return replyImmediateNews(event.replyToken, { topic: 'all' });
    }

    // 7. 新聞深度剖析指令 (點擊卡片按鈕觸發)
    if (
      rawText.startsWith('剖析新聞:') ||
      rawText.startsWith('剖析新聞：') ||
      rawText.startsWith('分析新聞:') ||
      rawText.startsWith('分析新聞：')
    ) {
      const newsTitle = rawText.replace(/^(剖析新聞|分析新聞)[:：]\s*/, '').trim();
      return replyImmediateNewsAnalysis(event.replyToken, newsTitle);
    }

    // 8. 檢查是否有網址（YouTube/網頁）並豐富化內容
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
    } else {
      // 若非網址，判斷是否為 1對1 對話或群組主動提問
      const isOneOnOne = event.source.type === 'user';
      const isQuestionOrAiTrigger =
        rawText.startsWith('AI') ||
        rawText.startsWith('ai') ||
        rawText.startsWith('@AI') ||
        rawText.startsWith('@ai') ||
        rawText.startsWith('請教') ||
        rawText.startsWith('請教AI') ||
        rawText.startsWith('問') ||
        rawText.endsWith('?') ||
        rawText.endsWith('？');

      if (isOneOnOne || isQuestionOrAiTrigger) {
        const cleanQuestion = rawText
          .replace(/^(@?AI|請教AI|請教|問)[:：\s]*/i, '')
          .trim();
        const displayName = await getDisplayName(event.source);
        const answer = await askAssistant({
          question: cleanQuestion || rawText,
          displayName,
        });

        replyMessages.push(
          createAssistantFlex({
            question: cleanQuestion || rawText,
            answer,
          })
        );
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

  // 若有卡片訊息，即時回覆 LINE
  if (replyMessages.length > 0 && event.replyToken) {
    try {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: replyMessages.slice(0, 5), // LINE 限制單次回覆最多 5 則訊息
      });
      console.log(`[webhook] sent reply for ${messageType} to ${conversationId}`);
    } catch (err) {
      console.error('[webhook] reply error, falling back to text:', err.message);
      try {
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: textContent,
              quickReply: getQuickReply(),
            },
          ],
        });
      } catch (_) {}
    }
  }
}

async function replyImmediateMenu(replyToken) {
  try {
    const flexCard = createMenuFlex();
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[menu] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '🎛️ 請選擇操作：\n1. 今日新聞\n2. 換新聞\n3. 綠建ESG\n4. 房市都更\n5. 建築設計\n6. 摘要\n7. 清空記錄',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateSummary(replyToken, conversationId) {
  const messages = await db.getMessages(conversationId);
  if (!messages.length) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '目前還沒有累積新的對話內容。可點擊下方按鈕閱讀今日新聞或直接向 AI 諮詢！',
          quickReply: getQuickReply(),
        },
      ],
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
      messages: [
        {
          type: 'text',
          text: `📋 對話深度總結\n\n${summary}`,
          quickReply: getQuickReply(),
        },
      ],
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

async function replyImmediateNews(replyToken, options = { topic: 'all' }) {
  try {
    const digest = await getDailyConstructionDigest(options);
    const flexCard = createConstructionNewsFlex(digest);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[news] replied news flex card for topic [${digest.category}]`);
  } catch (err) {
    console.error('[news] on-demand reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '🏗️ 正在抓取最新建築與營造產業新聞，請稍候片刻點擊「換新聞」再試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNewsAnalysis(replyToken, newsTitle) {
  try {
    const analysis = await analyzeNewsDeeply(newsTitle);
    const flexCard = createNewsAnalysisFlex({
      title: newsTitle,
      analysisText: analysis,
    });
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[news-analysis] replied analysis for: ${newsTitle}`);
  } catch (err) {
    console.error('[news-analysis] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: `💡 新聞深度剖析：\n${newsTitle}\n\n分析生成中發生錯誤，請稍後重試。`,
          quickReply: getQuickReply(),
        },
      ],
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
