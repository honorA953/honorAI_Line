require('dotenv').config();
const dns = require('node:dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const cheerio = require('cheerio');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

async function testFreshNews() {
  const url = 'https://news.google.com/rss/search?q=(建築+OR+營造+OR+都市更新+OR+重大工程+OR+綠建築)+when:2d&hl=zh-TW&gl=TW&ceid=TW:zh-Hant';
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(6000),
  });
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const rawItems = [];
  $('item').each((_, el) => {
    let title = $(el).find('title').text().trim();
    const link = $(el).find('link').text().trim();
    const pubDateStr = $(el).find('pubDate').text().trim();
    let source = $(el).find('source').text().trim();
    const description = $(el).find('description').text().replace(/<[^>]+>/g, '').trim();

    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (!source) source = parts.pop().trim();
      title = parts.join(' - ').trim();
    }
    if (!source) source = '即時情報';

    const timestamp = pubDateStr ? new Date(pubDateStr).getTime() : 0;
    if (title && link) {
      rawItems.push({ title, link, pubDateStr, timestamp, source, description });
    }
  });

  console.log('Total parsed items:', rawItems.length);
  // 依時間由新到舊排序
  rawItems.sort((a, b) => b.timestamp - a.timestamp);

  console.log('Top 5 newest items:');
  for (let i = 0; i < Math.min(5, rawItems.length); i++) {
    const it = rawItems[i];
    const isOk = await verifyUrl(it.link);
    console.log(`[${i + 1}] [${isOk ? 'LINK VALID ✅' : 'LINK INVALID ❌'}] ${it.title} (${new Date(it.timestamp).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })})`);
  }
}

testFreshNews().catch(console.error);
