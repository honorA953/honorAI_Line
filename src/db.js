const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY_PREFIX = 'linechat:messages:';
const HISTORY_KEY = 'linechat:history';
const CONVERSATIONS_SET_KEY = 'linechat:conversations';

// 登記對話 ID 至活躍訂閱集合
async function registerConversation(conversationId) {
  try {
    if (conversationId && !conversationId.startsWith('unknown:')) {
      await redis.sadd(CONVERSATIONS_SET_KEY, conversationId);
    }
  } catch (err) {
    console.error('[db] registerConversation error:', err.message);
  }
}

// conversationId 例如 "user:U123" 或 "group:G123" 或 "room:R123"
async function appendMessage(conversationId, message) {
  await registerConversation(conversationId);
  await redis.rpush(KEY_PREFIX + conversationId, JSON.stringify(message));
}

async function getMessages(conversationId) {
  const raw = await redis.lrange(KEY_PREFIX + conversationId, 0, -1);
  return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
}

async function getAllConversationIds() {
  try {
    const registered = (await redis.smembers(CONVERSATIONS_SET_KEY).catch(() => [])) || [];
    const keys = (await redis.keys(`${KEY_PREFIX}*`).catch(() => [])) || [];
    const fromKeys = keys.map((key) => key.slice(KEY_PREFIX.length));
    return Array.from(new Set([...registered, ...fromKeys]));
  } catch (err) {
    console.error('[db] getAllConversationIds error:', err.message);
    return [];
  }
}

async function clearMessages(conversationId) {
  await redis.del(KEY_PREFIX + conversationId);
}

// 每次產生摘要時留一份完整記錄（含原始訊息），供同步程式備份到外部資料庫後再清除
async function appendHistory(record) {
  await redis.rpush(HISTORY_KEY, JSON.stringify(record));
}

const SEEN_NEWS_KEY = 'linechat:seen_news';
const inMemorySeen = new Set();

async function getSeenNewsUrls() {
  try {
    const urls = (await redis.smembers(SEEN_NEWS_KEY).catch(() => [])) || [];
    if (urls && Array.isArray(urls)) {
      urls.forEach((u) => inMemorySeen.add(u));
    }
    return Array.from(inMemorySeen);
  } catch (err) {
    console.error('[db] getSeenNewsUrls error:', err.message);
    return Array.from(inMemorySeen);
  }
}

async function recordSeenNews(items) {
  if (!items || !items.length) return;
  const list = (Array.isArray(items) ? items : [items]).filter(Boolean);
  if (!list.length) return;
  list.forEach((item) => inMemorySeen.add(item));
  try {
    await redis.sadd(SEEN_NEWS_KEY, ...list);
  } catch (err) {
    console.error('[db] recordSeenNews error:', err.message);
  }
}

async function clearSeenNews() {
  inMemorySeen.clear();
  try {
    await redis.del(SEEN_NEWS_KEY);
  } catch (err) {
    console.error('[db] clearSeenNews error:', err.message);
  }
}

module.exports = {
  registerConversation,
  appendMessage,
  getMessages,
  getAllConversationIds,
  clearMessages,
  appendHistory,
  getSeenNewsUrls,
  recordSeenNews,
  clearSeenNews,
  HISTORY_KEY,
  CONVERSATIONS_SET_KEY,
  SEEN_NEWS_KEY,
};

