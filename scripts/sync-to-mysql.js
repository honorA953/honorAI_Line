// 定期把Redis裡累積的摘要歷史記錄同步進NAS上的MySQL，成功寫入後才從Redis移除。
// 設計給在內網（例如Synology NAS）執行，因為NAS的MySQL通常不對外網開放。
require('dotenv').config();

const { Redis } = require('@upstash/redis');
const mysql = require('mysql2/promise');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const HISTORY_KEY = 'linechat:history';
const MAX_RECORDS_PER_RUN = 500;

function sourceTypeOf(conversationId) {
  return conversationId.split(':')[0];
}

async function ensureTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS conversation_summaries (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      conversation_id VARCHAR(255) NOT NULL,
      source_type VARCHAR(16) NOT NULL,
      message_count INT NOT NULL,
      summary TEXT NOT NULL,
      messages_json LONGTEXT NOT NULL,
      generated_at DATETIME NOT NULL,
      synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_conversation_generated (conversation_id, generated_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
  `);
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  await ensureTable(conn);

  let synced = 0;
  try {
    for (let i = 0; i < MAX_RECORDS_PER_RUN; i++) {
      const raw = await redis.lindex(HISTORY_KEY, 0);
      if (!raw) break;

      const record = typeof raw === 'string' ? JSON.parse(raw) : raw;

      await conn.query(
        `INSERT IGNORE INTO conversation_summaries
         (conversation_id, source_type, message_count, summary, messages_json, generated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          record.conversationId,
          sourceTypeOf(record.conversationId),
          record.messages.length,
          record.summary,
          JSON.stringify(record.messages),
          new Date(record.generatedAt),
        ]
      );

      // 確認寫入MySQL成功後，才把這筆從Redis的歷史清單移除
      await redis.lpop(HISTORY_KEY);
      synced++;
    }
  } finally {
    await conn.end();
  }

  console.log(`[sync] synced ${synced} record(s) to MySQL at ${new Date().toISOString()}`);
}

run().catch((err) => {
  console.error('[sync] failed:', err.message);
  process.exit(1);
});
