const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * 智慧解析用戶的記事/待辦/備忘內容
 */
async function parseNoteFromText(userText) {
  const prompt =
    '你是一位智能特助秘書。請從用戶的輸入文字中，自動提煉出結構化記事/待辦資訊：\n\n' +
    `輸入文字：${userText}\n\n` +
    '請輸出繁體中文 JSON：\n' +
    '{\n' +
    '  "category": "分類標籤 (例如: 📅 日程會議 / 📋 待辦交辦 / 💰 報價成本 / 📐 工程技術 / 💡 備忘靈感 / 📜 法規送審)",\n' +
    '  "title": "簡潔精準的記事標題 (20字以內)",\n' +
    '  "details": "詳細內容或補充說明 (50字以內，無則可留空)",\n' +
    '  "dueDate": "截止日期或時間 (如: 明天上午9點、下週三、2026/08/20，若未提及填寫「未指定」)"\n' +
    '}\n' +
    '請只輸出純 JSON 格式字串，不要加 markdown 標記。';

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      category: parsed.category || '📋 待辦事項',
      title: parsed.title || userText.slice(0, 25),
      details: parsed.details || '',
      dueDate: parsed.dueDate || '未指定',
    };
  } catch (err) {
    console.error('[assistant] parseNoteFromText error:', err.message);
    return {
      category: '📋 待辦事項',
      title: userText.replace(/^(記下|幫我記|記事|備忘|提醒我|待辦|todo|note)[:：\s]*/i, '').slice(0, 30),
      details: '',
      dueDate: '未指定',
    };
  }
}

/**
 * 跨維度智能統整 (整合對話、記事待辦、分享連結與重要數據)
 */
async function synthesizeAll({ messages = [], notes = [], displayName = '使用者' }) {
  const msgContext = messages
    .slice(-30)
    .map((m) => `[${new Date(m.timestamp).toLocaleTimeString('zh-TW')}] ${m.displayName || '用戶'}: ${m.text}`)
    .join('\n');

  const noteContext = notes
    .map((n, i) => `[記事${i + 1}] [${n.category}] ${n.title} (截止: ${n.dueDate || '無'}) - ${n.details || '無說明'}`)
    .join('\n');

  const systemPrompt =
    '你是一位高級商業與營造工程智庫戰略總監。\n' +
    '請將目前累積的「聊天紀錄、圖文/影音解析、重要數據」與「待辦記事本清單」進行高維度全方位深度統整，提煉出具備決策價值的架構性公文簡報。\n\n' +
    '請輸出符合下列繁體中文 JSON 格式：\n' +
    '{\n' +
    '  "overview": "今日工作與對話推進總結 (60字以內)",\n' +
    '  "coreDecisions": ["重要決策/共識1", "重要決策/共識2"],\n' +
    '  "actionItems": ["待辦與工程交辦事項1 (註明負責人或期限)", "待辦事項2"],\n' +
    '  "keyData": ["重要數據、建材報價或法規指標備忘1", "關鍵數據2"],\n' +
    '  "risksAndWatch": "實務工程介面、法規或時程之潛在風險預警 (50字以內)",\n' +
    '  "strategicAdvice": "總監級下一步推進戰略建議 (50字以內)"\n' +
    '}\n' +
    '請只輸出純 JSON 格式字串，不要加 markdown 標記。';

  const userContent =
    `【對話紀錄】\n${msgContext || '（暫無近期對話）'}\n\n` +
    `【進行中記事本清單】\n${noteContext || '（目前無待辦記事）'}`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.6,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      overview: parsed.overview || '今日對話與記事統整完成。',
      coreDecisions: Array.isArray(parsed.coreDecisions) ? parsed.coreDecisions : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      keyData: Array.isArray(parsed.keyData) ? parsed.keyData : [],
      risksAndWatch: parsed.risksAndWatch || '',
      strategicAdvice: parsed.strategicAdvice || '',
      rawText: raw,
    };
  } catch (err) {
    console.error('[assistant] synthesizeAll error:', err.message);
    return {
      overview: '對話與記事統整產出中發生錯誤。',
      coreDecisions: [],
      actionItems: notes.map((n) => `[${n.category}] ${n.title}`),
      keyData: [],
      risksAndWatch: '',
      strategicAdvice: '',
      rawText: err.message,
    };
  }
}

/**
 * AI 建築與營造智慧顧問特助問答 (結構化專家深度解析 + 記事脈絡)
 */
