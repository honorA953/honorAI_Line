require('dotenv').config();
const { enrichMessageText, summarizeYoutube, summarizeWebpage, describeImage } = require('../src/multimodal');
const { summarizeMessages } = require('../src/summarize');

async function main() {
  console.log('=== 1. 測試 YouTube 影片摘要 ===');
  // 測試一個公開的 YouTube 影片 (如 Google 的經典影片或演講)
  const ytResult = await summarizeYoutube('https://www.youtube.com/watch?v=jNQXAC9IVRw', 'jNQXAC9IVRw');
  console.log('YouTube 摘要結果:\n', ytResult);
  console.log('-----------------------------------');

  console.log('=== 2. 測試網頁連結摘要 ===');
  const webResult = await summarizeWebpage('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
  console.log('網頁摘要結果:\n', webResult);
  console.log('-----------------------------------');

  console.log('=== 3. 測試訊息富化 (enrichMessageText) ===');
  const enriched = await enrichMessageText('大家看一下這個連結 https://www.youtube.com/watch?v=jNQXAC9IVRw 還有這個 https://developer.mozilla.org/en-US/docs/Web/JavaScript');
  console.log('訊息富化結果:\n', enriched);
  console.log('-----------------------------------');

  console.log('=== 4. 測試綜合對話摘要 (包含多模態訊息) ===');
  const sampleMessages = [
    {
      displayName: 'Alice',
      text: '大家早安，今天開會前請看一下這個影片！\n\n' + ytResult,
      timestamp: Date.now() - 3600000,
    },
    {
      displayName: 'Bob',
      text: '[🖼️ 圖片內容: 圖表顯示 2026 年 Q2 銷售額成長 35%，其中新產品線佔比最高達 60%]',
      timestamp: Date.now() - 2400000,
    },
    {
      displayName: 'Charlie',
      text: '[🎙️ 語音訊息: "我覺得 Q2 的數據很漂亮，下午兩點大家準時在會議室集合討論行銷預算。"]',
      timestamp: Date.now() - 1200000,
    },
  ];

  const summary = await summarizeMessages(sampleMessages);
  console.log('綜合對話摘要結果:\n', summary);
  console.log('===================================');
}

main().catch(console.error);
