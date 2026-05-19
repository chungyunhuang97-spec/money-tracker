import { format, getDaysInMonth, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'M/d', { locale: zhTW })
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function getMonthLabel(month: string): string {
  const [y, m] = month.split('-')
  return `${y}年${parseInt(m)}月`
}

export function getMonthRange(month: string) {
  const date = new Date(`${month}-01`)
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
    days: getDaysInMonth(date),
    weeks: getDaysInMonth(date) / 7,
  }
}

export function getPrevMonth(month: string): string {
  const date = new Date(`${month}-01`)
  return format(subMonths(date, 1), 'yyyy-MM')
}

export function calcDailyBudget(remaining: number, month: string): number {
  const { days } = getMonthRange(month)
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = format(today, 'yyyy-MM')
  const remainingDays = month === currentMonth ? days - currentDay + 1 : days
  return remainingDays > 0 ? remaining / remainingDays : 0
}

export function calcWeeklyBudget(remaining: number, month: string): number {
  const { days } = getMonthRange(month)
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = format(today, 'yyyy-MM')
  const remainingDays = month === currentMonth ? days - currentDay + 1 : days
  return remainingDays > 0 ? (remaining / remainingDays) * 7 : 0
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// 驗證 Bearer Token（API route 用）
export function verifyAuth(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  return authHeader.replace('Bearer ', '') === process.env.SHORTCUT_API_SECRET
}
