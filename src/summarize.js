const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_PER_BATCH = parseInt(process.env.MAX_MESSAGES_PER_SUMMARY || '300', 10);

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function summarizeMessages(messages) {
  // 將每則訊息明確帶上【發言人】與具體時間（強制以 Asia/Taipei 台北時區格式化）
  const transcript = messages
    .map((m) => {
      const time = new Date(m.timestamp).toLocaleTimeString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const name = m.displayName || '群組成員';
      return `[${time}] 【${name}】: ${m.text}`;
    })
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2, // 保持極低隨機度，忠實客觀
    messages: [
      {
        role: 'system',
        content:
          '你是一位全方位的對話記錄與摘要特助。\n\n' +
          '【最高原則】\n' +
          '1. 全部如實摘要：不管訊息長短、無論內容大小（包括工作交辦、技術討論、日常閒聊、打招呼、突發狀況、個人動態等），每一條訊息的重點都必須完整忠實記錄，嚴禁省略或判定為無重要內容！\n' +
          '2. 發言人絕對明確：每一點摘要與發言，必須清楚標記【發言人姓名】，嚴格標明「誰說了什麼、誰問了什麼、誰回了什麼」，不允許使用匿名或模糊字眼。\n' +
          '3. 精確保留細節：保留對話中提及的所有時間、地點、人名、數字、規格、金額或約定。\n\n' +
          '【輸出報告格式】\n\n' +
          '📊【對話紀錄與各人發言摘要】\n' +
          '• 【發言人A】（紀錄其發言、提問、閒聊或分享之具體內容）\n' +
          '• 【發言人B】（紀錄其回覆、意見或反饋內容）\n\n' +
          '💡【討論焦點與共同事項】\n' +
          '• （統整所有人提及的共同話題、共識或討論進展）\n\n' +
          '🎯【交辦／待辦／約定事項】\n' +
          '• 👤 [負責人] 待辦或約定內容（包含時間或期限；若純閒聊可寫「日常交流與進度對齊」）\n\n' +
          '📚【備忘與延伸提醒】\n' +
          '• （客觀補充對話中涉及之人事物備忘或後續注意事項）',
      },
      { role: 'user', content: transcript },
    ],
  });

  return completion.choices[0].message.content.trim();
}

/**
 * 訊息量超過單次上限時，先分段摘要，再把各段摘要融合為完整全天報告
 */
async function summarizeConversation(messages) {
  if (!messages || !messages.length) return '';
  if (messages.length <= MAX_PER_BATCH) {
    return summarizeMessages(messages);
  }

  const batches = chunk(messages, MAX_PER_BATCH);
  const partials = [];
  for (const batch of batches) {
    partials.push(await summarizeMessages(batch));
  }

  const combined = partials
    .map((p, i) => `=== 第 ${i + 1} 時段分段記錄 ===\n${p}`)
    .join('\n\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          '你是一位全方位的對話記錄與摘要特助。現在提供的是一整天分段整理出的各時段對話摘要，請將它們融合成一份完整、統一的「全天對話深度總結報告」。\n\n' +
          '【最高原則】\n' +
          '1. 完整保留整天所有人的發言與紀錄，標明【發言人姓名】與重點，嚴禁遺漏任何人事物。\n' +
          '2. 格式必須嚴格符合以下結構：\n\n' +
          '📊【對話紀錄與各人發言摘要】\n' +
          '• 【發言人A】（忠實整合全天發言與討論重點）\n' +
          '• 【發言人B】...\n\n' +
          '💡【討論焦點與共同事項】\n' +
          '• （統整全天所有人提及的共同話題、共識或討論進展）\n\n' +
          '🎯【交辦／待辦／約定事項】\n' +
          '• 👤 [負責人] 待辦或約定內容（包含時間或期限）\n\n' +
          '📚【備忘與延伸提醒】\n' +
          '• （客觀補充對話中涉及之人事物備忘或後續注意事項）',
      },
      { role: 'user', content: combined },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = {
  summarizeMessages,
  summarizeConversation,
};

