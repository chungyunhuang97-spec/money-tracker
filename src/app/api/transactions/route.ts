import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { TransactionInsert, CARDS, CATEGORIES } from '@/types'

// 驗證 Bearer Token
function verifyAuth(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  const token = auth.replace('Bearer ', '')
  return token === process.env.SHORTCUT_API_SECRET
}

// GET /api/transactions - 查詢交易
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const card_id = searchParams.get('card_id')

  const supabase = createServerClient()
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(50)

  if (start) query = query.gte('transaction_date', start)
  if (end) query = query.lte('transaction_date', end)
  if (card_id) query = query.eq('card_id', card_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

// POST /api/transactions - 新增交易（捷徑呼叫這個）
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: TransactionInsert

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // 驗證必填欄位
  const { card_id, amount, merchant, category, transaction_date } = body

  if (!card_id || !amount || !merchant || !category || !transaction_date) {
    return NextResponse.json(
      {
        error: 'Missing required fields',
        required: ['card_id', 'amount', 'merchant', 'category', 'transaction_date'],
      },
      { status: 400 }
    )
  }

  // 驗證 card_id
  const validCards = CARDS.map((c) => c.id)
  if (!validCards.includes(card_id)) {
    return NextResponse.json(
      { error: `Invalid card_id. Must be one of: ${validCards.join(', ')}` },
      { status: 400 }
    )
  }

  // 驗證 category
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` },
      { status: 400 }
    )
  }

  // 驗證 amount
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'amount must be a positive number' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      card_id,
      amount,
      merchant,
      category,
      note: body.note || null,
      transaction_date,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      success: true,
      message: `已記錄 ${merchant} $${amount}（${card_id}）`,
      data,
    },
    { status: 201 }
  )
}
