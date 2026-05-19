import { createClient } from '@supabase/supabase-js'

// ── Server-only client（API Route 用，永遠不會到前端）──────────
// 用 SERVICE_ROLE_KEY，可以繞過 RLS，但只在 server 執行
export function createServerClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient(url, key, {
    auth: { persistSession: false }
  })
}

// ── Rate limiter（簡易 in-memory，per IP）─────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, maxPerMinute = 60): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= maxPerMinute) return false
  entry.count++
  return true
}
