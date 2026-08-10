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
          '你是專業的對話摘要助手。請將提供的LINE聊天紀錄整理成繁體中文重點摘要，' +
          '包含：1) 主要討論主題 2) 重要結論或決定 3) 待辦事項或後續行動（若有）。' +
          '用條列式呈現，簡潔扼要，不要逐句翻譯對話。若對話內容過於瑣碎或無實質內容，可回覆「這段時間沒有重要內容」。',
      },
      { role: 'user', content: transcript },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { summarizeMessages };
