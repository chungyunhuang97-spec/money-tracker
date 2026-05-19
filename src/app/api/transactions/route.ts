import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRequest } from '@/lib/api'

export async function GET(req: NextRequest) {
  const err = validateRequest(req)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const card_id = searchParams.get('card_id')

  const db = createServerClient()
  let query = db
    .from('transactions')
    .select('*, category:budget_categories(*)')
    .order('transaction_date', { ascending: false })
    .limit(200)

  if (month) {
    const start = `${month}-01`
    const d = new Date(`${month}-01`)
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    query = query
      .gte('transaction_date', start)
      .lte('transaction_date', d.toISOString().split('T')[0])
  }
  if (card_id) query = query.eq('card_id', card_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const err = validateRequest(req)
  if (err) return err

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { card_id, amount, merchant, category_id, category_name,
          is_proxy_payment, proxy_amount, proxy_note,
          transaction_date, notes } = body

  if (!card_id || !amount || !merchant || !transaction_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = createServerClient()

  let cat_id = category_id
  if (!cat_id && category_name) {
    const { data } = await db.from('budget_categories').select('id').eq('name', category_name).single()
    cat_id = data?.id
  }
  if (!cat_id) {
    const { data } = await db.from('budget_categories').select('id').eq('name', '其他').single()
    cat_id = data?.id
  }

  const { data, error } = await db
    .from('transactions')
    .insert({
      card_id, amount, merchant,
      category_id: cat_id,
      is_proxy_payment: !!is_proxy_payment,
      proxy_amount: proxy_amount || null,
      proxy_note: proxy_note || null,
      transaction_date,
      notes: notes || null,
    })
    .select('*, category:budget_categories(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: `已記錄 ${merchant} $${amount}`, data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const err = validateRequest(req)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db
    .from('transactions')
    .update(body)
    .eq('id', id)
    .select('*, category:budget_categories(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const err = validateRequest(req)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = createServerClient()
  const { error } = await db.from('transactions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
