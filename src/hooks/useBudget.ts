'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { BudgetItem, BudgetItemInsert, IncomeSource, IncomeSourceInsert } from '@/types'

export function useBudgetItems(month: string) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ data: BudgetItem[] }>(`/api/budget?month=${month}`)
      setItems(res.data || [])
    } catch { setItems([]) }
    setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  const add = async (item: BudgetItemInsert) => {
    const res = await apiFetch<{ data: BudgetItem }>('/api/budget', {
      method: 'POST',
      body: JSON.stringify(item),
    })
    if (res.data) setItems((prev) => [...prev, res.data])
    return res.data
  }

  const update = async (id: string, updates: Partial<BudgetItemInsert>) => {
    const res = await apiFetch<{ data: BudgetItem }>(`/api/budget?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    if (res.data) setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)))
  }

  const remove = async (id: string) => {
    await apiFetch(`/api/budget?id=${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const total = items.reduce((sum, i) => sum + Number(i.amount), 0)
  return { items, loading, add, update, remove, total, refetch: load }
}

export function useIncomeSources(month: string) {
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ data: IncomeSource[] }>(`/api/income?month=${month}`)
      setSources(res.data || [])
    } catch { setSources([]) }
    setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  const add = async (source: IncomeSourceInsert) => {
    const res = await apiFetch<{ data: IncomeSource }>('/api/income', {
      method: 'POST',
      body: JSON.stringify(source),
    })
    if (res.data) setSources((prev) => [...prev, res.data])
  }

  const update = async (id: string, updates: Partial<IncomeSourceInsert>) => {
    const res = await apiFetch<{ data: IncomeSource }>(`/api/income?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    if (res.data) setSources((prev) => prev.map((s) => (s.id === id ? res.data : s)))
  }

  const remove = async (id: string) => {
    await apiFetch(`/api/income?id=${id}`, { method: 'DELETE' })
    setSources((prev) => prev.filter((s) => s.id !== id))
  }

  const total = sources.reduce((sum, s) => sum + Number(s.amount), 0)
  return { sources, loading, add, update, remove, total }
}
