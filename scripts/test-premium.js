require('dotenv').config();
const { summarizeYoutube, summarizeWebpage, describeImage } = require('../src/multimodal');
const { createVideoFlex, createWebFlex, createImageFlex, createExecutiveSummaryFlex } = require('../src/flex');
const { summarizeMessages } = require('../src/summarize');

async function testPremium() {
  console.log('=== 1. 測試 YouTube 智庫級解析與資料補充 ===');
  const yt = await summarizeYoutube('https://www.youtube.com/watch?v=jNQXAC9IVRw', 'jNQXAC9IVRw');
  console.log('YouTube 結構化結果:', JSON.stringify(yt, null, 2));

  const ytFlex = createVideoFlex(yt);
  console.log('YouTube Flex 卡片產生成功! Type:', ytFlex.type, 'AltText:', ytFlex.altText);
  console.log('--------------------------------------------------');

  console.log('=== 2. 測試 網頁 智庫級解析與資料補充 ===');
  const web = await summarizeWebpage('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
  console.log('Web 結構化結果:', JSON.stringify(web, null, 2));

  const webFlex = createWebFlex(web);
  console.log('Web Flex 卡片產生成功! Type:', webFlex.type, 'AltText:', webFlex.altText);
  console.log('--------------------------------------------------');

  console.log('=== 3. 測試 圖片 智慧辨識與專業洞察 ===');
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const imgData = await describeImage(Buffer.from(samplePngBase64, 'base64'));
  console.log('Image 結構化結果:', JSON.stringify(imgData, null, 2));

  const imgFlex = createImageFlex(imgData);
  console.log('Image Flex 卡片產生成功! Type:', imgFlex.type, 'AltText:', imgFlex.altText);
  console.log('--------------------------------------------------');

  console.log('=== 4. 測試 總結報告與延伸智庫補充 ===');
  const sampleMessages = [
    {
      displayName: 'Alice',
      text: yt.textSummary,
      timestamp: Date.now() - 3600000,
    },
    {
      displayName: 'Bob',
      text: imgData.textSummary,
      timestamp: Date.now() - 2400000,
    },
    {
      displayName: '主管',
      text: '這週我們決定採用這項技術，下週一前請 Alice 準備好評估架構，Bob 負責環境搭建。',
      timestamp: Date.now() - 1200000,
    },
  ];

  const summary = await summarizeMessages(sampleMessages);
  console.log('高階總結報告:\n', summary);

  const summaryFlex = createExecutiveSummaryFlex({ title: '📋 對話深度總結報告', summaryText: summary });
  console.log('Summary Flex 卡片產生成功! Type:', summaryFlex.type);
  console.log('==================================================');
}

testPremium().catch(console.error);
