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

async function getDisplayName(source) {
  try {
    if (source.type === 'user') {
      const profile = await client.getProfile(source.userId);
      return profile.displayName;
    }
    if (source.type === 'group') {
      const profile = await client.getGroupMemberProfile(source.groupId, source.userId);
      return profile.displayName;
    }
    if (source.type === 'room') {
      const profile = await client.getRoomMemberProfile(source.roomId, source.userId);
      return profile.displayName;
    }
  } catch (err) {
    // 對方可能未加官方帳號為好友，或已離開群組，無法取得名稱
  }
  return '未知使用者';
}

module.exports = { line, config, client, getConversationId, getDisplayName };
