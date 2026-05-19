'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CARDS } from '@/types'
import { formatCurrency, getMonthRange } from '@/lib/utils'
import { useMonthlySpending, useTransactions } from '@/hooks/useTransactions'
import SpendingCard from '@/components/ui/SpendingCard'
import TransactionRow from '@/components/ui/TransactionRow'
import MonthFilter from '@/components/ui/MonthFilter'

export default function DashboardPage() {
  const [monthsAgo, setMonthsAgo] = useState(0)
  const { spending, total, loading: spendingLoading } = useMonthlySpending(monthsAgo)
  const { transactions, loading: txLoading } = useTransactions({ monthsAgo, limit: 5 })
  const { label } = getMonthRange(monthsAgo)

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <p className="text-xs text-[#0D0D0D]/35 tracking-[0.12em] uppercase mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-number text-5xl font-normal text-[#1A1F5E] leading-none">
            {spendingLoading ? '—' : formatCurrency(total)}
          </span>
          <span className="text-xs text-[#0D0D0D]/35">總支出</span>
        </div>
      </motion.div>

      {/* 月份 Filter */}
      <div className="mb-5">
        <MonthFilter selectedMonth={monthsAgo} onChange={setMonthsAgo} />
      </div>

      {/* 三張卡片 */}
      <div className="flex flex-col gap-3 mb-8">
        {CARDS.map((card, i) => (
          <SpendingCard
            key={card.id}
            card={card}
            spent={spending[card.id] || 0}
            index={i}
          />
        ))}
      </div>

      {/* 最近消費 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium tracking-[0.1em] text-[#0D0D0D]/40 uppercase">最近記錄</h2>
          <a href="/transactions" className="text-xs text-[#1A1F5E] font-medium">全部</a>
        </div>

        {txLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 rounded-xl bg-[#0D0D0D]/4 animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-sm text-[#0D0D0D]/25">
            本月尚無消費記錄
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
