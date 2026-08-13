require('dotenv').config();

const { execFile } = require('child_process');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const db = require('./db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// 6 大專業主題 RSS 來源矩陣
const RSS_CATEGORY_MAP = {
  all: [
    'https://news.google.com/rss/search?q=%E5%BB%BA%E7%AF%89+%E8%A8%AD%E8%A8%88+%E7%B6%A0%E5%BB%BA%E7%AF%89&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=%E7%87%9F%E9%80%A0+%E9%83%BD%E6%9B%B4+%E5%B7%A5%E7%A8%8B+%E6%88%BF%E5%B8%82%E6%B3%95%E8%A6%8F&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=%E5%BB%BA%E7%AF%89%E5%B7%A5%E7%A8%8B+%E9%87%8D%E5%A4%A7%E5%BB%BA%E8%A8%AD+%E9%A0%90%E9%80%B8%E5%B7%A5%E6%B3%95&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  esg: [
    'https://news.google.com/rss/search?q=%E7%B6%A0%E5%BB%BA%E7%AF%89+%E6%B7%A8%E9%9B%B6%E7%A2%B3%E6%8E%92+ESG%E5%BB%BA%E7%AF%89+%E4%BD%8E%E7%A2%B3%E5%BB%BA%E6%9D%90&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=%E5%BB%BA%E7%AF%89%E8%83%BD%E6%95%88+%E5%86%8D%E7%94%9F%E8%83%BD%E6%BA%90+%E7%A2%B3%E8%B2%BB+%E7%92%B0%E4%BF%9D%E7%87%9F%E5%BB%BA&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  regulation: [
    'https://news.google.com/rss/search?q=%E9%83%BD%E5%B8%82%E6%9B%B4%E6%96%B0+%E5%8D%B1%E8%80%81%E9%87%8D%E5%BB%BA+%E5%AE%B9%E7%A9%8D%E7%8D%8E%E5%8B%B5+%E5%9C%8B%E5%9C%9F%E8%A8%88%E7%95%AB&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=%E5%BB%BA%E7%AF%89%E6%B3%95%E8%A6%8F+%E6%88%BF%E5%B8%82%E6%94%BF%E7%AD%96+%E5%B9%B3%E5%9D%87%E5%9C%B0%E6%AC%8A+%E5%9C%9F%E5%9C%B0%E9%96%8B%E7%99%BC&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  design: [
    'https://news.google.com/rss/search?q=%E5%BB%BA%E7%AF%89%E8%A8%AD%E8%A8%88+%E7%A9%BA%E9%96%93%E8%A8%AD%E8%A8%88+%E5%BB%BA%E7%AF%89%E5%A4%A7%E5%B8%AB+%E6%99%AF%E8%A7%80%E8%A8%AD%E8%A8%88&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=%E6%99%AE%E7%AB%8B%E8%8C%B2%E5%85%8B%E5%BB%BA%E7%AF%89%E7%8D%8E+%E5%9C%8B%E9%9A%9B%E5%BB%BA%E7%AF%89+%E5%9C%B0%E6%A8%99%E5%BB%BA%E7%AF%89&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  engineering: [
    'https://news.google.com/rss/search?q=%E7%87%9F%E9%80%A0%E5%B7%A5%E7%A8%8B+%E6%8D%B7%E9%81%8B%E5%B7%A5%E7%A8%8B+%E5%85%AC%E5%85%B1%E5%BB%BA%E8%A8%AD+%E7%B5%90%E6%A7%8B%E5%B7%A5%E7%A8%8B&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=%E9%9A%A7%E9%81%93%E6%A9%8B%E6%A2%81+%E7%87%9F%E5%BB%BA%E5%82%B7%E5%AE%B3+%E9%A0%90%E9%80%B8%E6%A8%A1%E7%B5%84+%E5%9F%BA%E7%A4%8E%E5%B7%A5%E7%A8%8B&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  smart: [
    'https://news.google.com/rss/search?q=%E6%99%BA%E6%85%A7%E5%BB%BA%E7%AF%89+BIM+%E7%87%9F%E5%BB%BA%E7%A7%91%E6%8A%80+%E7%87%9F%E9%80%A0%E8%87%AA%E5%8B%95%E5%8C%96&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=PropTech+%E6%99%BA%E6%85%A7%E9%98%B2%E7%81%BD+%E5%BB%BA%E7%AF%89%E7%89%A9%E8%81%AF%E7%B6%B2+%E6%95%B8%E4%BD%8D%E9%9B%99%E7%94%9F&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
};

const CATEGORY_NAMES = {
  all: '即時綜合全訊',
  esg: '🌿 綠建 ESG 與淨零永續',
  regulation: '📜 都更危老與法規政策',
  design: '🏛️ 前瞻空間與大師設計',
  engineering: '🏗️ 重大營造與基建工程',
  smart: '🏢 智慧建築與營建科技',
};

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
 * 從 RSS 來源並行抓取最新新聞
 */
async function fetchRawRssNews(topic = 'all') {
  const feeds = RSS_CATEGORY_MAP[topic] || RSS_CATEGORY_MAP.all;
  console.log(`[news] Fetching RSS feeds for topic [${topic}] (${feeds.length} feeds)...`);

  const xmlResults = await Promise.all(
    feeds.map((feedUrl) =>
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
      $('item').each((_, el) => {
        let title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        let source = $(el).find('source').text().trim();
        const description = $(el).find('description').text().replace(/<[^>]+>/g, '').trim();

        // 簡化標題與提取來源
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          if (!source) source = parts.pop().trim();
          title = parts.join(' - ').trim();
        }
        if (!source) source = '產業即時情報';

        if (title && !items.some((it) => it.title === title || it.link === link)) {
          items.push({ title, link, pubDate, source, description });
        }
      });
    } catch (err) {
      console.error('[news] XML parse error:', err.message);
    }
  }

  console.log(`[news] Total parsed raw items for [${topic}]: ${items.length}`);
  return items;
}

/**
 * 利用 OpenAI 進行新聞專業篩選、提煉與產業洞察，確保次次更新不重複
 */
async function summarizeConstructionNews(rawItems, { topic = 'all', seenList = [] } = {}) {
  if (!rawItems || rawItems.length === 0) {
    return {
      overview: '今日建築與營造產業新聞連線暫時無法取得最新動態。',
      items: [],
    };
  }

  const seenSet = new Set(seenList);
  // 過濾掉已經看過的新聞（依網址或標題）
  let unseenItems = rawItems.filter(
    (item) => !seenSet.has(item.link) && !seenSet.has(item.title)
  );

  console.log(
    `[news] Unseen candidates: ${unseenItems.length} / Total raw: ${rawItems.length} (Seen history: ${seenList.length})`
  );

  // 若未看過的新聞不足 3 篇（已循環多次），則取隨機洗牌後的清單
  if (unseenItems.length < 3) {
    console.log('[news] Unseen items pool nearly exhausted, shuffling pool for rotation...');
    unseenItems = [...rawItems].sort(() => Math.random() - 0.5);
  }

  // 取前 15 則未看過的候選新聞
  const candidateItems = unseenItems.slice(0, 15);
  const rawListText = candidateItems
    .map(
      (item, idx) =>
        `[${idx + 1}] 標題: ${item.title}\n來源: ${item.source}\n連結: ${item.link}\n摘要節錄: ${item.description.slice(0, 150)}`
    )
    .join('\n---\n');

  console.log(`[news] Requesting OpenAI summary for ${candidateItems.length} candidates...`);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是一位高級建築、營建工程與都市規劃領域的資深產業分析顧問。\n' +
            '請從提供的原始新聞候選清單中，嚴格篩選出 3~4 則最精彩、具備「專業價值、產業重大影響力、技術前瞻或重大政策」的新聞（排除八卦、廣告與低價值內容）。\n' +
            '請確保每則新聞摘要精闢、觀點獨到犀利。\n\n' +
            '請輸出符合下列繁體中文 JSON 格式：\n' +
            '{\n' +
            '  "overview": "今日建築與營造產業核心脈動概述 (50字以內)",\n' +
            '  "items": [\n' +
            '    {\n' +
            '      "category": "分類標籤 (例如: 🏛️ 前瞻設計 / 🌿 綠建ESG / 📜 政策法規 / 🏗️ 重大工程 / 🏢 智慧科技 / 🌍 國際動態)",\n' +
            '      "title": "精煉新聞標題 (25字以內)",\n' +
            '      "summary": "核心重點與事件精華 (60字以內)",\n' +
            '      "insight": "專家產業影響解讀或延伸觀點 (45字以內)",\n' +
            '      "source": "媒體來源",\n' +
            '      "url": "原始連結網址"\n' +
            '    }\n' +
            '  ]\n' +
            '}',
        },
        { role: 'user', content: rawListText },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    const items = Array.isArray(parsed.items) ? parsed.items : [];

    // 成功挑選後，記錄到 Redis 已閱指紋庫，防止未來重複
    const recordFingerprints = [];
    items.forEach((it) => {
      if (it.url) recordFingerprints.push(it.url);
      if (it.title) recordFingerprints.push(it.title);
    });
    if (recordFingerprints.length > 0) {
      await db.recordSeenNews(recordFingerprints);
    }

    return {
      overview: parsed.overview || '今日建築與營造產業重要新聞精選',
      items,
    };
  } catch (err) {
    console.error('[news] summarize error:', err.message);
    const fallbackItems = candidateItems.slice(0, 3).map((item) => ({
      category: '🏗️ 產業即時',
      title: item.title.slice(0, 30),
      summary: item.description.slice(0, 60) || item.title,
      insight: '密切關注後續市場與工程動態發展。',
      source: item.source,
      url: item.link,
    }));

    // 記錄 fallback
    const fallbackFingerprints = fallbackItems.map((i) => i.url || i.title).filter(Boolean);
    await db.recordSeenNews(fallbackFingerprints);

    return {
      overview: '今日建築與營造產業精選動態',
      items: fallbackItems,
    };
  }
}

/**
 * 完整執行抓取與整理今日建築新聞（支援主題分類與次次更新去重）
 */
async function getDailyConstructionDigest(options = {}) {
  const topic = options.topic || 'all';
  const seenList = await db.getSeenNewsUrls();
  const raw = await fetchRawRssNews(topic);
  const digest = await summarizeConstructionNews(raw, { topic, seenList });

  const categoryName = CATEGORY_NAMES[topic] || CATEGORY_NAMES.all;

  return {
    date: new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    category: topic,
    categoryName,
    overview: digest.overview,
    items: digest.items,
  };
}

module.exports = {
  fetchRawRssNews,
  summarizeConstructionNews,
  getDailyConstructionDigest,
  RSS_CATEGORY_MAP,
  CATEGORY_NAMES,
};
