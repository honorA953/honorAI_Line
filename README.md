# LineChat Summarizer

LINE官方帳號(Messaging API) Bot：記錄收到的對話內容，用OpenAI整理成重點摘要，並推播回原對話。支援「每天定時摘要」和「傳關鍵字立即摘要」兩種觸發方式。

## 運作方式

1. `POST /webhook` 接收LINE傳來的訊息事件（支援純文字、含YouTube/網頁連結、圖片、語音訊息）：
   - **YouTube 連結**：自動抓取字幕逐字稿與影片資訊，提煉 2~3 點精華重點
   - **網頁/文章連結**：自動爬梳 OpenGraph 與內文，產出網頁核心摘要
   - **圖片訊息**：透過 OpenAI Vision (GPT-4o-mini) 辨識畫面主體、圖表數據與 OCR 文字
   - **語音訊息**：透過 OpenAI Whisper 語音轉文字
   - 所有訊息與摘要自動存入 Upstash Redis（依 1對1 / 群組 / 聊天室分開存放）
2. 使用者傳送關鍵字（預設「摘要」）時，立即整理目前累積的對話並回覆
3. 每天固定時間（預設21:00），由GitHub Actions排程呼叫 `POST /tasks/summary` 觸發整理，針對每個有新訊息的對話呼叫OpenAI摘要，用 `pushMessage` 推播回去，並清空已摘要的訊息

線上部署在Render（免費方案），因為免費instance閒置會睡著、且沒有persistent disk，所以：
- 訊息儲存改用 Upstash Redis（獨立於instance之外，重啟不會遺失）
- 排程改用GitHub Actions主動呼叫（而非依賴伺服器內部長駐的cron，確保instance睡著時仍會被準時叫醒）

## 前置需求

- Node.js 18+
- 一個LINE官方帳號的 Messaging API Channel
- 一組OpenAI API key
- 一個Upstash Redis免費資料庫（[console.upstash.com](https://console.upstash.com)）

## LINE Developers 申請步驟

1. 前往 [LINE Developers Console](https://developers.line.biz/console/) 登入
2. 建立 Provider → 在其下建立 Channel，類型選 **Messaging API**
3. 「Basic settings」分頁取得 **Channel secret**
4. 「Messaging API」分頁點 Issue 取得 **Channel access token**（長期）
5. 到 [LINE Official Account Manager](https://manager.line.biz) → 設定 → 回應設定，把 **聊天**、**加入好友的歡迎訊息**、**自動回應訊息** 都關閉，**Webhook** 開啟
6. 用手機LINE掃QR code，把這個官方帳號加為好友

## 本機安裝與設定

```bash
npm install
copy .env.example .env
```

編輯 `.env`，填入LINE、OpenAI、Upstash Redis的金鑰（見 `.env.example` 註解說明）。

## 本機測試（需要外網能連到你的webhook）

```bash
npm start
# 另開一個終端機
ngrok http 3000
```

把ngrok給的 `https://xxxx.ngrok-free.app/webhook` 貼回LINE Developers Console的Webhook URL，並打開 **Use webhook**。

本機測試 `/tasks/summary` 端點（`SUMMARY_TRIGGER_SECRET` 留空時不需要帶密鑰）：

```bash
curl -X POST http://localhost:3000/tasks/summary
```

## 推播訂閱與個人化開關控制

所有群組或個人使用者皆可自主控制定時推播，無需所有人被動接收：
- 傳送 **「推播設定」** 或點擊快捷列上的 **「⚙️ 推播設定」**，即可查看與操作目前的推播狀態卡片。
- **晨間新聞 (08:00)**：傳送 **「開啟新聞」** 或 **「關閉新聞」**。
- **晚間總結 (21:00)**：傳送 **「開啟摘要」** 或 **「關閉摘要」**。
- 在群組中設定將套用於該群組；在私聊中設定僅套用於個人。

## 正式部署與定時精準觸發（Render + cron-job.org / GitHub Actions）

1. 把程式碼push到GitHub repo
2. 在 [Render](https://render.com) 建立 **Web Service**，連接該repo：
   - Build Command：`npm install`
   - Start Command：`npm start`
   - Instance Type：Free
   - Environment Variables：把 `.env` 裡的所有變數都加進去，`SUMMARY_TRIGGER_SECRET` 務必設定（保護觸發端點不被任意呼叫）
3. 部署完成後拿到固定網址，回LINE Developers Console把Webhook URL改成 `https://你的服務.onrender.com/webhook`
4. **精準秒級定時推播（推薦 cron-job.org，100% 免費且零延遲）**：
   - 免費註冊 [cron-job.org](https://cron-job.org)
   - 建立 2 個排程（時區選 Asia/Taipei）：
     1. **每日 08:00 晨間新聞**：
        - URL: `https://你的服務.onrender.com/tasks/news`
        - Method: `POST`
        - Header: `x-trigger-secret: 你的密鑰`
     2. **每日 21:00 晚間總結**：
        - URL: `https://你的服務.onrender.com/tasks/summary`
        - Method: `POST`
        - Header: `x-trigger-secret: 你的密鑰`
   - *優勢：直接發起 HTTP 請求，精準在設定秒數叫醒睡眠中的 Render instance 並即時推播，徹底解決 GitHub Actions 排隊延遲 2~3 小時的問題。*
5. 若使用 GitHub Actions：在 GitHub repo 的 **Settings → Secrets and variables → Actions** 新增 secret `SUMMARY_TRIGGER_SECRET`，workflow 也會作為備援定時觸發。

## 環境變數說明

見 `.env.example`，重點有：

- `DEFAULT_NEWS_ENABLED`：新對話預設是否推播晨間新聞（預設 `false`，由使用者自行開啟）
- `DEFAULT_SUMMARY_ENABLED`：新對話預設是否推播晚間總結（預設 `true`）
- `SUMMARY_CRON`：伺服器內建node-cron的排程表達式（預設 `0 21 * * *`）
- `CONSTRUCTION_NEWS_CRON`：伺服器內建新聞推播 cron（預設 `0 8 * * *`）
- `MAX_MESSAGES_PER_SUMMARY`：單次摘要最多帶入的訊息則數，超過會自動分段摘要後再合併
- `SUMMARY_KEYWORD`：使用者傳送這個關鍵字（預設「摘要」）會立即回覆目前累積的摘要
- `SUMMARY_TRIGGER_SECRET`：保護 `/tasks/news` 與 `/tasks/summary` 端點的密鑰，正式環境務必設定

## 注意事項

- 群組/多人聊天室要能取得成員暱稱，需LINE官方帳號有權限讀取該成員資料（對方需為官方帳號好友或群組設定允許），否則會顯示「未知使用者」
- Render免費方案會有冷啟動延遲（instance睡著時第一個請求會慢幾秒到十幾秒）

