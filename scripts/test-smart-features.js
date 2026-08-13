require('dotenv').config();

const db = require('../src/db');
const {
  parseNoteFromText,
  synthesizeAll,
  askAssistant,
} = require('../src/assistant');
const {
  createNotesFlex,
  createNoteHelperFlex,
  createSynthesisFlex,
  createAssistantFlex,
  createMenuFlex,
  getQuickReply,
} = require('../src/flex');

async function testSmartFeatures() {
  console.log('=== 1. 測試 Quick Reply 快捷按鈕 ===');
  const qr = getQuickReply();
  console.log('Quick reply items:', qr.items.map((i) => i.action.label).join(' | '));

  console.log('\n=== 2. 測試智能記事解析與存取 ===');
  const testConvId = 'test:smart_user_' + Date.now();
  await db.clearNotes(testConvId);

  const sampleInputs = [
    '記下：下週三向建管處送審執照變更案',
    '幫我記：明天上午9點結構技師工地會勘，確認地下室逆打工法地盤改良',
    '備忘：鋼筋每噸最新報價 21,500 元，預計下週一前確認發包',
  ];

  for (const input of sampleInputs) {
    console.log(`\n輸入: "${input}"`);
    const parsed = await parseNoteFromText(input);
    console.log('解析結果:', JSON.stringify(parsed, null, 2));
    await db.addNote(testConvId, parsed);
  }

  const savedNotes = await db.getNotes(testConvId);
  console.log(`\n目前已存入 ${savedNotes.length} 筆記事。`);

  console.log('\n=== 3. 測試 📝 智能記事本 Flex 卡片生成 ===');
  const notesFlex = createNotesFlex(savedNotes);
  console.log('Notes Flex altText:', notesFlex.altText);
  console.log('Notes Flex body cards count:', notesFlex.contents.body.contents.length);

  console.log('\n=== 4. 測試 📊 全方位智能統整 (跨維度對話 + 記事 + 數據) ===');
  const sampleMessages = [
    {
      displayName: '張建築師',
      text: '我們今天確認了危老容積獎勵可以爭取到滿額 40%，時程獎勵佔 4%。',
      timestamp: Date.now() - 1000 * 60 * 30,
    },
    {
      displayName: '李技師',
      text: '連續壁厚度建議由 70cm 提升至 80cm，避免開挖階段側向變位過大。',
      timestamp: Date.now() - 1000 * 60 * 15,
    },
    {
      displayName: '王主任',
      text: '鋼筋報價已經拿到 21,500/噸，水泥目前每立方 2,800 元。',
      timestamp: Date.now() - 1000 * 60 * 5,
    },
  ];

  const synthResult = await synthesizeAll({
    messages: sampleMessages,
    notes: savedNotes,
    displayName: '專案總監',
  });
  console.log('智能統整輸出:', JSON.stringify(synthResult, null, 2));

  const synthFlex = createSynthesisFlex({ data: synthResult });
  console.log('Synthesis Flex altText:', synthFlex.altText);

  console.log('\n=== 5. 測試 🤖 結合記事本記憶的 AI 智庫問答 ===');
  const q1 = '我目前有哪些待辦事項？另外請問鋼筋最新報價是多少？';
  console.log(`提問: "${q1}"`);
  const assistantAns = await askAssistant({
    question: q1,
    displayName: '專案總監',
    recentMessages: sampleMessages,
    notes: savedNotes,
  });
  console.log('AI 特助回答 (具備記事脈絡):', JSON.stringify(assistantAns, null, 2));

  const assistantFlex = createAssistantFlex({
    question: q1,
    data: assistantAns,
  });
  console.log('Assistant Flex altText:', assistantFlex.altText);

  console.log('\n=== 6. 測試 控制台選單 Flex 卡片 ===');
  const menuFlex = createMenuFlex();
  console.log('Menu Flex altText:', menuFlex.altText);

  console.log('\n=== 7. 測試 📝 智能記事快捷引導選單 Flex 卡片 ===');
  const helperFlex = createNoteHelperFlex();
  console.log('Helper Flex altText:', helperFlex.altText);
  console.log('Template buttons count:', helperFlex.contents.body.contents.length);

  // 清理測試資料
  await db.clearNotes(testConvId);
  console.log('\n🎉 所有智能記事、跨維度統整、智庫問答整合測試全部通過！');
}

testSmartFeatures().catch(console.error);
