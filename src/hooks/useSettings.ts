'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CardSetting, BankAccount, BudgetCategory } from '@/types'

export function useCardSettings() {
  const [cards, setCards] = useState<CardSetting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('card_settings').select('*').order('billing_day').then(({ data }) => {
      if (data) setCards(data)
      setLoading(false)
    })
  }, [])

  const update = async (id: string, updates: Partial<CardSetting>) => {
    await supabase.from('card_settings').update(updates).eq('id', id)
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  return { cards, loading, update }
}

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('bank_accounts').select('*').order('created_at')
    if (data) setAccounts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const add = async (name: string) => {
    const { data } = await supabase.from('bank_accounts').insert({ name }).select().single()
    if (data) setAccounts((prev) => [...prev, data])
  }

  const remove = async (id: string) => {
    await supabase.from('bank_accounts').delete().eq('id', id)
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  return { accounts, loading, add, remove }
}

export function useBudgetCategories() {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('budget_categories').select('*').order('created_at')
    if (data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const add = async (name: string, color: string) => {
    const { data } = await supabase.from('budget_categories').insert({ name, color }).select().single()
    if (data) setCategories((prev) => [...prev, data])
  }

  const remove = async (id: string) => {
    await supabase.from('budget_categories').delete().eq('id', id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return { categories, loading, add, remove }
}
