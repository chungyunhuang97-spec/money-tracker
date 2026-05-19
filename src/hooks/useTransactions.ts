'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction, TransactionInsert, CardId } from '@/types'
import { getMonthRange } from '@/lib/utils'

interface UseTransactionsOptions {
  month?: string
  cardId?: CardId
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { month, cardId } = options
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, category:budget_categories(*)')
      .order('transaction_date', { ascending: false })

    if (month) {
      const { start, end } = getMonthRange(month)
      query = query.gte('transaction_date', start).lte('transaction_date', end)
    }
    if (cardId) query = query.eq('card_id', cardId)

    const { data } = await query
    if (data) setTransactions(data)
    setLoading(false)
  }, [month, cardId])

  useEffect(() => { load() }, [load])

  const add = async (tx: TransactionInsert) => {
    const { data } = await supabase
      .from('transactions')
      .insert(tx)
      .select('*, category:budget_categories(*)')
      .single()
    if (data) setTransactions((prev) => [data, ...prev])
    return data
  }

  const update = async (id: string, updates: Partial<TransactionInsert>) => {
    const { data } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, category:budget_categories(*)')
      .single()
    if (data) setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)))
  }

  const remove = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  return { transactions, loading, add, update, remove, refetch: load }
}

export function useCardSpending(month: string) {
  const [spending, setSpending] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { start, end } = getMonthRange(month)
      const { data } = await supabase
        .from('transactions')
        .select('card_id, amount')
        .gte('transaction_date', start)
        .lte('transaction_date', end)

      if (data) {
        const map: Record<string, number> = {}
        data.forEach((tx) => {
          map[tx.card_id] = (map[tx.card_id] || 0) + tx.amount
        })
        setSpending(map)
      }
      setLoading(false)
    }
    load()
  }, [month])

  return { spending, loading }
}
