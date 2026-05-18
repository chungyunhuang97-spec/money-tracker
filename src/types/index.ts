export type CardId = 'yushan' | 'fubon' | 'dbs'

export interface Card {
  id: CardId
  name: string
  color: string
  textColor: string
  limit: number
  billing_day: number // 每月幾號出帳
}

export interface Transaction {
  id: string
  card_id: CardId
  amount: number
  merchant: string
  category: string
  note: string | null
  transaction_date: string // ISO date string
  created_at: string
}

export interface TransactionInsert {
  card_id: CardId
  amount: number
  merchant: string
  category: string
  note?: string
  transaction_date: string
}

export interface MonthlySummary {
  card_id: CardId
  month: string // YYYY-MM
  total: number
  transaction_count: number
}

export interface CategorySummary {
  category: string
  total: number
  count: number
}

export const CARDS: Card[] = [
  {
    id: 'yushan',
    name: '玉山卡',
    color: '#FFE000',
    textColor: '#0D0D0D',
    limit: 80000,
    billing_day: 15,
  },
  {
    id: 'fubon',
    name: '富邦卡',
    color: '#FF4D1A',
    textColor: '#FFFFFF',
    limit: 100000,
    billing_day: 20,
  },
  {
    id: 'dbs',
    name: '星展卡',
    color: '#00E0C8',
    textColor: '#0D0D0D',
    limit: 60000,
    billing_day: 10,
  },
]

export const CATEGORIES = [
  '餐飲',
  '交通',
  '購物',
  '娛樂',
  '醫療',
  '超市',
  '訂閱',
  '旅遊',
  '其他',
]
