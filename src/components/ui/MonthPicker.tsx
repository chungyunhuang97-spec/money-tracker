'use client'

import { getMonthLabel, getCurrentMonth } from '@/lib/utils'

interface MonthPickerProps {
  month: string
  onPrev: () => void
  onNext: () => void
  isCurrentMonth: boolean
}

export default function MonthPicker({ month, onPrev, onNext, isCurrentMonth }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="w-7 h-7 rounded-full bg-[#0D0D0D]/6 flex items-center justify-center transition-all duration-150 active:scale-90"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span className="text-sm font-medium text-[#0D0D0D]/70 min-w-[80px] text-center">
        {getMonthLabel(month)}
      </span>
      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className="w-7 h-7 rounded-full bg-[#0D0D0D]/6 flex items-center justify-center transition-all duration-150 active:scale-90 disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  )
}
