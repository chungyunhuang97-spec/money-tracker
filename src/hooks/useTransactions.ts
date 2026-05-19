'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { Transaction, TransactionInsert, CardId } from '@/types'

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
    try {
      const params = new URLSearchParams()
      if (month) params.set('month', month)
      if (cardId) params.set('card_id', cardId)
      const res = await apiFetch<{ data: Transaction[] }>(`/api/transactions?${params}`)
      setTransactions(res.data || [])
    } catch { setTransactions([]) }
    setLoading(false)
  }, [month, cardId])

  useEffect(() => { load() }, [load])

  const add = async (tx: TransactionInsert) => {
    const res = await apiFetch<{ data: Transaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    })
    if (res.data) setTransactions((prev) => [res.data, ...prev])
    return res.data
  }

  const update = async (id: string, updates: Partial<TransactionInsert>) => {
    const res = await apiFetch<{ data: Transaction }>(`/api/transactions?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    if (res.data) setTransactions((prev) => prev.map((t) => (t.id === id ? res.data : t)))
  }

  const remove = async (id: string) => {
    await apiFetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
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
      try {
        const res = await apiFetch<{ data: { card_id: string; amount: number }[] }>(
          `/api/transactions?month=${month}&fields=card_id,amount`
        )
        const map: Record<string, number> = {}
        ;(res.data || []).forEach((tx) => {
          map[tx.card_id] = (map[tx.card_id] || 0) + Number(tx.amount)
        })
        setSpending(map)
      } catch { setSpending({}) }
      setLoading(false)
    }
    load()
  }, [month])

  return { spending, loading }
}
