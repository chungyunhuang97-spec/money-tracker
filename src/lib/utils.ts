import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { CARDS, CardId } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MM/dd', { locale: zhTW })
}

export function getCurrentMonthRange() {
  const now = new Date()
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
    label: format(now, 'yyyy年M月', { locale: zhTW }),
  }
}

export function getMonthRange(monthsAgo: number) {
  const target = subMonths(new Date(), monthsAgo)
  return {
    start: format(startOfMonth(target), 'yyyy-MM-dd'),
    end: format(endOfMonth(target), 'yyyy-MM-dd'),
    label: format(target, 'M月', { locale: zhTW }),
    month: format(target, 'yyyy-MM'),
  }
}

export function getCardById(id: CardId) {
  return CARDS.find((c) => c.id === id)
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
