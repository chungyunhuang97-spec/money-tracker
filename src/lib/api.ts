import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './supabase'

// ── Auth + Rate limit 驗證（所有 API route 都用這個）─────────
export function validateRequest(req: NextRequest): NextResponse | null {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  if (!checkRateLimit(ip, 60)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Bearer token 驗證（iOS 捷徑用）
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (auth.replace('Bearer ', '') !== process.env.SHORTCUT_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null // 通過
}

// ── 前端 fetch helper（給 hooks 用）──────────────────────────
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}
