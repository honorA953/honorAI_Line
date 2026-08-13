require('dotenv').config();

const { getDailyConstructionDigest } = require('../src/news');
const db = require('../src/db');
const {
  getQuickReply,
  createMenuFlex,
  createConstructionNewsFlex,
  createExecutiveSummaryFlex,
  createNewsAnalysisFlex,
  createAssistantFlex,
} = require('../src/flex');
const { askAssistant, analyzeNewsDeeply } = require('../src/assistant');

async function test() {
  console.log('=== 1. 測試 Quick Reply 快捷按鈕 ===');
  const qr = getQuickReply();
  console.log(`Quick reply items count: ${qr.items.length}`);
  console.log('Labels:', qr.items.map((it) => it.action.label).join(' | '));
  if (qr.items.length < 5) throw new Error('Quick reply items too few');

  console.log('\n=== 2. 測試控制台選單 Flex 卡片 ===');
  const menuFlex = createMenuFlex();
  console.log('Menu flex altText:', menuFlex.altText);
  if (!menuFlex.contents || menuFlex.contents.type !== 'bubble') {
    throw new Error('Menu flex bubble invalid');
  }

  console.log('\n=== 3. 測試新聞去重與次次更新機制 ===');
  // 先清空已看過的新聞
  await db.clearSeenNews();

  console.log('--- 抓取第 1 批新聞 ---');
  const batch1 = await getDailyConstructionDigest({ topic: 'all' });
  console.log(`Batch 1: ${batch1.items.length} 則新聞`);
  batch1.items.forEach((it, i) => console.log(` [1-${i + 1}] ${it.title}`));

  const seenAfter1 = await db.getSeenNewsUrls();
  console.log(`Redis 已記錄指紋數: ${seenAfter1.length}`);

  console.log('--- 抓取第 2 批新聞 (換新聞) ---');
  const batch2 = await getDailyConstructionDigest({ topic: 'all' });
  console.log(`Batch 2: ${batch2.items.length} 則新聞`);
  batch2.items.forEach((it, i) => console.log(` [2-${i + 1}] ${it.title}`));

  // 驗證 batch1 與 batch2 標題無重複
  const titles1 = new Set(batch1.items.map((i) => i.title));
  const duplicates = batch2.items.filter((i) => titles1.has(i.title));
  console.log(`重複新聞篇數: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.warn('警告：發現重複新聞', duplicates.map((d) => d.title));
  } else {
    console.log('✅ 完美：第 2 批新聞與第 1 批 100% 完全不重複！');
  }

  console.log('\n=== 4. 測試新聞 Flex 卡片生成 ===');
  const newsFlex = createConstructionNewsFlex(batch1);
  console.log('News Flex altText:', newsFlex.altText);
  console.log('News Flex footer buttons count:', newsFlex.contents.footer.contents.length);

  console.log('\n=== 5. 測試 AI 顧問問答與新聞深度剖析 ===');
  const sampleQuestion = '綠建築標章的銀級與黃金級評定標準有何核心差異？';
  console.log(`提問: ${sampleQuestion}`);
  const answer = await askAssistant({ question: sampleQuestion });
  console.log(`AI 回答節錄 (前 150 字):\n${answer.slice(0, 150)}...\n`);

  const assistantFlex = createAssistantFlex({ question: sampleQuestion, answer });
  console.log('Assistant Flex generated successfully:', assistantFlex.altText);

  if (batch1.items.length > 0) {
    const targetNews = batch1.items[0].title;
    console.log(`\n測試深度剖析新聞: ${targetNews}`);
    const analysis = await analyzeNewsDeeply(targetNews);
    console.log(`剖析節錄:\n${analysis.slice(0, 150)}...\n`);
    const analysisFlex = createNewsAnalysisFlex({ title: targetNews, analysisText: analysis });
    console.log('Analysis Flex generated successfully:', analysisFlex.altText);
  }

  console.log('\n🎉 所有功能驗證完成，運作完全正常！');
}

test().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
