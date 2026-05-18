import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

function verifyAuth(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  const token = auth.replace('Bearer ', '')
  return token === process.env.SHORTCUT_API_SECRET
}

// GET /api/summary?months_ago=0
// 回傳本月（或指定月份）各卡總支出
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const monthsAgo = parseInt(searchParams.get('months_ago') || '0', 10)

  const target = subMonths(new Date(), monthsAgo)
  const start = format(startOfMonth(target), 'yyyy-MM-dd')
  const end = format(endOfMonth(target), 'yyyy-MM-dd')
  const monthLabel = format(target, 'yyyy年M月')

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('card_id, amount, category')
    .gte('transaction_date', start)
    .lte('transaction_date', end)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 各卡總計
  const cardTotals: Record<string, number> = { yushan: 0, fubon: 0, dbs: 0 }
  const categoryTotals: Record<string, number> = {}
  let grandTotal = 0

  data?.forEach((tx) => {
    cardTotals[tx.card_id] = (cardTotals[tx.card_id] || 0) + tx.amount
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
    grandTotal += tx.amount
  })

  return NextResponse.json({
    month: monthLabel,
    total: grandTotal,
    by_card: cardTotals,
    by_category: categoryTotals,
    transaction_count: data?.length || 0,
  })
}
