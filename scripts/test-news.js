require('dotenv').config();

const dns = require('node:dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const { getDailyConstructionDigest } = require('../src/news');
const { createConstructionNewsFlex } = require('../src/flex');

async function test() {
  console.log('=== 測試每日建築新聞智慧抓取與 AI 產經摘要 ===');
  const t0 = Date.now();
  const digest = await getDailyConstructionDigest();
  console.log(`總耗時: ${Date.now() - t0} ms`);
  console.log('今日概述:', digest.overview);
  console.log('精選篇數:', digest.items.length);
  console.log('結構化新聞清單:\n', JSON.stringify(digest.items, null, 2));

  const flexCard = createConstructionNewsFlex(digest);
  console.log('Flex 卡片產生成功! AltText:', flexCard.altText);
  console.log('Flex Card Bubble Size:', flexCard.contents.size);
  console.log('============================================');
}

test().catch(console.error);
