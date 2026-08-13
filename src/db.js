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

const NOTES_PREFIX = 'linechat:notes:';

async function addNote(conversationId, note) {
  try {
    const noteRecord = {
      id: note.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: note.title || '一般記事',
      category: note.category || '📋 待辦',
      details: note.details || '',
      dueDate: note.dueDate || '',
      createdAt: note.createdAt || new Date().toISOString(),
    };
    await redis.rpush(NOTES_PREFIX + conversationId, JSON.stringify(noteRecord));
    return noteRecord;
  } catch (err) {
    console.error('[db] addNote error:', err.message);
    return null;
  }
}

async function getNotes(conversationId) {
  try {
    const raw = (await redis.lrange(NOTES_PREFIX + conversationId, 0, -1).catch(() => [])) || [];
    return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item)).filter(Boolean);
  } catch (err) {
    console.error('[db] getNotes error:', err.message);
    return [];
  }
}

async function removeNote(conversationId, noteIdOrIndex) {
  try {
    const notes = await getNotes(conversationId);
    let filtered;
    if (typeof noteIdOrIndex === 'number') {
      filtered = notes.filter((_, idx) => idx !== noteIdOrIndex);
    } else {
      filtered = notes.filter((n) => n.id !== noteIdOrIndex && !n.title.includes(noteIdOrIndex));
    }
    await redis.del(NOTES_PREFIX + conversationId);
    for (const n of filtered) {
      await redis.rpush(NOTES_PREFIX + conversationId, JSON.stringify(n));
    }
    return filtered;
  } catch (err) {
    console.error('[db] removeNote error:', err.message);
    return [];
  }
}

async function clearNotes(conversationId) {
  try {
    await redis.del(NOTES_PREFIX + conversationId);
  } catch (err) {
    console.error('[db] clearNotes error:', err.message);
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
  addNote,
  getNotes,
  removeNote,
  clearNotes,
  HISTORY_KEY,
  CONVERSATIONS_SET_KEY,
  SEEN_NEWS_KEY,
  NOTES_PREFIX,
};


