export const dynamic = 'force-dynamic'
'use client'

import { motion } from 'framer-motion'
import { CARDS } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  return (
    <div className="px-4 pt-12 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-light text-[#1A1F5E] mb-8"
      >
        設定
      </motion.h1>

      {/* 信用卡資訊 */}
      <section className="mb-8">
        <h2 className="text-xs font-medium tracking-[0.1em] text-[#0D0D0D]/40 uppercase mb-3">
          信用卡額度
        </h2>
        <div className="space-y-2">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 shadow-sm shadow-[#0D0D0D]/4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: card.color }}
                />
                <div>
                  <p className="text-sm font-medium text-[#0D0D0D]">{card.name}</p>
                  <p className="text-[11px] text-[#0D0D0D]/35">每月 {card.billing_day} 日出帳</p>
                </div>
              </div>
              <span className="font-number text-sm text-[#0D0D0D]/60">
                {formatCurrency(card.limit)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 捷徑說明 */}
      <section className="mb-8">
        <h2 className="text-xs font-medium tracking-[0.1em] text-[#0D0D0D]/40 uppercase mb-3">
          iOS 捷徑串接
        </h2>
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm shadow-[#0D0D0D]/4 space-y-3">
          <p className="text-sm text-[#0D0D0D]/70 leading-relaxed">
            使用 iOS 捷徑 App，可透過語音或主動捷徑快速新增消費記錄，
            無需開啟 App 手動輸入。
          </p>
          <div className="bg-[#F8F8F5] rounded-xl p-3">
            <p className="text-xs font-mono text-[#1A1F5E] break-all">
              POST {typeof window !== 'undefined' ? window.location.origin : ''}/api/transactions
            </p>
          </div>
          <p className="text-xs text-[#0D0D0D]/35">
            詳細設定請參閱捷徑設定說明文件
          </p>
        </div>
      </section>

      {/* App 版本 */}
      <div className="text-center py-4">
        <p className="text-xs text-[#0D0D0D]/20">信用卡記帳 v1.0</p>
      </div>
    </div>
  )
}
