import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRequest } from '@/lib/api'

const SELECT = '*, category:budget_categories(*), bank_account:bank_accounts(*)'

export async function GET(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const month = new URL(req.url).searchParams.get('month')
  if (!month) return NextResponse.json({ error: 'Missing month' }, { status: 400 })
  const db = createServerClient()
  const { data, error } = await db.from('budget_items').select(SELECT).eq('month', month).order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db.from('budget_items').insert(body).select(SELECT).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db.from('budget_items').update(body).eq('id', id).select(SELECT).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const db = createServerClient()
  const { error } = await db.from('budget_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
