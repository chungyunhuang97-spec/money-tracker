'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { BudgetItem, BudgetItemInsert, IncomeSource, IncomeSourceInsert } from '@/types'

export function useBudgetItems(month: string) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('budget_items')
      .select('*, category:budget_categories(*), bank_account:bank_accounts(*)')
      .eq('month', month)
      .order('created_at')
    if (data) setItems(data)
    setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  const add = async (item: BudgetItemInsert) => {
    const { data } = await supabase
      .from('budget_items')
      .insert(item)
      .select('*, category:budget_categories(*), bank_account:bank_accounts(*)')
      .single()
    if (data) setItems((prev) => [...prev, data])
    return data
  }

  const update = async (id: string, updates: Partial<BudgetItemInsert>) => {
    const { data } = await supabase
      .from('budget_items')
      .update(updates)
      .eq('id', id)
      .select('*, category:budget_categories(*), bank_account:bank_accounts(*)')
      .single()
    if (data) setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
  }

  const remove = async (id: string) => {
    await supabase.from('budget_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0)

  return { items, loading, add, update, remove, total, refetch: load }
}

export function useIncomeSources(month: string) {
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('income_sources')
      .select('*')
      .eq('month', month)
      .order('created_at')
    if (data) setSources(data)
    setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  const add = async (source: IncomeSourceInsert) => {
    const { data } = await supabase.from('income_sources').insert(source).select().single()
    if (data) setSources((prev) => [...prev, data])
  }

  const update = async (id: string, updates: Partial<IncomeSourceInsert>) => {
    const { data } = await supabase.from('income_sources').update(updates).eq('id', id).select().single()
    if (data) setSources((prev) => prev.map((s) => (s.id === id ? data : s)))
  }

  const remove = async (id: string) => {
    await supabase.from('income_sources').delete().eq('id', id)
    setSources((prev) => prev.filter((s) => s.id !== id))
  }

  const total = sources.reduce((sum, s) => sum + s.amount, 0)

  return { sources, loading, add, update, remove, total }
}
