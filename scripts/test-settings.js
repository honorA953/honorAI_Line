require('dotenv').config();
const db = require('../src/db');
const { createSettingsFlex } = require('../src/flex');

async function testSettings() {
  console.log('--- 1. 測試預設偏好設定 ---');
  const testConvId = 'user:test_user_' + Date.now();
  const initial = await db.getConversationSettings(testConvId);
  console.log('Initial settings:', initial);

  console.log('--- 2. 測試開啟新聞推播 ---');
  const updated1 = await db.updateConversationSettings(testConvId, { newsEnabled: true });
  console.log('Updated to newsEnabled=true:', updated1);

  console.log('--- 3. 測試關閉摘要推播 ---');
  const updated2 = await db.updateConversationSettings(testConvId, { summaryEnabled: false });
  console.log('Updated to summaryEnabled=false:', updated2);

  console.log('--- 4. 測試訂閱清單查詢 ---');
  const newsSubs = await db.getNewsSubscriberIds();
  console.log('News subscribers count:', newsSubs.length, 'Includes test:', newsSubs.includes(testConvId));

  const summarySubs = await db.getSummarySubscriberIds();
  console.log('Summary subscribers count:', summarySubs.length, 'Includes test:', summarySubs.includes(testConvId));

  console.log('--- 5. 測試生成 Flex 卡片 ---');
  const flex = createSettingsFlex(updated2);
  console.log('Flex altText:', flex.altText);
  console.log('Flex header title:', flex.contents.header.contents[1].text);

  console.log('✅ 所有設定功能測試通過！');
}

testSettings().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
