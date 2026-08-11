const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function summarizeMessages(messages) {
  const transcript = messages
    .map((m) => `[${new Date(m.timestamp).toLocaleString('zh-TW')}] ${m.displayName}: ${m.text}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          '你是高階商業與技術顧問級對話摘要助手。請將提供的 LINE 聊天紀錄整理成繁體中文結構化摘要報告，格式如下：\n\n' +
          '📊【討論主軸與核心議題】\n' +
          '• （精準條列主要討論重點）\n\n' +
          '💡【重要結論與關鍵決策】\n' +
          '• （結合對話內容、圖片 OCR 數據與分享之影片/網頁精華，提煉核心共識）\n\n' +
          '📚【AI 智庫補充與延伸洞察】\n' +
          '• （針對討論提及之主題/技術/事件，主動補充背景知識、趨勢脈絡或潛在風險）\n\n' +
          '🎯【待辦事項與行動清單】（若無具體待辦可寫「無特定待辦」）\n' +
          '• （列出負責人與後續行動）\n\n' +
          '文字風格簡潔幹練、專業有力，不要逐字翻譯，聚焦高價值資訊。若無實質內容可回覆「這段時間沒有重要內容」。',
      },
      { role: 'user', content: transcript },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { summarizeMessages };
