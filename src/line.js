const line = require('@line/bot-sdk');

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

// 取得對話來源的識別字串，區分 1對1 / 群組 / 多人聊天室
function getConversationId(source) {
  if (source.type === 'user') return `user:${source.userId}`;
  if (source.type === 'group') return `group:${source.groupId}`;
  if (source.type === 'room') return `room:${source.roomId}`;
  return `unknown:${source.userId || 'na'}`;
}

const nameCache = new Map();
const NAME_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 快取 24 小時

async function getDisplayName(source) {
  if (!source || !source.userId) return '使用者';
  const cacheKey = `${source.type}:${source.groupId || source.roomId || ''}:${source.userId}`;
  const cached = nameCache.get(cacheKey);
  if (cached && Date.now() - cached.time < NAME_CACHE_TTL_MS) {
    return cached.name;
  }

  try {
    let name = '使用者';
    if (source.type === 'user') {
      const profile = await client.getProfile(source.userId);
      name = profile.displayName;
    } else if (source.type === 'group' && source.groupId) {
      const profile = await client.getGroupMemberProfile(source.groupId, source.userId);
      name = profile.displayName;
    } else if (source.type === 'room' && source.roomId) {
      const profile = await client.getRoomMemberProfile(source.roomId, source.userId);
      name = profile.displayName;
    }
    if (name && name !== '未知使用者') {
      nameCache.set(cacheKey, { name, time: Date.now() });
      return name;
    }
  } catch (err) {
    // 若無法取得名稱，暫存短時間避免重試造成延遲
    nameCache.set(cacheKey, { name: '使用者', time: Date.now() - NAME_CACHE_TTL_MS + 10 * 60 * 1000 });
  }
  return '使用者';
}

module.exports = { line, config, client, getConversationId, getDisplayName };

