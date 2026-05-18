# 信用卡記帳 App — 完整部署說明

## 專案結構速覽

```
credit-tracker/
├── src/
│   ├── app/
│   │   ├── (main)/              ← 帶 TabBar 的主頁面群
│   │   │   ├── page.tsx         ← 總覽
│   │   │   ├── transactions/    ← 刷卡記錄
│   │   │   ├── categories/      ← 支出細項
│   │   │   └── settings/        ← 設定
│   │   └── api/
│   │       ├── transactions/    ← 捷徑用 POST API
│   │       ├── summary/         ← 月份總結
│   │       └── cards/           ← 卡片清單
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── supabase-schema.sql
└── .env.local.example
```

---

## STEP 1：建立 Supabase 專案

1. 前往 https://supabase.com，登入 / 建立帳號
2. 點「New project」
   - 名稱：`credit-tracker`
   - 密碼：設一個強密碼（記住，之後不用）
   - Region：`Northeast Asia (Tokyo)` 選這個最近
3. 等待約 1 分鐘初始化完成

### 執行 Schema SQL

1. 左側選單點「SQL Editor」
2. 點「New query」
3. 把 `supabase-schema.sql` 的全部內容貼進去
4. 點「Run」
5. 看到 `Success` 即完成

### 取得 API 金鑰

1. 左側選單點「Project Settings > API」
2. 複製這兩個值，等下要用：
   - **Project URL**：`https://xxxx.supabase.co`
   - **anon public key**：`eyJhbGc...`（很長的那個）

---

## STEP 2：部署到 Vercel

### 先 push 到 GitHub

```bash
# 在 credit-tracker 資料夾執行
git init
git add .
git commit -m "init: credit tracker app"
git branch -M main
git remote add origin https://github.com/你的帳號/credit-tracker.git
git push -u origin main
```

### 在 Vercel 部署

1. 前往 https://vercel.com，用 GitHub 登入
2. 點「Add New > Project」
3. 選剛才的 `credit-tracker` repo，點「Import」
4. Framework Preset 選 **Next.js**（應該自動偵測）
5. 點「Environment Variables」，加入以下三個：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |
| `SHORTCUT_API_SECRET` | 自訂一個亂數字串，例如 `ct_2024_my_secret_abc123` |

6. 點「Deploy」
7. 等約 2 分鐘，完成後取得你的網址，例如：`https://credit-tracker-xxx.vercel.app`

---

## STEP 3：設定 iOS 捷徑

### 捷徑說明

目的：不用開 App，用語音或一鍵快速新增消費記錄。

### 建立步驟

打開 iPhone 的「捷徑（Shortcuts）」App：

#### 捷徑 1：快速記帳

1. 點右上角 **+** 建立新捷徑
2. 捷徑名稱改為「記帳」
3. 依序加入以下動作：

---

**動作 1：選擇信用卡**

搜尋並加入「從清單中選擇」

```
請選擇信用卡
清單：
  玉山卡
  富邦卡
  星展卡
```

設定變數名稱：`選擇的卡`

---

**動作 2：將卡名轉為 card_id**

加入「如果」動作：
- 如果「選擇的卡」包含「玉山」→ 設定變數 `card_id` = `yushan`
- 否則如果包含「富邦」→ `card_id` = `fubon`
- 否則 → `card_id` = `dbs`

---

**動作 3：輸入金額**

加入「詢問輸入」
```
提示：消費金額（數字）
輸入類型：數字
```
設定變數名稱：`amount`

---

**動作 4：輸入店家名稱**

加入「詢問輸入」
```
提示：店家名稱
輸入類型：文字
```
設定變數名稱：`merchant`

---

**動作 5：選擇類別**

加入「從清單中選擇」
```
清單：
  餐飲
  交通
  購物
  娛樂
  醫療
  超市
  訂閱
  旅遊
  其他
```
設定變數名稱：`category`

---

**動作 6：取得今天日期**

加入「格式化日期」
- 日期：「目前日期」
- 格式：自訂 → `yyyy-MM-dd`

設定變數名稱：`today`

---

**動作 7：建立 JSON 內容**

加入「文字」動作，內容填：

```json
{"card_id":"[card_id 變數]","amount":[amount 變數],"merchant":"[merchant 變數]","category":"[category 變數]","transaction_date":"[today 變數]"}
```

（把 `[xxx 變數]` 替換成對應的捷徑變數）

設定變數名稱：`request_body`

---

**動作 8：發送 API 請求**

加入「取得 URL 的內容」：

```
URL：https://你的vercel網址.vercel.app/api/transactions
方法：POST
標頭：
  Content-Type: application/json
  Authorization: Bearer 你的SHORTCUT_API_SECRET
請求內文：request_body（JSON 格式）
```

---

**動作 9：顯示結果**

加入「顯示通知」或「顯示結果」：
- 顯示「URL 內容」的 `message` 欄位

---

### 使用方式

完成後，可以：
- **Siri 語音**：「嘿 Siri，記帳」
- **主畫面小工具**：把捷徑加到主畫面
- **Back Tap**：設定 iPhone 三下背面 = 執行記帳捷徑

---

## API 文件

### POST /api/transactions

新增一筆消費記錄

**Headers:**
```
Authorization: Bearer {SHORTCUT_API_SECRET}
Content-Type: application/json
```

**Body:**
```json
{
  "card_id": "yushan",
  "amount": 320,
  "merchant": "麥當勞",
  "category": "餐飲",
  "transaction_date": "2024-06-01",
  "note": "可選備註"
}
```

**card_id 可用值：** `yushan` / `fubon` / `dbs`

**category 可用值：** 餐飲 / 交通 / 購物 / 娛樂 / 醫療 / 超市 / 訂閱 / 旅遊 / 其他

**Response 201:**
```json
{
  "success": true,
  "message": "已記錄 麥當勞 $320（yushan）",
  "data": { ...transaction }
}
```

---

### GET /api/summary

查詢月份統計

```
GET /api/summary?months_ago=0
Authorization: Bearer {SHORTCUT_API_SECRET}
```

**Response:**
```json
{
  "month": "2024年6月",
  "total": 8540,
  "by_card": { "yushan": 3200, "fubon": 4200, "dbs": 1140 },
  "by_category": { "餐飲": 2100, "購物": 4200, ... },
  "transaction_count": 18
}
```

---

## 本機開發

```bash
# 安裝套件
npm install

# 複製 .env
cp .env.local.example .env.local
# 填入你的 Supabase URL / anon key / API secret

# 啟動開發伺服器
npm run dev
# 開啟 http://localhost:3000
```

---

## 常見問題

**Q: 部署後白畫面？**
A: 檢查 Vercel 的 Environment Variables 是否三個都填了。

**Q: 捷徑 API 回傳 401？**
A: 確認 `Authorization` header 格式是 `Bearer 你的密鑰`，密鑰要和 Vercel 環境變數一致。

**Q: Supabase RLS 錯誤？**
A: 確認有執行 `supabase-schema.sql` 裡的 RLS Policy 部分。

**Q: 手機上字體不對？**
A: 需要連網載入 Google Fonts（Danfo / Noto Sans TC），確認手機有網路。
