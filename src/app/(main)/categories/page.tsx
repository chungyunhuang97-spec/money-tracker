'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCategoryBreakdown, useMonthlySpending } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/utils'
import MonthFilter from '@/components/ui/MonthFilter'

export default function CategoriesPage() {
  const [monthsAgo, setMonthsAgo] = useState(0)
  const { breakdown, loading } = useCategoryBreakdown(monthsAgo)
  const { total } = useMonthlySpending(monthsAgo)

  return (
    <div className="px-4 pt-12 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-light text-[#1A1F5E] mb-6"
      >
        支出細項
      </motion.h1>

      {/* 月份 Filter */}
      <div className="mb-6">
        <MonthFilter selectedMonth={monthsAgo} onChange={setMonthsAgo} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-14 rounded-2xl bg-[#0D0D0D]/4 animate-pulse" />
          ))}
        </div>
      ) : breakdown.length === 0 ? (
        <div className="text-center py-16 text-sm text-[#0D0D0D]/25">
          本月尚無消費記錄
        </div>
      ) : (
        <div className="space-y-2">
          {breakdown.map((item, i) => {
            const pct = total > 0 ? (item.total / total) * 100 : 0
            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="bg-white rounded-2xl px-4 py-3.5 shadow-sm shadow-[#0D0D0D]/4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-[#0D0D0D]">{item.category}</span>
                    <span className="text-xs text-[#0D0D0D]/30 ml-2">{item.count} 筆</span>
                  </div>
                  <span className="font-number text-base text-[#1A1F5E]">
                    {formatCurrency(item.total)}
                  </span>
                </div>
                {/* 進度條 */}
                <div className="h-1 bg-[#0D0D0D]/6 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#1A1F5E] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#0D0D0D]/25">{pct.toFixed(1)}%</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
