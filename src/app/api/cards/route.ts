import { NextResponse } from 'next/server'
import { CARDS, CATEGORIES } from '@/types'

// GET /api/cards - 回傳可用的卡片清單與類別（捷徑 App 用來初始化選項）
export async function GET() {
  return NextResponse.json({
    cards: CARDS.map((c) => ({ id: c.id, name: c.name })),
    categories: CATEGORIES,
  })
}
