require('dotenv').config();

const { execFile } = require('child_process');
const cheerio = require('cheerio');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=%E5%BB%BA%E7%AF%89+%E8%A8%AD%E8%A8%88+%E7%B6%A0%E5%BB%BA%E7%AF%89&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  'https://news.google.com/rss/search?q=%E7%87%9F%E9%80%A0+%E9%83%BD%E6%9B%B4+%E5%B7%A5%E7%A8%8B+%E6%88%BF%E5%B8%82%E6%B3%95%E8%A6%8F&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
];

function fetchWithCurl(url) {
  return new Promise((resolve, reject) => {
    execFile(
      'curl',
      [
        '-s',
        '-L',
        '--max-time',
        '6',
        '-A',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        url,
      ],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });
}

/**
 * 從 RSS 來源並行抓取最新建築與營建新聞
 */
async function fetchRawRssNews() {
  console.log('[news] Fetching RSS feeds via curl...');
  const xmlResults = await Promise.all(
    RSS_FEEDS.map((feedUrl) =>
      fetchWithCurl(feedUrl).catch((err) => {
        console.error(`[news] RSS fetch error (${feedUrl}):`, err.message);
        return '';
      })
    )
  );

  const items = [];
  for (const xml of xmlResults) {
    if (!xml) continue;
    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').slice(0, 10).each((_, el) => {
        const title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        const source = $(el).find('source').text().trim() || '產業即時新聞';
        const description = $(el).find('description').text().replace(/<[^>]+>/g, '').trim();

        if (title && !items.some((it) => it.title === title)) {
          items.push({ title, link, pubDate, source, description });
        }
      });
    } catch (err) {
      console.error('[news] XML parse error:', err.message);
    }
  }
  console.log(`[news] Total parsed raw items: ${items.length}`);
  return items;
}

/**
 * 利用 OpenAI 進行新聞專業篩選、分類提煉與產業洞察
 */
async function summarizeConstructionNews(rawItems) {
  if (!rawItems || rawItems.length === 0) {
    return {
      overview: '今日建築與營造產業新聞連線暫時無法取得最新動態。',
      items: [],
    };
  }

  const rawListText = rawItems
    .slice(0, 15)
    .map(
      (item, idx) =>
        `[${idx + 1}] 標題: ${item.title}\n來源: ${item.source}\n連結: ${item.link}\n摘要節錄: ${item.description.slice(0, 150)}`
    )
    .join('\n---\n');

  console.log(`[news] Requesting OpenAI summary for ${Math.min(rawItems.length, 15)} news items...`);
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是一位高級建築、營建工程與都市規劃領域的資深產業分析顧問。\n' +
            '請從提供的原始新聞清單中，嚴格篩選出 3~4 則最具「專業價值、產業影響力、技術前瞻或重大政策」的建築/營造相關重點新聞（排除八卦、農場文或無關內容）。\n\n' +
            '請輸出符合下列繁體中文 JSON 格式：\n' +
            '{\n' +
            '  "overview": "今日建築與營造產業核心脈動概述 (50字以內)",\n' +
            '  "items": [\n' +
            '    {\n' +
            '      "category": "分類標籤 (例如: 🏛️ 前瞻設計 / 🌿 綠建ESG / 📜 政策法規 / 🏗️ 重大工程 / 🏢 房市都更)",\n' +
            '      "title": "精煉新聞標題 (25字以內)",\n' +
            '      "summary": "核心重點與事件精華 (60字以內)",\n' +
            '      "insight": "專家產業影響解讀或延伸觀點 (40字以內)",\n' +
            '      "source": "媒體來源",\n' +
            '      "url": "原始連結網址"\n' +
            '    }\n' +
            '  ]\n' +
            '}',
        },
        { role: 'user', content: rawListText },
      ],
      max_tokens: 1500,
    });

    console.log('[news] OpenAI returned successfully, parsing JSON...');

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      overview: parsed.overview || '今日建築與營造產業重要新聞精選',
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (err) {
    console.error('[news] summarize error:', err.message);
    return {
      overview: '今日建築與營造產業精選動態',
      items: rawItems.slice(0, 3).map((item) => ({
        category: '🏗️ 產業即時',
        title: item.title.slice(0, 30),
        summary: item.description.slice(0, 60) || item.title,
        insight: '密切關注後續市場與工程動態發展。',
        source: item.source,
        url: item.link,
      })),
    };
  }
}

/**
 * 完整執行抓取與整理今日建築新聞
 */
async function getDailyConstructionDigest() {
  const raw = await fetchRawRssNews();
  const digest = await summarizeConstructionNews(raw);
  return {
    date: new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    overview: digest.overview,
    items: digest.items,
  };
}

module.exports = {
  fetchRawRssNews,
  summarizeConstructionNews,
  getDailyConstructionDigest,
};