async function askAssistant({ question, displayName = '使用者', recentMessages = [], notes = [] }) {
  const systemPrompt =
    '你是一位頂級「AI 建築、空間設計、營造工程與都市更新智庫首席特助」。\n' +
    '你具備資深建築師、土木結構技師與營造專案經理 (PM) 的多重視角與實戰經驗。\n' +
    '若用戶詢問關於他們的記事、待辦、過去紀錄或特定問題，請結合提供的記事本與對話上下文精準作答。\n\n' +
    '【專業涵蓋領域】\n' +
    '1. 🏛️ 建築規劃與空間設計：機能配置、動線採光、立面材料、綠建築 EEWH / LEED / WELL 指標、日照權與建築技術規則。\n' +
    '2. 🏗️ 營造工法與結構工程：RC / SRC / SS 結構特性、連續壁工法、逆打工法、預鑄 PC 工法、地盤改良、BIM 智慧建模、工程造價估算。\n' +
    '3. 📜 都更危老與土地法規：都更條例、危老重建、容積獎勵試算（時程/規模/綠建築/智慧建築/耐震）、建蔽率容積率、國土計畫法、產權整合。\n' +
    '4. 🌿 淨零建築與永續 ESG：建築能效標示 (BERS)、低碳建材、碳足跡、太陽能光電與智慧建築物聯網 (IoT)。\n' +
    '5. 💰 成本與商務決策：營造單價/坪分析、工期管控、價值工程 (VE)、發包策略與風險避坑。\n' +
    '6. 🤖 特助互動與日常服務：面對打招呼、狀態確認、功能導引或一般諮詢，以親切專業的特助身分直接回應。\n\n' +
    '【回覆原則】\n' +
    '- 專業犀利、條理清晰、直擊核心，不說廢話，遇到專業問題給出具體數字、工法或法規條款依據；日常互動則溫暖得體。\n' +
    '- 輸出繁體中文 JSON 格式：\n' +
    '{\n' +
    '  "category": "領域標籤 (例如: 🤖 智庫特助解答 / 📜 都更危老法規 / 🏗️ 營造結構工法 / 🏛️ 建築空間設計 / 🌿 綠建ESG淨零 / 💰 造價與成本管控 / 📝 記事檢索答覆)",\n' +
    '  "conclusion": "核心結論或親切回覆 (60字以內)",\n' +
    '  "details": ["關鍵要點或解析1 (若為日常簡答可1~2點)", "關鍵要點2"],\n' +
    '  "risks": "實務潛在風險與避坑注意點 (若無可填寫「無特定風險」或留空)",\n' +
    '  "nextStep": "建議下一步行動或可協助之處 (50字以內)"\n' +
    '}\n' +
    '請只輸出純 JSON 格式字串，不要加 markdown 標記。';

  let contextStr = '';
  if (recentMessages && recentMessages.length > 0) {
    contextStr += '【近期對話紀錄】\n' + recentMessages
      .slice(-6)
      .map((m) => `${m.displayName || '用戶'}: ${m.text}`)
      .join('\n') + '\n\n';
  }

  if (notes && notes.length > 0) {
    contextStr += '【使用者目前記事本】\n' + notes
      .map((n, i) => `[${i + 1}] [${n.category}] ${n.title} (${n.dueDate}) - ${n.details || ''}`)
      .join('\n') + '\n\n';
  }

  const userContent = contextStr
    ? `${contextStr}【${displayName} 的問題 / 指令】\n${question}`
    : `【${displayName} 的問題 / 指令】\n${question}`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    try {
      const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        category: parsed.category || '💡 建築智庫諮詢',
        conclusion: parsed.conclusion || '',
        details: Array.isArray(parsed.details) ? parsed.details : [parsed.conclusion || ''],
        risks: parsed.risks || '',
        nextStep: parsed.nextStep || '',
        rawText: raw,
      };
    } catch (_) {
      return {
        category: '💡 建築智庫諮詢',
        conclusion: raw.slice(0, 80),
        details: [raw],
        risks: '',
        nextStep: '',
        rawText: raw,
      };
    }
  } catch (err) {
    console.error('[assistant] askAssistant error:', err.message);
    return {
      category: '⚠️ 諮詢異常',
      conclusion: '顧問連線暫時發生錯誤，請稍候重試。',
      details: [`錯誤訊息: ${err.message}`],
      risks: '',
      nextStep: '',
      rawText: err.message,
    };
  }
}

/**
 * 針對特定新聞進行深度產業智庫剖析 (結構化全維度分析)
 */
async function analyzeNewsDeeply(newsTitle) {
  const prompt =
    '你是一位資深建築、營建工程與房地產領域的首席產業分析顧問。\n' +
    `請針對以下新聞主題進行深度產業洞察剖析：\n\n` +
    `新聞主題：${newsTitle}\n\n` +
    '請深入拆解技術、法規、市場與策略，並輸出符合下列繁體中文 JSON 格式：\n' +
    '{\n' +
    '  "category": "主題分類標籤 (例如: 🌿 綠建ESG / 📜 政策法規 / 🏗️ 重大工程 / 🏢 智慧科技 / 🏛️ 空間設計)",\n' +
    '  "context": "事件核心脈絡與背景成因 (60字以內)",\n' +
    '  "techImpact": "工程技術、施工工法或建築設計面之衝擊與要求 (70字以內)",\n' +
    '  "policyImpact": "法規政策、都更獎勵或制度規範之影響評估 (70字以內)",\n' +
    '  "marketOpportunity": "產業供應鏈、市場趨勢與商機效益分析 (70字以內)",\n' +
    '  "strategyAdvice": "給建築師、營造廠或開發商的專家行動策略建議 (60字以內)"\n' +
    '}\n' +
    '請只輸出純 JSON 格式字串，不要加 markdown 標記。';

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: '你是專業建築與營造首席戰略分析顧問。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    try {
      const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        title: newsTitle,
        category: parsed.category || '🏗️ 產業深度剖析',
        context: parsed.context || '',
        techImpact: parsed.techImpact || '',
        policyImpact: parsed.policyImpact || '',
        marketOpportunity: parsed.marketOpportunity || '',
        strategyAdvice: parsed.strategyAdvice || '',
        rawText: raw,
      };
    } catch (_) {
      return {
        title: newsTitle,
        category: '🏗️ 產業深度剖析',
        context: raw.slice(0, 100),
        techImpact: '',
        policyImpact: '',
        marketOpportunity: '',
        strategyAdvice: '',
        rawText: raw,
      };
    }
  } catch (err) {
    console.error('[assistant] analyzeNewsDeeply error:', err.message);
    return {
      title: newsTitle,
      category: '⚠️ 剖析異常',
      context: `剖析失敗：${err.message}`,
      techImpact: '',
      policyImpact: '',
      marketOpportunity: '',
      strategyAdvice: '',
      rawText: err.message,
    };
  }
}

module.exports = {
  parseNoteFromText,
  synthesizeAll,
  askAssistant,
  analyzeNewsDeeply,
};
