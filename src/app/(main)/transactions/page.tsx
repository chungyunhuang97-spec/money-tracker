'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CARDS, CardId } from '@/types'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionRow from '@/components/ui/TransactionRow'
import MonthFilter from '@/components/ui/MonthFilter'
import { cn } from '@/lib/utils'

export default function TransactionsPage() {
  const [monthsAgo, setMonthsAgo] = useState(0)
  const [selectedCard, setSelectedCard] = useState<CardId | undefined>(undefined)
  const { transactions, loading } = useTransactions({ monthsAgo, cardId: selectedCard })

  return (
    <div className="px-4 pt-12 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-light text-[#1A1F5E] mb-6"
      >
        刷卡記錄
      </motion.h1>

      {/* 月份 Filter */}
      <div className="mb-4">
        <MonthFilter selectedMonth={monthsAgo} onChange={setMonthsAgo} />
      </div>

      {/* 卡片 Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCard(undefined)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            !selectedCard ? 'bg-[#1A1F5E] text-white' : 'bg-[#0D0D0D]/6 text-[#0D0D0D]/50'
          )}
        >
          全部
        </button>
        {CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(card.id)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              selectedCard === card.id ? 'text-[#0D0D0D]' : 'bg-[#0D0D0D]/6 text-[#0D0D0D]/50'
            )}
            style={selectedCard === card.id ? { backgroundColor: card.color } : {}}
          >
            {card.name}
          </button>
        ))}
      </div>

      {/* 交易列表 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-12 rounded-xl bg-[#0D0D0D]/4 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 text-sm text-[#0D0D0D]/25">
          沒有符合條件的消費記錄
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-[#0D0D0D]/30 mb-3">{transactions.length} 筆</p>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
