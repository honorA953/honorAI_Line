require('dotenv').config();

const dns = require('node:dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const cheerio = require('cheerio');
const OpenAI = require('openai');
const db = require('./db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// 6 大專業主題 RSS 來源矩陣（限定 2~3 天內最新新聞 when:2d / when:3d）
const RSS_CATEGORY_MAP = {
  all: [
    'https://news.google.com/rss/search?q=(建築+OR+營造+OR+都市更新+OR+重大工程+OR+綠建築)+when:2d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(建案+OR+房市法規+OR+預售屋+OR+工料報價+OR+地盤改良)+when:2d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(智慧建築+OR+BIM+OR+土木工程+OR+公共工程)+when:2d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  esg: [
    'https://news.google.com/rss/search?q=(綠建築+OR+淨零碳排+OR+低碳建材+OR+ESG建築+OR+建築能效)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(再生能源建築+OR+碳費+OR+環保營建+OR+綠建材)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  regulation: [
    'https://news.google.com/rss/search?q=(都市更新+OR+危老重建+OR+容積獎勵+OR+國土計畫+OR+建築法規)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(平均地權+OR+囤房稅+OR+土地開發+OR+建管處+OR+使照)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  design: [
    'https://news.google.com/rss/search?q=(建築設計+OR+空間設計+OR+普立茲克+OR+景觀設計+OR+地標建築)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(國際建築大獎+OR+公共美學+OR+展覽館建築)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  engineering: [
    'https://news.google.com/rss/search?q=(營造工程+OR+捷運工程+OR+結構工程+OR+重大建設+OR+預鑄工法)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(隧道橋梁+OR+連續壁+OR+地基開挖+OR+鋼結構工程)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ],
  smart: [
    'https://news.google.com/rss/search?q=(智慧建築+OR+BIM+OR+營建科技+OR+營造自動化+OR+PropTech)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=(智慧防災+OR+建築物聯網+OR+數位雙生+OR+AI工地)+when:3d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
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

/**
 * 驗證連結是否可正常存取 (HTTP 200~399)
 */
async function verifyUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(3500),
    });
    return res.status >= 200 && res.status < 400;
  } catch (_) {
    return false;
  }
}

/**
 * 計算友善的相對時間文字
 */
function formatRelativeTime(dateOrTimestamp) {
  if (!dateOrTimestamp) return '';
  const ts = typeof dateOrTimestamp === 'number' ? dateOrTimestamp : new Date(dateOrTimestamp).getTime();
  if (isNaN(ts) || ts <= 0) return '';

  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 60) return `${Math.max(1, diffMins)} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays === 1) return '昨天';
  if (diffDays <= 3) return `${diffDays} 天前`;
  return new Date(ts).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
}

/**
 * 從 RSS 來源並行抓取最新新聞，並依照發布時間由新到舊排序
 */
async function fetchRawRssNews(topic = 'all') {
  const feeds = RSS_CATEGORY_MAP[topic] || RSS_CATEGORY_MAP.all;
  console.log(`[news] Fetching latest RSS feeds for topic [${topic}] (${feeds.length} feeds)...`);

  const xmlResults = await Promise.all(
    feeds.map((feedUrl) =>
      fetch(feedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(6000),
      })
        .then((res) => res.text())
        .catch((err) => {
          console.error(`[news] RSS fetch error (${feedUrl}):`, err.message);
          return '';
        })
    )
  );

  const items = [];
  const now = Date.now();
  const maxAgeMs = 3 * 24 * 60 * 60 * 1000; // 最多取 3 天內新聞

  for (const xml of xmlResults) {
    if (!xml) continue;
    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').each((_, el) => {
        let title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDateStr = $(el).find('pubDate').text().trim();
        let source = $(el).find('source').text().trim();
        const description = $(el).find('description').text().replace(/<[^>]+>/g, '').trim();

        // 簡化標題與提取來源
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          if (!source) source = parts.pop().trim();
          title = parts.join(' - ').trim();
        }
        if (!source) source = '產業即時情報';

        const timestamp = pubDateStr ? new Date(pubDateStr).getTime() : 0;
        const timeAgo = formatRelativeTime(timestamp);

        if (title && link && !items.some((it) => it.title === title || it.link === link)) {
          // 若有時間資訊且小於 3 天則納入，若無時間資訊也先納入
          if (timestamp === 0 || now - timestamp <= maxAgeMs) {
            items.push({ title, link, pubDateStr, timestamp, timeAgo, source, description });
          }
        }
      });
    } catch (err) {
      console.error('[news] XML parse error:', err.message);
    }
  }

  // 依發布時間由最新到最舊排序
  items.sort((a, b) => b.timestamp - a.timestamp);

  console.log(`[news] Total fresh items parsed for [${topic}]: ${items.length}`);
  return items;
}

/**
 * 利用 OpenAI 進行新聞專業篩選、提煉與產業洞察，確保連結百分之百有效與最新
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
    `[news] Unseen fresh candidates: ${unseenItems.length} / Total: ${rawItems.length} (Seen history: ${seenList.length})`
  );

  // 若未看過的新聞不足 3 篇，重置洗牌
  if (unseenItems.length < 3) {
    console.log('[news] Unseen items pool nearly exhausted, resetting candidate rotation...');
    unseenItems = [...rawItems];
  }

  // 依時間排序取前 15 則候選新聞
  const topCandidates = unseenItems.slice(0, 15);

  // 並行驗證前 15 則新聞的連結可用性
  const verifiedCandidates = [];
  const checkResults = await Promise.all(
    topCandidates.map(async (item) => {
      const isValid = await verifyUrl(item.link);
      return { item, isValid };
    })
  );

  for (const { item, isValid } of checkResults) {
    if (isValid) {
      verifiedCandidates.push(item);
    } else {
      console.log(`[news] Filtered out unreachable link: ${item.title} (${item.link.slice(0, 60)})`);
    }
  }

  const candidatePool = verifiedCandidates.length >= 3 ? verifiedCandidates : topCandidates;

  // 建立候選索引表，避免 LLM 改寫破壞 URL
  const candidateMap = new Map();
  const rawListText = candidatePool
    .slice(0, 12)
    .map((item, idx) => {
      const id = idx + 1;
      candidateMap.set(id, item);
      candidateMap.set(item.title, item);
      return `[#${id}] 標題: ${item.title}\n來源: ${item.source} (${item.timeAgo || '最新'})\n時間: ${item.pubDateStr}\n摘要節錄: ${item.description.slice(0, 150)}`;
    })
    .join('\n---\n');

  console.log(`[news] Requesting OpenAI summary for ${candidateMap.size / 2} verified candidates...`);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是一位高級建築、營建工程與都市規劃領域的資深產業分析顧問。\n' +
            '請從提供的最新新聞候選清單中，嚴格篩選出 3~4 則最精彩、最具備「專業價值、產業重大影響力、技術前瞻或重大政策」的新聞（排除八卦、廣告與低價值內容）。\n' +
            '請務必根據候選編號 `candidateId` 回傳，以保證連結正確無誤。\n\n' +
            '【撰寫原則】所有欄位皆須為完整、流暢且專業的繁體中文語句，嚴禁在標題、摘要或解讀中使用省略號「...」或截斷文字！\n\n' +
            '請輸出符合下列繁體中文 JSON 格式：\n' +
            '{\n' +
            '  "overview": "今日建築與營造產業核心脈動概述",\n' +
            '  "items": [\n' +
            '    {\n' +
            '      "candidateId": 1,\n' +
            '      "category": "分類標籤 (例如: 🏛️ 前瞻設計 / 🌿 綠建ESG / 📜 政策法規 / 🏗️ 重大工程 / 🏢 智慧科技 / 🌍 國際動態)",\n' +
            '      "title": "精煉新聞完整標題",\n' +
            '      "summary": "核心重點與事件完整精華",\n' +
            '      "insight": "專家產業影響解讀或延伸觀點"\n' +
            '    }\n' +
            '  ]\n' +
            '}',
        },
        { role: 'user', content: rawListText },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const jsonStr = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    const rawItemsFromAi = Array.isArray(parsed.items) ? parsed.items : [];
    const finalItems = [];

    for (const aiItem of rawItemsFromAi) {
      // 從候選表找回原本的精確有效 URL 與來源資訊
      const original = candidateMap.get(aiItem.candidateId) || candidateMap.get(aiItem.title);
      if (original) {
        finalItems.push({
          category: aiItem.category || '🏗️ 產業焦點',
          title: aiItem.title || original.title,
          summary: aiItem.summary || original.description || original.title,
          insight: aiItem.insight || '密切關注後續市場與工程動態發展。',
          source: original.source || '即時情報',
          url: original.link,
          timeAgo: original.timeAgo || '',
        });
      }
    }

    // 若 AI 回傳數量不足 3 則，補齊候選項目
    if (finalItems.length < 3) {
      for (const cand of candidatePool) {
        if (!finalItems.some((f) => f.url === cand.link)) {
          finalItems.push({
            category: '🏗️ 產業即時',
            title: cand.title,
            summary: cand.description || cand.title,
            insight: '持續追蹤後續進度與產業影響。',
            source: cand.source,
            url: cand.link,
            timeAgo: cand.timeAgo || '',
          });
          if (finalItems.length >= 3) break;
        }
      }
    }

    // 成功挑選後，記錄到 Redis 已閱指紋庫，防止未來重複
    const recordFingerprints = [];
    finalItems.forEach((it) => {
      if (it.url) recordFingerprints.push(it.url);
      if (it.title) recordFingerprints.push(it.title);
    });
    if (recordFingerprints.length > 0) {
      await db.recordSeenNews(recordFingerprints);
    }

    return {
      overview: parsed.overview || '今日建築與營造產業核心脈動總覽',
      items: finalItems,
    };
  } catch (err) {
    console.error('[news] summarize error:', err.message);
    const fallbackItems = candidatePool.slice(0, 3).map((item) => ({
      category: '🏗️ 產業即時',
      title: item.title,
      summary: item.description || item.title,
      insight: '密切關注後續市場與工程動態發展。',
      source: item.source,
      url: item.link,
      timeAgo: item.timeAgo || '',
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
  verifyUrl,
  formatRelativeTime,
  RSS_CATEGORY_MAP,
  CATEGORY_NAMES,
};

