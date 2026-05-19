import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRequest } from '@/lib/api'

export async function POST(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db
    .from('savings_deposits')
    .upsert(body, { onConflict: 'goal_id,month' })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const err = validateRequest(req); if (err) return err
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const db = createServerClient()
  const { error } = await db.from('savings_deposits').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
