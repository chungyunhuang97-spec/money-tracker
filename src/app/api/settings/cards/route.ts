import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRequest } from '@/lib/api'

export async function GET(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const db = createServerClient()
  const { data, error } = await db.from('card_settings').select('*').order('billing_day')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = await req.json()
  // 只允許更新 credit_limit 和 billing_day
  const { credit_limit, billing_day } = body
  const db = createServerClient()
  const { data, error } = await db
    .from('card_settings')
    .update({ credit_limit, billing_day })
    .eq('id', id)
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
