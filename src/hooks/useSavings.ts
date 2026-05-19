'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SavingsGoal, SavingsDeposit, SavingsDepositInsert } from '@/types'

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('savings_goals')
      .select('*, deposits:savings_deposits(*)')
      .order('created_at')
    if (data) setGoals(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addGoal = async (name: string, target_amount: number) => {
    const { data } = await supabase
      .from('savings_goals')
      .insert({ name, target_amount })
      .select('*, deposits:savings_deposits(*)')
      .single()
    if (data) setGoals((prev) => [...prev, data])
  }

  const updateGoal = async (id: string, updates: { name?: string; target_amount?: number }) => {
    await supabase.from('savings_goals').update(updates).eq('id', id)
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  const removeGoal = async (id: string) => {
    await supabase.from('savings_goals').delete().eq('id', id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const addDeposit = async (deposit: SavingsDepositInsert) => {
    const { data } = await supabase
      .from('savings_deposits')
      .upsert(deposit, { onConflict: 'goal_id,month' })
      .select()
      .single()
    if (data) {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== deposit.goal_id) return g
          const existingIdx = g.deposits?.findIndex((d) => d.month === deposit.month) ?? -1
          const newDeposits = [...(g.deposits || [])]
          if (existingIdx >= 0) newDeposits[existingIdx] = data
          else newDeposits.push(data)
          return { ...g, deposits: newDeposits }
        })
      )
    }
  }

  const removeDeposit = async (goalId: string, depositId: string) => {
    await supabase.from('savings_deposits').delete().eq('id', depositId)
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, deposits: g.deposits?.filter((d) => d.id !== depositId) }
          : g
      )
    )
  }

  return { goals, loading, addGoal, updateGoal, removeGoal, addDeposit, removeDeposit, refetch: load }
}
