# LineChat Summarizer

LINE官方帳號(Messaging API) Bot：記錄收到的對話內容，每天定時用OpenAI整理摘要重點，並主動推播回原對話。

## 運作方式

1. `POST /webhook` 接收LINE傳來的訊息事件，把文字訊息存進 `data/messages.json`（依1對1/群組/聊天室分開存放）
2. `node-cron` 依 `.env` 設定的排程（預設每天21:00）跑一次 `runSummaryJob`
3. 針對每個有新訊息的對話，呼叫OpenAI整理成條列式摘要，用 `pushMessage` 推播回該對話，並清空已摘要的訊息

## 前置需求

- Node.js 18+
- 一個LINE官方帳號的 Messaging API Channel（見下方申請步驟）
- 一組OpenAI API key

## LINE Developers 申請步驟

1. 前往 [LINE Developers Console](https://developers.line.biz/console/) 登入
2. 建立 Provider → 在其下建立 Channel，類型選 **Messaging API**
3. 「Basic settings」分頁取得 **Channel secret**
4. 「Messaging API」分頁點 Issue 取得 **Channel access token**（長期）
5. 同一頁把 **Auto-reply messages**、**Greeting messages** 關閉
6. 用手機LINE掃該頁的QR code，把這個官方帳號加為好友

## 安裝與設定

```bash
npm install
copy .env.example .env
```

編輯 `.env`，填入：

- `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN`
- `OPENAI_API_KEY`
- 需要的話調整 `SUMMARY_CRON`（cron表達式）

## 本地測試（需要外網能連到你的webhook）

LINE平台要求webhook URL必須是HTTPS且能從外網存取，本機開發用 [ngrok](https://ngrok.com/) 開一個通道：

```bash
npm start
# 另開一個終端機
ngrok http 3000
```

把ngrok給的 `https://xxxx.ngrok-free.app/webhook` 貼回LINE Developers Console的「Messaging API」分頁 → Webhook URL，並打開 **Use webhook**。

用手機傳幾則訊息給這個官方帳號測試是否有正確寫入 `data/messages.json`。

## 手動觸發一次摘要（測試用）

不想等到排定時間，可直接呼叫：

```bash
curl -X POST http://localhost:3000/debug/run-summary
```

這個端點僅供本機測試，正式環境建議移除或加上驗證。

## 注意事項

- 群組/多人聊天室要能取得成員暱稱，需LINE官方帳號有權限讀取該成員資料（對方需為官方帳號好友或群組設定允許），否則會顯示「未知使用者」
- 訊息目前以本機JSON檔儲存，適合單機/小規模使用；若要多機部署或更大量資料，建議之後換成正式資料庫
- `MAX_MESSAGES_PER_SUMMARY` 用來避免單次摘要塞入過多訊息，超過時會自動分段摘要後再合併
