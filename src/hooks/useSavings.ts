'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { SavingsGoal, SavingsDepositInsert } from '@/types'

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ data: SavingsGoal[] }>('/api/savings')
      setGoals(res.data || [])
    } catch { setGoals([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addGoal = async (name: string, target_amount: number) => {
    const res = await apiFetch<{ data: SavingsGoal }>('/api/savings', {
      method: 'POST',
      body: JSON.stringify({ name, target_amount }),
    })
    if (res.data) setGoals((prev) => [...prev, { ...res.data, deposits: [] }])
  }

  const updateGoal = async (id: string, updates: { name?: string; target_amount?: number }) => {
    const res = await apiFetch<{ data: SavingsGoal }>(`/api/savings?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    if (res.data) setGoals((prev) => prev.map((g) => g.id === id ? { ...g, ...res.data } : g))
  }

  const removeGoal = async (id: string) => {
    await apiFetch(`/api/savings?id=${id}`, { method: 'DELETE' })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const addDeposit = async (deposit: SavingsDepositInsert) => {
    const res = await apiFetch<{ data: any }>('/api/savings/deposits', {
      method: 'POST',
      body: JSON.stringify(deposit),
    })
    if (res.data) {
      setGoals((prev) => prev.map((g) => {
        if (g.id !== deposit.goal_id) return g
        const deps = [...(g.deposits || [])]
        const idx = deps.findIndex((d) => d.month === deposit.month)
        if (idx >= 0) deps[idx] = res.data
        else deps.push(res.data)
        return { ...g, deposits: deps }
      }))
    }
  }

  const removeDeposit = async (goalId: string, depositId: string) => {
    await apiFetch(`/api/savings/deposits?id=${depositId}`, { method: 'DELETE' })
    setGoals((prev) => prev.map((g) =>
      g.id === goalId
        ? { ...g, deposits: g.deposits?.filter((d) => d.id !== depositId) }
        : g
    ))
  }

  return { goals, loading, addGoal, updateGoal, removeGoal, addDeposit, removeDeposit, refetch: load }
}
