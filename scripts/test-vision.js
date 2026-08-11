require('dotenv').config();
const { describeImage } = require('../src/multimodal');

async function testVision() {
  // A tiny 1x1 base64 red PNG
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(samplePngBase64, 'base64');
  console.log('測試 Vision 辨識...');
  const result = await describeImage(buffer);
  console.log('Vision 辨識結果:', result);
}

testVision().catch(console.error);
