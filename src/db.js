const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY_PREFIX = 'linechat:messages:';

// conversationId 例如 "user:U123" 或 "group:G123" 或 "room:R123"
async function appendMessage(conversationId, message) {
  await redis.rpush(KEY_PREFIX + conversationId, JSON.stringify(message));
}

async function getMessages(conversationId) {
  const raw = await redis.lrange(KEY_PREFIX + conversationId, 0, -1);
  return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
}

async function getAllConversationIds() {
  const keys = await redis.keys(`${KEY_PREFIX}*`);
  return keys.map((key) => key.slice(KEY_PREFIX.length));
}

async function clearMessages(conversationId) {
  await redis.del(KEY_PREFIX + conversationId);
}

module.exports = { appendMessage, getMessages, getAllConversationIds, clearMessages };
