const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * AI 建築與營造智慧顧問特助問答
 */
async function askAssistant({ question, displayName = '使用者', recentContext = '' }) {
  const systemPrompt =
    '你是一位頂級「AI 建築、空間設計、營造工程與房地產智庫特助」。\n' +
    '你的特質：\n' +
    '1. 專業俐落、直擊核心、洞察深刻，具備資深建築師與營造專案經理的跨領域實戰視野。\n' +
    '2. 擅長解答：建築設計、營造施工工法、都更危老法規、綠建築ESG/淨零碳排、BIM智慧建築、工程預算與成本控制、以及各類商務決策。\n' +
    '3. 回覆格式排版清晰（適度使用 emoji、條列式與粗體），不廢話，並主動給出具體可行之下一步建議。\n' +
    '4. 繁體中文回覆。';

  let userPrompt = question;
  if (recentContext) {
    userPrompt = `【最近對話背景】\n${recentContext}\n\n【${displayName} 的問題 / 指令】\n${question}`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content?.trim() || '目前無法處理此問題，請稍候重試。';
  } catch (err) {
    console.error('[assistant] askAssistant error:', err.message);
    return `💡 抱歉，顧問助理連線暫時發生錯誤：${err.message}`;
  }
}

/**
 * 針對特定新聞進行深度智庫剖析
 */
async function analyzeNewsDeeply(newsTitle) {
  const prompt =
    '你是一位資深建築與營造產業首席分析師。請針對以下新聞主題進行深度產業洞察剖析：\n\n' +
    `新聞主題：${newsTitle}\n\n` +
    '請輸出結構化分析，包含：\n' +
    '1. 📌【事件核心與背景脈絡】（50字）\n' +
    '2. 🏗️【工程技術 / 設計 / 法規面影響】（70字）\n' +
    '3. 📈【產業趨勢與市場機遇】（70字）\n' +
    '4. 💡【專家策略建議】（50字）\n\n' +
    '請以繁體中文撰寫，觀點鮮明專業，直擊痛點。';

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: '你是專業建築與營造首席分析顧問。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content?.trim() || '新聞剖析產出失敗。';
  } catch (err) {
    console.error('[assistant] analyzeNewsDeeply error:', err.message);
    return `剖析失敗：${err.message}`;
  }
}

module.exports = {
  askAssistant,
  analyzeNewsDeeply,
};
