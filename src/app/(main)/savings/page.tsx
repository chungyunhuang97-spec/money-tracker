'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSavingsGoals } from '@/hooks/useSavings'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { DEPOSIT_COLORS, SavingsGoal } from '@/types'
import BottomSheet from '@/components/ui/BottomSheet'

function GoalCard({ goal, onAddDeposit, onEdit }: {
  goal: SavingsGoal
  onAddDeposit: () => void
  onEdit: () => void
}) {
  const deposits = goal.deposits || []
  const accumulated = deposits.reduce((s, d) => s + d.amount, 0)
  const pct = Math.min((accumulated / goal.target_amount) * 100, 100)

  // 月份排序
  const sorted = [...deposits].sort((a, b) => a.month.localeCompare(b.month))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-medium text-[#0D0D0D]">{goal.name}</h3>
          <p className="text-xs text-[#0D0D0D]/35 mt-0.5">目標 {formatCurrency(goal.target_amount)}</p>
        </div>
        <button onClick={onEdit} className="text-xs text-[#0D0D0D]/30 p-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {/* 月份進度條（分段顯示） */}
      {sorted.length > 0 && (
        <div className="mb-3">
          <div className="h-4 rounded-full overflow-hidden flex bg-[#0D0D0D]/6">
            {sorted.map((d) => {
              const segPct = (d.amount / goal.target_amount) * 100
              return (
                <motion.div
                  key={d.id}
                  className="h-full"
                  style={{ width: `${segPct}%`, backgroundColor: d.color || '#1A1F5E' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${segPct}%` }}
                  transition={{ duration: 0.6 }}
                  title={`${d.month}：${formatCurrency(d.amount)}`}
                />
              )
            })}
          </div>
          {/* 圖例 */}
          <div className="flex flex-wrap gap-2 mt-2">
            {sorted.map((d) => (
              <div key={d.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color || '#1A1F5E' }} />
                <span className="text-[10px] text-[#0D0D0D]/40">{d.month.slice(5)}月 {formatCurrency(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <span className="font-number text-lg font-normal text-[#1A1F5E]">{formatCurrency(accumulated)}</span>
          <span className="text-xs text-[#0D0D0D]/35 ml-1">/ {pct.toFixed(0)}%</span>
        </div>
        <button
          onClick={onAddDeposit}
          className="text-xs bg-[#1A1F5E] text-white px-3 py-1.5 rounded-full font-medium"
        >
          本月存入
        </button>
      </div>
    </motion.div>
  )
}

function DepositForm({
  goalId,
  existingMonths,
  onSave,
  onClose,
}: {
  goalId: string
  existingMonths: string[]
  onSave: (goalId: string, month: string, amount: number, color: string) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    month: getCurrentMonth(),
    amount: '',
    color: DEPOSIT_COLORS[0],
  })
  const [saving, setSaving] = useState(false)

  return (
    <div className="space-y-4 pb-4">
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">月份</label>
        <input
          type="month"
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">存入金額</label>
        <input
          type="number"
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          placeholder="0"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-2 block">進度條顏色</label>
        <div className="flex gap-2 flex-wrap">
          {DEPOSIT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setForm({ ...form, color: c })}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-[#0D0D0D]/20 ring-offset-1' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <button
        onClick={async () => {
          if (!form.amount) return
          setSaving(true)
          await onSave(goalId, form.month, parseFloat(form.amount), form.color)
          setSaving(false)
          onClose()
        }}
        disabled={saving || !form.amount}
        className="w-full py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium disabled:opacity-40"
      >
        {saving ? '儲存中...' : '儲存'}
      </button>
    </div>
  )
}

function NewGoalForm({ onSave, onClose }: { onSave: (name: string, target: number) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', target: '' })
  const [saving, setSaving] = useState(false)

  return (
    <div className="space-y-4 pb-4">
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">目標名稱</label>
        <input
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          placeholder="例：出國旅遊基金"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">目標金額</label>
        <input
          type="number"
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          placeholder="0"
          value={form.target}
          onChange={(e) => setForm({ ...form, target: e.target.value })}
        />
      </div>
      <button
        onClick={async () => {
          if (!form.name || !form.target) return
          setSaving(true)
          await onSave(form.name, parseFloat(form.target))
          setSaving(false)
          onClose()
        }}
        disabled={saving || !form.name || !form.target}
        className="w-full py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium disabled:opacity-40"
      >
        {saving ? '建立中...' : '建立目標'}
      </button>
    </div>
  )
}

export default function SavingsPage() {
  const { goals, loading, addGoal, updateGoal, removeGoal, addDeposit } = useSavingsGoals()
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [depositFor, setDepositFor] = useState<SavingsGoal | null>(null)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const [editForm, setEditForm] = useState({ name: '', target: '' })

  return (
    <div className="px-4 pt-10 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-[#1A1F5E]">儲蓄目標</h1>
        <button
          onClick={() => setShowNewGoal(true)}
          className="text-xs text-[#1A1F5E] font-medium flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          新增目標
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => <div key={n} className="h-40 rounded-2xl bg-[#0D0D0D]/4 animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[#0D0D0D]/25 mb-4">還沒有儲蓄目標</p>
          <button
            onClick={() => setShowNewGoal(true)}
            className="text-sm text-[#1A1F5E] font-medium"
          >
            建立第一個目標
          </button>
        </div>
      ) : (
        goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onAddDeposit={() => setDepositFor(goal)}
            onEdit={() => {
              setEditGoal(goal)
              setEditForm({ name: goal.name, target: goal.target_amount.toString() })
            }}
          />
        ))
      )}

      {/* 建立目標 */}
      <BottomSheet open={showNewGoal} onClose={() => setShowNewGoal(false)} title="建立儲蓄目標">
        <NewGoalForm onSave={addGoal} onClose={() => setShowNewGoal(false)} />
      </BottomSheet>

      {/* 新增存款 */}
      <BottomSheet
        open={!!depositFor}
        onClose={() => setDepositFor(null)}
        title={`存入 — ${depositFor?.name}`}
      >
        {depositFor && (
          <DepositForm
            goalId={depositFor.id}
            existingMonths={(depositFor.deposits || []).map((d) => d.month)}
            onSave={async (goalId, month, amount, color) => {
              await addDeposit({ goal_id: goalId, month, amount, color })
            }}
            onClose={() => setDepositFor(null)}
          />
        )}
      </BottomSheet>

      {/* 編輯目標 */}
      <BottomSheet open={!!editGoal} onClose={() => setEditGoal(null)} title="編輯目標">
        {editGoal && (
          <div className="space-y-4 pb-4">
            <div>
              <label className="text-xs text-[#0D0D0D]/40 mb-1 block">目標名稱</label>
              <input
                className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-[#0D0D0D]/40 mb-1 block">目標金額</label>
              <input
                type="number"
                className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                value={editForm.target}
                onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => { await removeGoal(editGoal.id); setEditGoal(null) }}
                className="flex-1 py-3 rounded-2xl border border-[#FF4D1A]/30 text-[#FF4D1A] text-sm font-medium"
              >
                刪除目標
              </button>
              <button
                onClick={async () => {
                  await updateGoal(editGoal.id, { name: editForm.name, target_amount: parseFloat(editForm.target) })
                  setEditGoal(null)
                }}
                className="flex-1 py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium"
              >
                儲存
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
