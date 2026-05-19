'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { CardSetting, BankAccount, BudgetCategory } from '@/types'

export function useCardSettings() {
  const [cards, setCards] = useState<CardSetting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ data: CardSetting[] }>('/api/settings/cards')
      .then((res) => setCards(res.data || []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false))
  }, [])

  const update = async (id: string, updates: Partial<CardSetting>) => {
    const res = await apiFetch<{ data: CardSetting }>(`/api/settings/cards?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    if (res.data) setCards((prev) => prev.map((c) => (c.id === id ? res.data : c)))
  }

  return { cards, loading, update }
}

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await apiFetch<{ data: BankAccount[] }>('/api/settings/accounts')
      setAccounts(res.data || [])
    } catch { setAccounts([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const add = async (name: string) => {
    const res = await apiFetch<{ data: BankAccount }>('/api/settings/accounts', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    if (res.data) setAccounts((prev) => [...prev, res.data])
  }

  const remove = async (id: string) => {
    await apiFetch(`/api/settings/accounts?id=${id}`, { method: 'DELETE' })
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  return { accounts, loading, add, remove }
}

export function useBudgetCategories() {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await apiFetch<{ data: BudgetCategory[] }>('/api/settings/categories')
      setCategories(res.data || [])
    } catch { setCategories([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const add = async (name: string, color: string) => {
    const res = await apiFetch<{ data: BudgetCategory }>('/api/settings/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    })
    if (res.data) setCategories((prev) => [...prev, res.data])
  }

  const remove = async (id: string) => {
    await apiFetch(`/api/settings/categories?id=${id}`, { method: 'DELETE' })
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return { categories, loading, add, remove }
}
