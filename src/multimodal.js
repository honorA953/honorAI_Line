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
 * 圖片理解：使用 OpenAI Vision 分析圖片內容與文字
 */
async function describeImage(imageBuffer) {
  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '請以繁體中文簡要描述這張圖片的主題、重要畫面內容、關鍵文字或圖表數據（若有）。字數請控制在 60 字以內，扼要客觀。',
            },
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
      max_tokens: 150,
    });
    return response.choices[0]?.message?.content?.trim() || '未能辨識圖片內容';
  } catch (err) {
    console.error('[multimodal] describeImage error:', err.message);
    return '圖片分析失敗';
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
 * YouTube 影片摘要：抓取字幕逐字稿 + oEmbed 資訊並總結
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

    // 嘗試抓取字幕
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
          .slice(0, 4000);
      }
    } catch (_) {}

    if (transcriptText) {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              '你是一個精準的影片重點整理助手。請根據提供的 YouTube 影片標題與字幕內容，整理出 2~3 點核心重點，每點一句話，繁體中文呈現。',
          },
          {
            role: 'user',
            content: `標題: ${title}\n\n字幕逐字稿:\n${transcriptText}`,
          },
        ],
        max_tokens: 200,
      });
      const summary = completion.choices[0]?.message?.content?.trim();
      return `【🎬 影片: ${title}】\n${summary}`;
    }

    return `【🎬 影片: ${title}】(無提供字幕，已記錄連結)`;
  } catch (err) {
    console.error('[multimodal] summarizeYoutube error:', err.message);
    return `【🎬 YouTube 影片連結】`;
  }
}

/**
 * 一般網頁/文章摘要
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
      .slice(0, 2000);

    const contentForAi = `標題: ${title}\n簡介: ${description}\n內文節錄: ${bodyText}`.trim();
    if (contentForAi.length < 20) {
      return `【🔗 網頁: ${title}】`;
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            '請將以下網頁內容整理成 1~2 句繁體中文重點摘要，精確提煉該文章或頁面的核心訊息。',
        },
        { role: 'user', content: contentForAi },
      ],
      max_tokens: 150,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    return `【🔗 網頁: ${title}】\n重點: ${summary}`;
  } catch (err) {
    console.error('[multimodal] summarizeWebpage error:', err.message);
    return null;
  }
}

/**
 * 處理文字中的 URL，並附加摘要資訊
 */
async function enrichMessageText(text) {
  const urls = text.match(URL_REGEX);
  if (!urls || urls.length === 0) return { enrichedText: text, summaries: [] };

  const summaries = [];
  for (const url of urls.slice(0, 3)) {
    // 限制單則訊息最多解析 3 個 URL，避免阻塞
    const youtubeId = extractYoutubeId(url);
    if (youtubeId) {
      const ytSummary = await summarizeYoutube(url, youtubeId);
      if (ytSummary) summaries.push(ytSummary);
    } else {
      const webSummary = await summarizeWebpage(url);
      if (webSummary) summaries.push(webSummary);
    }
  }

  if (summaries.length === 0) return { enrichedText: text, summaries: [] };
  return {
    enrichedText: `${text}\n\n${summaries.join('\n\n')}`,
    summaries,
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
