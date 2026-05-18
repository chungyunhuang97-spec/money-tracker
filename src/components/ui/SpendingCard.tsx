'use client'

import { motion } from 'framer-motion'
import { Card } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface SpendingCardProps {
  card: Card
  spent: number
  index: number
}

export default function SpendingCard({ card, spent, index }: SpendingCardProps) {
  const percentage = Math.min((spent / card.limit) * 100, 100)
  const isWarning = percentage > 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{ backgroundColor: card.color }}
    >
      {/* 卡片名稱 */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="text-xs font-medium tracking-[0.15em] uppercase"
          style={{ color: card.textColor, opacity: 0.6 }}
        >
          {card.name}
        </span>
        {isWarning && (
          <span
            className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${card.textColor}18`,
              color: card.textColor,
            }}
          >
            快滿了
          </span>
        )}
      </div>

      {/* 金額 */}
      <div className="mb-5">
        <span
          className="font-number text-4xl font-normal leading-none"
          style={{ color: card.textColor }}
        >
          {formatCurrency(spent)}
        </span>
        <span
          className="text-xs ml-2 opacity-50"
          style={{ color: card.textColor }}
        >
          / {formatCurrency(card.limit)}
        </span>
      </div>

      {/* 進度條 */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: `${card.textColor}18` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: card.textColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: index * 0.08 + 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] opacity-40" style={{ color: card.textColor }}>
          已使用 {percentage.toFixed(0)}%
        </span>
        <span className="text-[10px] opacity-40" style={{ color: card.textColor }}>
          剩 {formatCurrency(card.limit - spent)}
        </span>
      </div>
    </motion.div>
  )
}
