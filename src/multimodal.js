const OpenAI = require('openai');
const { toFile } = require('openai');
const cheerio = require('cheerio');
const { YoutubeTranscript } = require('youtube-transcript');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const URL_REGEX = /https?:\/\/[^\s]+/g;

/**
 * 透過 LINE Content API 下載檔案二進位資料
 */
async function fetchLineContent(messageId) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`LINE Content API error: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * 圖片深度理解：畫面解析、OCR 萃取與智庫級延伸分析
 */
async function describeImage(imageBuffer) {
  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是一位高級智能商業與技術分析顧問。請深入分析用戶傳送的圖片，輸出繁體中文 JSON 物件：\n' +
            '【要求】所有欄位皆須為完整通順之專業語句，嚴禁在任何欄位中使用省略號「...」或截斷文字。\n\n' +
            '{\n' +
            '  "description": "精準客觀描述圖片主題與核心畫面",\n' +
            '  "ocr": "若圖中有重要文字、表格數據、金額、代碼或資訊請提取整理，無則填寫「無重要文字」",\n' +
            '  "supplement": "根據圖片內容進行深度分析、背景知識補充、趨勢解讀或專業建議"\n' +
            '}\n' +
            '請只輸出純 JSON 格式字串，不要加 markdown 標記。',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const raw = response.choices[0]?.message?.content?.trim() || '';
    try {
      const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        description: parsed.description || '圖片解析完成',
        ocr: parsed.ocr || '',
        supplement: parsed.supplement || '',
        textSummary: `[🖼️ 圖片解析: ${parsed.description}]` + (parsed.supplement ? `\n💡 延伸洞察: ${parsed.supplement}` : ''),
      };
    } catch (_) {
      return {
        description: raw,
        ocr: '',
        supplement: '',
        textSummary: `[🖼️ 圖片內容: ${raw}]`,
      };
    }
  } catch (err) {
    console.error('[multimodal] describeImage error:', err.message);
    return {
      description: '圖片分析失敗',
      ocr: '',
      supplement: '',
      textSummary: '[🖼️ 傳送了圖片]',
    };
  }
}

/**
 * 語音辨識：使用 OpenAI Whisper 轉文字
 */
async function transcribeAudio(audioBuffer) {
  try {
    const file = await toFile(audioBuffer, 'audio.m4a', { type: 'audio/m4a' });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'zh',
    });
    return transcription.text.trim();
  } catch (err) {
    console.error('[multimodal] transcribeAudio error:', err.message);
    return '語音轉文字失敗';
  }
}

/**
 * 解析 YouTube 影片 ID
 */
function extractYoutubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * YouTube 影片深度摘要：字幕逐字稿 + 核心精華 + AI 背景資料補充
 */
async function summarizeYoutube(url, videoId) {
  try {
    let title = 'YouTube 影片';
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        title = oembedData.title || title;
      }
    } catch (_) {}

    // 抓取字幕逐字稿
    let transcriptText = '';
    try {
      const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'zh-TW' })
        .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: 'zh' }))
        .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' }))
        .catch(() => YoutubeTranscript.fetchTranscript(videoId));

      if (items && items.length > 0) {
        transcriptText = items
          .map((i) => i.text)
          .join(' ')
          .slice(0, 4500);
      }
    } catch (_) {}

    const promptInput = transcriptText
      ? `影片標題: ${title}\n\n字幕逐字稿內容:\n${transcriptText}`
      : `影片標題: ${title}\n\n(此影片未提供公開字幕，請根據標題與該主題進行分析)`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是一位高階智庫與內容精研分析師。請分析這部 YouTube 影片，並輸出繁體中文 JSON：\n' +
            '【要求】所有要點皆須為完整通順語句，嚴禁使用省略號「...」或截斷句子。\n\n' +
            '{\n' +
            '  "title": "完整清晰的影片標題",\n' +
            '  "points": ["核心重點1", "核心重點2", "核心重點3"],\n' +
            '  "supplement": "主動補充背景知識、產業脈絡、專有名詞科普、核心洞察或相關延伸資訊"\n' +
            '}\n' +
            '請只輸出純 JSON 格式字串，不要加 markdown 標記。',
        },
        { role: 'user', content: promptInput },
      ],
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    try {
      const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonStr);
      const points = Array.isArray(parsed.points) ? parsed.points : [];
      const textPoints = points.map((p, i) => `${i + 1}. ${p}`).join('\n');
      const textSummary =
        `【🎬 影片: ${parsed.title || title}】\n` +
        `📌 核心重點:\n${textPoints}\n\n` +
        `💡 AI 智庫補充:\n${parsed.supplement || '無額外補充'}`;

      return {
        title: parsed.title || title,
        points,
        supplement: parsed.supplement || '',
        url,
        textSummary,
      };
    } catch (_) {
      return {
        title,
        points: [raw],
        supplement: '',
        url,
        textSummary: `【🎬 影片: ${title}】\n${raw}`,
      };
    }
  } catch (err) {
    console.error('[multimodal] summarizeYoutube error:', err.message);
    return {
      title: 'YouTube 影片',
      points: ['影片連結解析失敗'],
      supplement: '',
      url,
      textSummary: `【🎬 影片連結: ${url}】`,
    };
  }
}

/**
 * 一般網頁/新聞深度摘要與背景延伸
 */
async function summarizeWebpage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') || $('title').text().trim() || '網頁連結';
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    let bodyText = $('article, main, p')
      .map((_, el) => $(el).text())
      .get()
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2500);

    const contentForAi = `標題: ${title}\n簡介: ${description}\n內文節錄: ${bodyText}`.trim();
    if (contentForAi.length < 20) {
      return null;
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是一位專業情報與內容分析師。請分析此網頁內容，並輸出繁體中文 JSON：\n' +
            '【要求】所有欄位皆須為完整且語意通順之繁體中文，嚴禁在任何欄位中使用省略號「...」或截斷文字。\n\n' +
            '{\n' +
            '  "title": "完整網頁標題",\n' +
            '  "summary": "提煉該頁面的核心完整精華",\n' +
            '  "supplement": "主動補充該主題的背景來歷、產業趨勢、技術概念或延伸重要資訊"\n' +
            '}\n' +
            '請只輸出純 JSON 格式字串，不要加 markdown 標記。',
        },
        { role: 'user', content: contentForAi },
      ],
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    try {
      const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonStr);
      const textSummary =
        `【🔗 網頁: ${parsed.title || title}】\n` +
        `📌 核心摘要: ${parsed.summary}\n\n` +
        `💡 AI 背景補充: ${parsed.supplement || '無'}`;

      return {
        title: parsed.title || title,
        summary: parsed.summary || '',
        supplement: parsed.supplement || '',
        url,
        textSummary,
      };
    } catch (_) {
      return {
        title,
        summary: raw,
        supplement: '',
        url,
        textSummary: `【🔗 網頁: ${title}】\n${raw}`,
      };
    }
  } catch (err) {
    console.error('[multimodal] summarizeWebpage error:', err.message);
    return null;
  }
}

/**
 * 處理文字中的 URL，並回傳結構化資料與純文字摘要
 */
async function enrichMessageText(text) {
  const urls = text.match(URL_REGEX);
  if (!urls || urls.length === 0) return { enrichedText: text, items: [] };

  const items = [];
  const textSummaries = [];

  for (const url of urls.slice(0, 3)) {
    const youtubeId = extractYoutubeId(url);
    if (youtubeId) {
      const ytResult = await summarizeYoutube(url, youtubeId);
      if (ytResult) {
        items.push({ type: 'youtube', ...ytResult });
        textSummaries.push(ytResult.textSummary);
      }
    } else {
      const webResult = await summarizeWebpage(url);
      if (webResult) {
        items.push({ type: 'web', ...webResult });
        textSummaries.push(webResult.textSummary);
      }
    }
  }

  if (textSummaries.length === 0) return { enrichedText: text, items: [] };
  return {
    enrichedText: `${text}\n\n${textSummaries.join('\n\n')}`,
    items,
  };
}

module.exports = {
  fetchLineContent,
  describeImage,
  transcribeAudio,
  enrichMessageText,
  summarizeYoutube,
  summarizeWebpage,
};
