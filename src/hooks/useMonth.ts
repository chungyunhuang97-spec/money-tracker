'use client'

import { useState } from 'react'
import { getCurrentMonth, getPrevMonth } from '@/lib/utils'

export function useMonth() {
  const [month, setMonth] = useState(getCurrentMonth())

  const goToPrev = () => setMonth((m) => getPrevMonth(m))
  const goToNext = () => {
    setMonth((m) => {
      const [y, mo] = m.split('-').map(Number)
      const next = mo === 12
        ? `${y + 1}-01`
        : `${y}-${String(mo + 1).padStart(2, '0')}`
      return next <= getCurrentMonth() ? next : m
    })
  }
  const isCurrentMonth = month === getCurrentMonth()

  return { month, setMonth, goToPrev, goToNext, isCurrentMonth }
}
