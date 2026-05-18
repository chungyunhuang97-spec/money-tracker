'use client'

import { getMonthRange } from '@/lib/utils'

interface MonthFilterProps {
  selectedMonth: number // 0 = 本月, 1 = 上月, 2 = 兩個月前
  onChange: (month: number) => void
}

export default function MonthFilter({ selectedMonth, onChange }: MonthFilterProps) {
  const months = [0, 1, 2].map((n) => getMonthRange(n))

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {months.map((m, index) => (
        <button
          key={m.month}
          onClick={() => onChange(index)}
          className={`
            flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${selectedMonth === index
              ? 'bg-[#1A1F5E] text-white'
              : 'bg-[#0D0D0D]/6 text-[#0D0D0D]/50'
            }
          `}
        >
          {index === 0 ? '本月' : m.label}
        </button>
      ))}
    </div>
  )
}
