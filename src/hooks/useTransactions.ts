'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction, CardId } from '@/types'
import { getMonthRange } from '@/lib/utils'

interface UseTransactionsOptions {
  monthsAgo?: number
  cardId?: CardId
  limit?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { monthsAgo = 0, cardId, limit } = options
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { start, end } = getMonthRange(monthsAgo)

    let query = supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', start)
      .lte('transaction_date', end)
      .order('transaction_date', { ascending: false })

    if (cardId) {
      query = query.eq('card_id', cardId)
    }
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }, [monthsAgo, cardId, limit])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { transactions, loading, error, refetch: fetch }
}

export function useMonthlySpending(monthsAgo: number = 0) {
  const [spending, setSpending] = useState<Record<CardId, number>>({
    yushan: 0,
    fubon: 0,
    dbs: 0,
  })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { start, end } = getMonthRange(monthsAgo)

      const { data } = await supabase
        .from('transactions')
        .select('card_id, amount')
        .gte('transaction_date', start)
        .lte('transaction_date', end)

      if (data) {
        const map: Record<string, number> = { yushan: 0, fubon: 0, dbs: 0 }
        let sum = 0
        data.forEach((tx) => {
          map[tx.card_id] = (map[tx.card_id] || 0) + tx.amount
          sum += tx.amount
        })
        setSpending(map as Record<CardId, number>)
        setTotal(sum)
      }
      setLoading(false)
    }
    fetch()
  }, [monthsAgo])

  return { spending, total, loading }
}

export function useCategoryBreakdown(monthsAgo: number = 0) {
  const [breakdown, setBreakdown] = useState<{ category: string; total: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { start, end } = getMonthRange(monthsAgo)

      const { data } = await supabase
        .from('transactions')
        .select('category, amount')
        .gte('transaction_date', start)
        .lte('transaction_date', end)

      if (data) {
        const map: Record<string, { total: number; count: number }> = {}
        data.forEach((tx) => {
          if (!map[tx.category]) map[tx.category] = { total: 0, count: 0 }
          map[tx.category].total += tx.amount
          map[tx.category].count += 1
        })
        const sorted = Object.entries(map)
          .map(([category, v]) => ({ category, ...v }))
          .sort((a, b) => b.total - a.total)
        setBreakdown(sorted)
      }
      setLoading(false)
    }
    fetch()
  }, [monthsAgo])

  return { breakdown, loading }
}
