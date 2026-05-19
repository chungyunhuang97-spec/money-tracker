-- ============================================================
-- Money Tracker — 完整 Schema（清空重建版）
-- 在 Supabase SQL Editor 執行
-- ============================================================

-- ── 0. 清除舊資料（如果有） ──────────────────────────────────
DROP TABLE IF EXISTS savings_deposits CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS income_sources CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS card_settings CASCADE;

-- ── 1. 信用卡設定 ────────────────────────────────────────────
CREATE TABLE card_settings (
  id            TEXT PRIMARY KEY CHECK (id IN ('yushan','fubon','dbs')),
  name          TEXT          NOT NULL,
  color         TEXT          NOT NULL,
  text_color    TEXT          NOT NULL,
  credit_limit  NUMERIC(10,0) NOT NULL,
  billing_day   INTEGER       NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
  created_at    TIMESTAMPTZ   DEFAULT now()
);

INSERT INTO card_settings VALUES
  ('yushan', '玉山卡', '#FFE000', '#0D0D0D', 80000,  7,  now()),
  ('fubon',  '富邦卡', '#FF4D1A', '#FFFFFF', 100000, 8,  now()),
  ('dbs',    '星展卡', '#00E0C8', '#0D0D0D', 60000,  8,  now());

-- ── 2. 銀行帳戶（可自訂） ────────────────────────────────────
CREATE TABLE bank_accounts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO bank_accounts (name) VALUES
  ('新光'), ('大戶'), ('中信-2'), ('一銀 iLeo');

-- ── 3. 支出類別（可自訂） ────────────────────────────────────
CREATE TABLE budget_categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL UNIQUE,
  color      TEXT        NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO budget_categories (name, color) VALUES
  ('卡費',   '#FF4D1A'),
  ('預留',   '#3B82F6'),
  ('投資',   '#10B981'),
  ('預存',   '#8B5CF6'),
  ('支出',   '#F59E0B'),
  ('其他',   '#6B7280');

-- ── 4. 月度收入來源 ──────────────────────────────────────────
CREATE TABLE income_sources (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  month       TEXT          NOT NULL,   -- YYYY-MM
  source_type TEXT          NOT NULL,   -- 薪資/預留款/接案/其他
  amount      NUMERIC(10,0) NOT NULL CHECK (amount > 0),
  from_month  TEXT,                     -- 預留款來源月份 YYYY-MM
  notes       TEXT,
  created_at  TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_income_month ON income_sources (month DESC);

-- ── 5. 月度支出細項 ──────────────────────────────────────────
CREATE TABLE budget_items (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  month           TEXT          NOT NULL,
  item_name       TEXT          NOT NULL,
  category_id     UUID          NOT NULL REFERENCES budget_categories(id),
  amount          NUMERIC(10,0) NOT NULL CHECK (amount > 0),
  pending_amount  NUMERIC(10,0) DEFAULT 0, -- 代付加總，自動同步
  bank_account_id UUID          REFERENCES bank_accounts(id),
  card_id         TEXT          CHECK (card_id IN ('yushan','fubon','dbs')),
  transferred     BOOLEAN       DEFAULT false,
  spent           BOOLEAN       DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_budget_month ON budget_items (month DESC);
CREATE INDEX idx_budget_card  ON budget_items (card_id, month DESC);

-- ── 6. 刷卡記錄 ──────────────────────────────────────────────
CREATE TABLE transactions (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id           TEXT          NOT NULL CHECK (card_id IN ('yushan','fubon','dbs')),
  amount            NUMERIC(10,0) NOT NULL CHECK (amount > 0),
  merchant          TEXT          NOT NULL,
  category_id       UUID          NOT NULL REFERENCES budget_categories(id),
  is_proxy_payment  BOOLEAN       DEFAULT false,
  proxy_amount      NUMERIC(10,0),             -- 代付金額
  proxy_note        TEXT,                       -- 代付給誰
  transaction_date  DATE          NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_tx_date    ON transactions (transaction_date DESC);
CREATE INDEX idx_tx_card    ON transactions (card_id, transaction_date DESC);

-- ── 7. 儲蓄目標 ──────────────────────────────────────────────
CREATE TABLE savings_goals (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT          NOT NULL,
  target_amount NUMERIC(10,0) NOT NULL CHECK (target_amount > 0),
  created_at    TIMESTAMPTZ   DEFAULT now()
);

CREATE TABLE savings_deposits (
  id         UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id    UUID          NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  month      TEXT          NOT NULL,   -- YYYY-MM
  amount     NUMERIC(10,0) NOT NULL CHECK (amount > 0),
  color      TEXT          DEFAULT '#1A1F5E',
  created_at TIMESTAMPTZ   DEFAULT now(),
  UNIQUE (goal_id, month)
);

-- ── 8. RLS（全部允許 anon，由 API 做 token 驗證） ────────────
ALTER TABLE card_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_deposits  ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'card_settings','bank_accounts','budget_categories',
    'income_sources','budget_items','transactions',
    'savings_goals','savings_deposits'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY allow_anon ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', t
    );
  END LOOP;
END $$;

-- ── 9. 同步代付金額到 budget_items 的 Function ───────────────
-- 每次新增/更新刷卡記錄時自動更新對應卡費的 pending_amount
CREATE OR REPLACE FUNCTION sync_proxy_to_budget()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_month TEXT;
  v_total NUMERIC;
BEGIN
  -- 取得交易的月份（YYYY-MM）
  v_month := TO_CHAR(
    COALESCE(NEW.transaction_date, OLD.transaction_date),
    'YYYY-MM'
  );

  -- 計算該卡該月所有代付的總額
  SELECT COALESCE(SUM(proxy_amount), 0)
  INTO v_total
  FROM transactions
  WHERE card_id = COALESCE(NEW.card_id, OLD.card_id)
    AND TO_CHAR(transaction_date, 'YYYY-MM') = v_month
    AND is_proxy_payment = true;

  -- 更新對應的 budget_item（卡費那一行）
  UPDATE budget_items
  SET pending_amount = v_total
  WHERE card_id = COALESCE(NEW.card_id, OLD.card_id)
    AND month = v_month;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_proxy
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION sync_proxy_to_budget();
