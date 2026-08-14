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
  createNotesFlex,
  createNoteHelperFlex,
  createSynthesisFlex,
  createWelcomeFlex,
} = require('./flex');
const { getDailyConstructionDigest } = require('./news');
const {
  askAssistant,
  analyzeNewsDeeply,
  parseNoteFromText,
  synthesizeAll,
} = require('./assistant');

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
const NOTES_LIST_KEYWORDS = [
  '看記事',
  '記事本',
  '待辦清單',
  '備忘錄',
  '我的記事',
  '代辦清單',
  '記事清單',
  '待辦',
  'notes',
  'todo',
  '待辦記事',
];
const NOTES_HELPER_KEYWORDS = [
  '新增記事',
  '記一筆',
  '快捷記事',
  '記事範本',
  '記事引導',
  '記事教學',
  '怎麼記事',
  '寫記事',
  '新增待辦',
  '新增備忘',
];
const NOTES_CLEAR_KEYWORDS = ['清空記事', '清除記事', '刪除記事', '清空待辦'];
const SYNTHESIS_KEYWORDS = [
  '智能統整',
  '統整',
  '整合',
  '工作統整',
  '彙整',
  '今日進度',
  '跨維度統整',
  '全方位統整',
];

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
    const conversationId = getConversationId(event.source);
    await db.registerConversation(conversationId);

    // 處理加好友或加入群組事件，立即回傳曜石黑頂級歡迎與功能導引卡片
    if (event.type === 'follow' || event.type === 'join') {
      try {
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [createWelcomeFlex()],
        });
        console.log(`[webhook] sent welcome card for ${event.type} to ${conversationId}`);
      } catch (err) {
        console.error('[webhook] error sending welcome card:', err.message);
      }
      continue;
    }

    if (event.type !== 'message') continue;
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

    // 2. 記事本管理指令（清空記事）
    if (NOTES_CLEAR_KEYWORDS.includes(rawText)) {
      await db.clearNotes(conversationId);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: '🧹 已為您清空所有待辦記事本清單！隨時傳送「記下：...」即可新增。',
            quickReply: getQuickReply(),
          },
        ],
      });
    }

    // 4. 查看記事本 / 待辦清單
    if (NOTES_LIST_KEYWORDS.includes(lowerText)) {
      return replyImmediateNotes(event.replyToken, conversationId);
    }

    // 5. 記事範本與快捷引導 (解決記不住指令問題)
    if (NOTES_HELPER_KEYWORDS.includes(rawText) || NOTES_HELPER_KEYWORDS.includes(lowerText)) {
      return replyImmediateNoteHelper(event.replyToken);
    }

    // 6. 跨維度智能全方位統整 (對話 + 記事 + 數據 + 風險)
    if (SYNTHESIS_KEYWORDS.includes(rawText)) {
      return replyImmediateSynthesis(event.replyToken, conversationId, event.source);
    }

    // 6. 新增記事 / 備忘 (識別「記下」、「幫我記」、「記事」、「備忘」、「提醒我」、「待辦」)
    const isNoteCreation =
      rawText.startsWith('記下') ||
      rawText.startsWith('幫我記') ||
      rawText.startsWith('記事') ||
      rawText.startsWith('備忘') ||
      rawText.startsWith('提醒我') ||
      rawText.startsWith('待辦') ||
      lowerText.startsWith('todo') ||
      lowerText.startsWith('note');

    if (isNoteCreation) {
      return replyImmediateNoteCreation(event.replyToken, conversationId, rawText);
    }

    // 7. 對話即時摘要 (純對話)
    if (rawText === SUMMARY_KEYWORD || rawText === '摘要' || rawText === '對話摘要') {
      return replyImmediateSummary(event.replyToken, conversationId);
    }

    // 8. 新聞「換一批」次次更新
    if (REFRESH_NEWS_KEYWORDS.includes(rawText)) {
      return replyImmediateNews(event.replyToken, { topic: 'all', refresh: true });
    }

    // 9. 分類新聞專題
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

    // 10. 一般今日建築新聞
    if (NEWS_KEYWORDS.includes(rawText)) {
      return replyImmediateNews(event.replyToken, { topic: 'all' });
    }

    // 11. 新聞深度剖析指令 (點擊卡片按鈕觸發)
    if (
      rawText.startsWith('剖析新聞:') ||
      rawText.startsWith('剖析新聞：') ||
      rawText.startsWith('分析新聞:') ||
      rawText.startsWith('分析新聞：')
    ) {
      const newsTitle = rawText.replace(/^(剖析新聞|分析新聞)[:：]\s*/, '').trim();
      return replyImmediateNewsAnalysis(event.replyToken, newsTitle);
    }

    // 12. 檢查是否有網址（YouTube/網頁）並豐富化內容
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
      // 判斷是否為 1對1 私聊
      const isOneOnOne = event.source.type === 'user';

      // 支援 LINE 原生 @ 標註 (mentionees)
      const hasMention = Boolean(
        event.message.mention &&
        event.message.mention.mentionees &&
        event.message.mention.mentionees.length > 0
      );

      // 群組呼叫詞（任何位置包含 @大大、大大、@AI、AI、小幫手、助手、助理、bot）
      const isCallByName =
        /@(大大|ai|助手|助理|bot|小幫手)/i.test(rawText) ||
        /^[@＠]?(ai|大大|小幫手|助手|助理|bot|問題)/i.test(rawText) ||
        /(大大|小幫手|助手|助理)/i.test(rawText) ||
        rawText.startsWith('@') ||
        rawText.startsWith('＠');

      // 提問動詞（開頭為請問、請教、幫我、想請問、可以幫我、分析、評估等，或結尾為問號）
      const isAskingQuestion =
        /^(請教|請問|請幫我|幫我|請分析|請評估|想請問|想請教|可以幫我|請教ai|請問ai|請推薦|請試算|幫我查|查一下)/i.test(rawText) ||
        /^(問|查|分析|評估|試算)[:：\s]/i.test(rawText) ||
        /[?？]$/.test(rawText);

      const isAiTrigger = hasMention || isCallByName || isAskingQuestion;

      if (isOneOnOne || isAiTrigger) {
        // 清理提問前綴與標籤
        const cleanQuestion = rawText
          .replace(/^([@＠]?(ai|助手|助理|問題|bot|大大|小幫手)|請教ai|請教|請問ai|請問|請幫我|請分析|請評估|想請問|想請教|可以幫我|幫我)[:：\s]*/i, '')
          .replace(/[@＠](大大|ai|助手|助理|bot|小幫手)/gi, '')
          .trim();

        const displayName = await getDisplayName(event.source);
        const recentMessages = await db.getMessages(conversationId);
        const notes = await db.getNotes(conversationId);

        const promptQuestion = cleanQuestion || rawText || '您好！請問有什麼我可以協助您的？';
        const assistantResult = await askAssistant({
          question: promptQuestion,
          displayName,
          recentMessages,
          notes,
        });

        replyMessages.push(
          createAssistantFlex({
            question: promptQuestion,
            data: assistantResult,
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
        let fallbackText = '🤖 已為您處理完成！';
        if (replyMessages[0]?.type === 'flex') {
          fallbackText = replyMessages[0]?.altText || fallbackText;
        } else if (replyMessages[0]?.type === 'text') {
          fallbackText = replyMessages[0].text;
        }
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: fallbackText,
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
          text: '🎛️ 請選擇操作：\n1. 記事本\n2. 智能統整\n3. 今日新聞\n4. 換新聞\n5. 綠建ESG\n6. 房市都更\n7. 摘要',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNotes(replyToken, conversationId) {
  try {
    const notes = await db.getNotes(conversationId);
    const flexCard = createNotesFlex(notes);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[notes] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '📝 讀取記事本發生錯誤，請稍候再試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNoteHelper(replyToken) {
  try {
    const flexCard = createNoteHelperFlex();
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[notes-helper] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '📝 快捷記事範本：\n1. 記下：明天上午9點結構技師工地會勘\n2. 記下：下週三向建管處送審執照變更案\n3. 備忘：鋼筋每噸最新報價 21,500 元\n4. 記下：連續壁厚度由70cm調整至80cm\n5. 備忘：爭取危老容積獎勵滿額40%',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNoteCreation(replyToken, conversationId, userText) {
  try {
    const parsed = await parseNoteFromText(userText);
    await db.addNote(conversationId, parsed);
    const notes = await db.getNotes(conversationId);
    const flexCard = createNotesFlex(notes);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[notes] added note for ${conversationId}: ${parsed.title}`);
  } catch (err) {
    console.error('[notes] creation error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: `📝 已為您記錄：「${userText}」`,
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateSynthesis(replyToken, conversationId, source) {
  try {
    const messages = await db.getMessages(conversationId);
    const notes = await db.getNotes(conversationId);
    const displayName = await getDisplayName(source);

    const synthData = await synthesizeAll({
      messages,
      notes,
      displayName,
    });

    const flexCard = createSynthesisFlex({ data: synthData });
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[synthesis] replied all-in-one synthesis for ${conversationId}`);
  } catch (err) {
    console.error('[synthesis] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '📊 智能統整報告生成中發生錯誤，請稍後重試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateSummary(replyToken, conversationId) {
  const messages = await db.getTodayMessages(conversationId);
  if (!messages.length) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '目前今日還沒有累積新的對話內容。可點擊下方按鈕閱讀今日新聞或直接向 AI 諮詢！',
          quickReply: getQuickReply(),
        },
      ],
    });
    return;
  }

  const summary = await summarizeConversation(messages);
  try {
    const flexCard = createExecutiveSummaryFlex({
      title: '📋 今日即時對話總結',
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
          text: `📋 今日即時對話總結\n\n${summary}`,
          quickReply: getQuickReply(),
        },
      ],
    });
  }

  await db.appendHistory({
    conversationId,
    messages,
    summary,
    type: 'on_demand',
    generatedAt: new Date().toISOString(),
  });
  console.log(`[summary] replied on-demand (retained ${messages.length} messages) for ${conversationId}`);
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
    const analysisData = await analyzeNewsDeeply(newsTitle);
    const flexCard = createNewsAnalysisFlex({
      title: newsTitle,
      data: analysisData,
    });
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[news-analysis] replied structured analysis for: ${newsTitle}`);
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
