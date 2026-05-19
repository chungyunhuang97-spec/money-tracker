'use client'

import { motion } from 'framer-motion'
import { useMonth } from '@/hooks/useMonth'
import { useBudgetItems, useIncomeSources } from '@/hooks/useBudget'
import { useCardSettings } from '@/hooks/useSettings'
import { useCardSpending } from '@/hooks/useTransactions'
import { formatCurrency, getMonthLabel, calcDailyBudget, calcWeeklyBudget } from '@/lib/utils'
import MonthPicker from '@/components/ui/MonthPicker'

export default function DashboardPage() {
  const { month, goToPrev, goToNext, isCurrentMonth } = useMonth()
  const { total: totalExpense } = useBudgetItems(month)
  const { total: totalIncome } = useIncomeSources(month)
  const { cards } = useCardSettings()
  const { spending } = useCardSpending(month)

  const remaining = totalIncome - totalExpense
  const daily = calcDailyBudget(remaining, month)
  const weekly = calcWeeklyBudget(remaining, month)

  return (
    <div className="px-4 pt-10 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-[#1A1F5E]">總覽</h1>
        <MonthPicker month={month} onPrev={goToPrev} onNext={goToNext} isCurrentMonth={isCurrentMonth} />
      </div>

      {/* 收支總覽卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1F5E] rounded-3xl p-5 mb-4 text-white"
      >
        <p className="text-xs text-white/50 tracking-widest uppercase mb-4">{getMonthLabel(month)}</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[11px] text-white/40 mb-1">總收入</p>
            <p className="font-bagel text-2xl font-normal leading-none text-white">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/40 mb-1">總支出</p>
            <p className="font-bagel text-2xl font-normal leading-none text-white">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-[11px] text-white/40 mb-1">剩餘可動用</p>
          <p className={`font-bagel text-4xl font-normal leading-none ${remaining < 0 ? 'text-red-400' : 'text-[#FFE000]'}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </motion.div>

      {/* 日均 / 週均 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4">
          <p className="text-[11px] text-[#0D0D0D]/40 mb-1">日均可用</p>
          <p className="font-bagel text-2xl font-normal text-[#1A1F5E] leading-none">
            {formatCurrency(Math.max(0, daily))}
          </p>
          <p className="text-[10px] text-[#0D0D0D]/30 mt-1">/ 天</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4">
          <p className="text-[11px] text-[#0D0D0D]/40 mb-1">週均可用</p>
          <p className="font-bagel text-2xl font-normal text-[#1A1F5E] leading-none">
            {formatCurrency(Math.max(0, weekly))}
          </p>
          <p className="text-[10px] text-[#0D0D0D]/30 mt-1">/ 週</p>
        </div>
      </motion.div>

      {/* 三卡進度 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4"
      >
        <p className="text-xs text-[#0D0D0D]/40 tracking-wider uppercase mb-4">信用卡使用狀況</p>
        <div className="space-y-3">
          {cards.map((card) => {
            const used = spending[card.id] || 0
            const pct = Math.min((used / card.credit_limit) * 100, 100)
            return (
              <div key={card.id}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#0D0D0D]">{card.name}</span>
                  <span className="font-bagel text-sm text-[#0D0D0D]/60">{formatCurrency(used)}</span>
                </div>
                <div className="h-1.5 bg-[#0D0D0D]/6 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: card.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#0D0D0D]/25">{pct.toFixed(0)}%</span>
                  <span className="text-[10px] text-[#0D0D0D]/25">額度 {formatCurrency(card.credit_limit)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
