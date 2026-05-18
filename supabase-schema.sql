-- ============================================================
-- 信用卡記帳 App — Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 貼上並執行
-- ============================================================

-- 1. 建立 transactions 資料表
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id           TEXT          NOT NULL CHECK (card_id IN ('yushan', 'fubon', 'dbs')),
  amount            NUMERIC(10,0) NOT NULL CHECK (amount > 0),
  merchant          TEXT          NOT NULL,
  category          TEXT          NOT NULL CHECK (category IN (
    '餐飲', '交通', '購物', '娛樂', '醫療', '超市', '訂閱', '旅遊', '其他'
  )),
  note              TEXT,
  transaction_date  DATE          NOT NULL,
  created_at        TIMESTAMPTZ   DEFAULT now() NOT NULL
);

-- 2. 建立索引（加速日期查詢）
CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON transactions (transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_card_date
  ON transactions (card_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category
  ON transactions (category);

-- 3. Row Level Security（RLS）
-- 因為用 API Secret 做驗證，不用 Supabase Auth
-- 只需確保 anon key 可以 INSERT / SELECT
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 允許匿名讀寫（API 自行做 Bearer Token 驗證）
CREATE POLICY "allow_all_with_anon"
  ON transactions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 4. 建立月份統計 View（選用，加速 Summary API）
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  card_id,
  TO_CHAR(transaction_date, 'YYYY-MM') AS month,
  SUM(amount)                           AS total,
  COUNT(*)                              AS transaction_count
FROM transactions
GROUP BY card_id, TO_CHAR(transaction_date, 'YYYY-MM')
ORDER BY month DESC, card_id;

-- ============================================================
-- 測試資料（可選，確認 App 有資料可顯示）
-- 執行完確認沒問題後可以 DELETE FROM transactions;
-- ============================================================

INSERT INTO transactions (card_id, amount, merchant, category, transaction_date, note) VALUES
  ('yushan', 320,  '麥當勞',     '餐飲', CURRENT_DATE,       NULL),
  ('fubon',  1200, 'Uniqlo',    '購物', CURRENT_DATE - 1,   NULL),
  ('dbs',    85,   'YouBike',   '交通', CURRENT_DATE - 2,   NULL),
  ('yushan', 450,  '全聯',      '超市', CURRENT_DATE - 3,   NULL),
  ('fubon',  699,  'Netflix',   '訂閱', CURRENT_DATE - 5,   '月費'),
  ('dbs',    2800, '誠品書店',  '購物', CURRENT_DATE - 7,   NULL),
  ('yushan', 180,  '路易莎',    '餐飲', CURRENT_DATE - 8,   NULL),
  ('fubon',  550,  'FamilyMart','餐飲', CURRENT_DATE - 10,  NULL);
