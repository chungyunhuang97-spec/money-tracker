import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyAuth } from '@/lib/utils'

export async function POST(request: NextRequest) {
  if (!verifyAuth(request.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { card_id, amount, merchant, category_name, transaction_date, is_proxy_payment, proxy_amount, proxy_note, notes } = body

  if (!card_id || !amount || !merchant || !transaction_date) {
    return NextResponse.json({ error: 'Missing required fields: card_id, amount, merchant, transaction_date' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 用 category_name 找 category_id
  let category_id = body.category_id
  if (!category_id && category_name) {
    const { data } = await supabase.from('budget_categories').select('id').eq('name', category_name).single()
    category_id = data?.id
  }
  if (!category_id) {
    const { data } = await supabase.from('budget_categories').select('id').eq('name', '其他').single()
    category_id = data?.id
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({ card_id, amount, merchant, category_id, is_proxy_payment: !!is_proxy_payment, proxy_amount: proxy_amount || null, proxy_note: proxy_note || null, transaction_date, notes: notes || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    message: `已記錄 ${merchant} $${amount}（${card_id}）`,
    data,
  }, { status: 201 })
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const card_id = searchParams.get('card_id')

  const supabase = createServerClient()
  let query = supabase.from('transactions').select('*, category:budget_categories(*)').order('transaction_date', { ascending: false }).limit(100)

  if (month) {
    const start = `${month}-01`
    const end = new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1) - 1).toISOString().split('T')[0]
    query = query.gte('transaction_date', start).lte('transaction_date', end)
  }
  if (card_id) query = query.eq('card_id', card_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
