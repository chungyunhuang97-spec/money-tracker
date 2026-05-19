// ─── 基本型別 ───────────────────────────────────────────────

export type CardId = 'yushan' | 'fubon' | 'dbs'

export interface CardSetting {
  id: CardId
  name: string
  color: string
  text_color: string
  credit_limit: number
  billing_day: number
}

export interface BankAccount {
  id: string
  name: string          // 新光、大戶、中信-2、iLeo 等
  created_at: string
}

export interface BudgetCategory {
  id: string
  name: string          // 卡費、預留、投資、預存 等
  color: string         // 顯示用顏色
  created_at: string
}

// ─── 收入來源 ────────────────────────────────────────────────

export interface IncomeSource {
  id: string
  month: string         // YYYY-MM
  source_type: string   // 薪資 / 預留款 / 接案 / 其他
  amount: number
  from_month: string | null   // 預留款來自哪個月，例如 2026-04
  notes: string | null
  created_at: string
}

export interface IncomeSourceInsert {
  month: string
  source_type: string
  amount: number
  from_month?: string
  notes?: string
}

// ─── 支出細項（月度配置清單）────────────────────────────────

export interface BudgetItem {
  id: string
  month: string         // YYYY-MM
  item_name: string     // 玉山卡費、家用品、房租 等
  category_id: string
  category?: BudgetCategory
  amount: number
  pending_amount: number | null   // 待付金額（代付加總，自動計算）
  bank_account_id: string | null
  bank_account?: BankAccount
  card_id: CardId | null          // 如果是卡費，對應哪張卡
  transferred: boolean            // 已轉帳
  spent: boolean                  // 已支出
  notes: string | null
  created_at: string
}

export interface BudgetItemInsert {
  month: string
  item_name: string
  category_id: string
  amount: number
  pending_amount?: number
  bank_account_id?: string
  card_id?: CardId
  transferred?: boolean
  spent?: boolean
  notes?: string
}

// ─── 刷卡記錄 ────────────────────────────────────────────────

export interface Transaction {
  id: string
  card_id: CardId
  amount: number
  merchant: string
  category_id: string
  category?: BudgetCategory
  is_proxy_payment: boolean       // 是否代付
  proxy_amount: number | null     // 代付金額
  proxy_note: string | null       // 代付備註（代付給誰）
  transaction_date: string
  notes: string | null
  created_at: string
}

export interface TransactionInsert {
  card_id: CardId
  amount: number
  merchant: string
  category_id: string
  is_proxy_payment?: boolean
  proxy_amount?: number
  proxy_note?: string
  transaction_date: string
  notes?: string
}

// ─── 儲蓄目標 ────────────────────────────────────────────────

export interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  created_at: string
  deposits?: SavingsDeposit[]
}

export interface SavingsDeposit {
  id: string
  goal_id: string
  month: string         // YYYY-MM
  amount: number
  color: string | null  // 進度條顏色
  created_at: string
}

export interface SavingsDepositInsert {
  goal_id: string
  month: string
  amount: number
  color?: string
}

// ─── 預設資料 ────────────────────────────────────────────────

export const DEFAULT_CARDS: CardSetting[] = [
  { id: 'yushan', name: '玉山卡', color: '#FFE000', text_color: '#0D0D0D', credit_limit: 80000, billing_day: 7 },
  { id: 'fubon',  name: '富邦卡', color: '#FF4D1A', text_color: '#FFFFFF', credit_limit: 100000, billing_day: 8 },
  { id: 'dbs',    name: '星展卡', color: '#00E0C8', text_color: '#0D0D0D', credit_limit: 60000, billing_day: 8 },
]

export const DEPOSIT_COLORS = [
  '#1A1F5E', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#6B7280',
]
