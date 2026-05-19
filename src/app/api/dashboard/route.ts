import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRequest } from '@/lib/api'

// 一次拿總覽需要的所有資料，減少前端 round-trip
export async function GET(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const month = new URL(req.url).searchParams.get('month')
  if (!month) return NextResponse.json({ error: 'Missing month' }, { status: 400 })

  const db = createServerClient()
  const start = `${month}-01`
  const d = new Date(`${month}-01`)
  d.setMonth(d.getMonth() + 1); d.setDate(0)
  const end = d.toISOString().split('T')[0]

  const [incomeRes, budgetRes, txRes, cardsRes] = await Promise.all([
    db.from('income_sources').select('amount').eq('month', month),
    db.from('budget_items').select('amount').eq('month', month),
    db.from('transactions').select('card_id, amount').gte('transaction_date', start).lte('transaction_date', end),
    db.from('card_settings').select('*').order('billing_day'),
  ])

  const totalIncome = (incomeRes.data || []).reduce((s, r) => s + r.amount, 0)
  const totalExpense = (budgetRes.data || []).reduce((s, r) => s + r.amount, 0)
  const cardSpending: Record<string, number> = {}
  ;(txRes.data || []).forEach((t) => {
    cardSpending[t.card_id] = (cardSpending[t.card_id] || 0) + t.amount
  })

  return NextResponse.json({
    totalIncome,
    totalExpense,
    remaining: totalIncome - totalExpense,
    cardSpending,
    cards: cardsRes.data || [],
  })
}
