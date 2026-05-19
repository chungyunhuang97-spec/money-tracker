'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMonth } from '@/hooks/useMonth'
import { useBudgetItems, useIncomeSources } from '@/hooks/useBudget'
import { useBankAccounts, useBudgetCategories } from '@/hooks/useSettings'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { BudgetItem, BudgetItemInsert, IncomeSourceInsert, CardId } from '@/types'
import MonthPicker from '@/components/ui/MonthPicker'
import AmountInput from '@/components/ui/AmountInput'
import BottomSheet from '@/components/ui/BottomSheet'

// ─── 顏色標籤 ───────────────────────────────────────────────
function CategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {name}
    </span>
  )
}

// ─── 單筆支出細項列 ─────────────────────────────────────────
function BudgetRow({ item, onEdit }: { item: BudgetItem; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="w-full flex items-center gap-3 py-3 border-b border-[#0D0D0D]/5 last:border-0 text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-medium text-[#0D0D0D]">{item.item_name}</span>
          {item.category && (
            <CategoryBadge name={item.category.name} color={item.category.color} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.bank_account && (
            <span className="text-[11px] text-[#0D0D0D]/35">{item.bank_account.name}</span>
          )}
          {(item.pending_amount ?? 0) > 0 && (
            <span className="text-[11px] text-[#FF4D1A]">代付 {formatCurrency(item.pending_amount!)}</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bagel text-base text-[#0D0D0D]">{formatCurrency(item.amount)}</p>
        <div className="flex gap-1 justify-end mt-0.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.transferred ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#0D0D0D]/8 text-[#0D0D0D]/35'}`}>
            轉帳
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.spent ? 'bg-[#1A1F5E]/15 text-[#1A1F5E]' : 'bg-[#0D0D0D]/8 text-[#0D0D0D]/35'}`}>
            支出
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── 新增/編輯支出細項的表單 ────────────────────────────────
function BudgetItemForm({
  initial,
  onSave,
  onDelete,
  onClose,
  categories,
  accounts,
}: {
  initial?: BudgetItem
  onSave: (data: BudgetItemInsert) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  categories: ReturnType<typeof useBudgetCategories>['categories']
  accounts: ReturnType<typeof useBankAccounts>['accounts']
}) {
  const currentMonth = getCurrentMonth()
  const [form, setForm] = useState({
    item_name: initial?.item_name || '',
    category_id: initial?.category_id || '',
    amount: initial?.amount?.toString() || '',
    bank_account_id: initial?.bank_account_id || '',
    card_id: initial?.card_id || '' as CardId | '',
    transferred: initial?.transferred || false,
    spent: initial?.spent || false,
    notes: initial?.notes || '',
    month: initial?.month || currentMonth,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.item_name || !form.category_id || !form.amount) return
    setSaving(true)
    await onSave({
      month: form.month,
      item_name: form.item_name,
      category_id: form.category_id,
      amount: parseFloat(form.amount),
      bank_account_id: form.bank_account_id || undefined,
      card_id: form.card_id as CardId || undefined,
      transferred: form.transferred,
      spent: form.spent,
      notes: form.notes || undefined,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-4 pb-4">
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">項目名稱</label>
        <input
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          placeholder="例：玉山卡費、房租"
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">類別</label>
          <select
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">選擇類別</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">金額</label>
          <AmountInput
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
            value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">存入銀行</label>
          <select
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            value={form.bank_account_id}
            onChange={(e) => setForm({ ...form, bank_account_id: e.target.value })}
          >
            <option value="">不指定</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">對應信用卡（選填）</label>
          <select
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            value={form.card_id}
            onChange={(e) => setForm({ ...form, card_id: e.target.value as CardId | '' })}
          >
            <option value="">不指定</option>
            <option value="yushan">玉山卡</option>
            <option value="fubon">富邦卡</option>
            <option value="dbs">星展卡</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">備註</label>
        <input
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          placeholder="選填"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#10B981]"
            checked={form.transferred}
            onChange={(e) => setForm({ ...form, transferred: e.target.checked })}
          />
          <span className="text-sm text-[#0D0D0D]/70">已轉帳</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#1A1F5E]"
            checked={form.spent}
            onChange={(e) => setForm({ ...form, spent: e.target.checked })}
          />
          <span className="text-sm text-[#0D0D0D]/70">已支出</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        {onDelete && (
          <button
            onClick={async () => { await onDelete(); onClose() }}
            className="flex-1 py-3 rounded-2xl border border-[#FF4D1A]/30 text-[#FF4D1A] text-sm font-medium"
          >
            刪除
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !form.item_name || !form.category_id || !form.amount}
          className="flex-1 py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium disabled:opacity-40"
        >
          {saving ? '儲存中...' : '儲存'}
        </button>
      </div>
    </div>
  )
}

// ─── 新增收入的表單 ─────────────────────────────────────────
function IncomeForm({
  month,
  onSave,
  onClose,
  prevMonths,
}: {
  month: string
  onSave: (data: IncomeSourceInsert) => Promise<void>
  onClose: () => void
  prevMonths: string[]
}) {
  const [form, setForm] = useState({
    source_type: '薪資',
    amount: '',
    from_month: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const sourceTypes = ['薪資', '預留款', '接案', '其他']

  const handleSave = async () => {
    if (!form.amount) return
    setSaving(true)
    await onSave({
      month,
      source_type: form.source_type,
      amount: parseFloat(form.amount),
      from_month: form.source_type === '預留款' && form.from_month ? form.from_month : undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-4 pb-4">
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">收入類型</label>
        <div className="flex gap-2 flex-wrap">
          {sourceTypes.map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, source_type: t })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${form.source_type === t ? 'bg-[#1A1F5E] text-white' : 'bg-[#0D0D0D]/6 text-[#0D0D0D]/50'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {form.source_type === '預留款' && (
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">來自哪個月</label>
          <select
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            value={form.from_month}
            onChange={(e) => setForm({ ...form, from_month: e.target.value })}
          >
            <option value="">選擇月份</option>
            {prevMonths.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">金額</label>
        <AmountInput
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          value={form.amount}
          onChange={(v) => setForm({ ...form, amount: v })}
        />
      </div>
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">備註</label>
        <input
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          placeholder="選填"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !form.amount}
        className="w-full py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium disabled:opacity-40"
      >
        {saving ? '儲存中...' : '新增收入'}
      </button>
    </div>
  )
}

// ─── 主頁面 ──────────────────────────────────────────────────
export default function BudgetPage() {
  const { month, goToPrev, goToNext, isCurrentMonth } = useMonth()
  const { items, loading, add, update, remove, total } = useBudgetItems(month)
  const { sources, add: addIncome, remove: removeIncome, total: totalIncome } = useIncomeSources(month)
  const { categories } = useBudgetCategories()
  const { accounts } = useBankAccounts()

  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [editItem, setEditItem] = useState<BudgetItem | null>(null)

  const prevMonths = [-1, -2, -3].map((n) => {
    const d = new Date(`${month}-01`)
    d.setMonth(d.getMonth() + n)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="px-4 pt-10 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-[#1A1F5E]">支出細項</h1>
        <MonthPicker month={month} onPrev={goToPrev} onNext={goToNext} isCurrentMonth={isCurrentMonth} />
      </div>

      {/* 收入區 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-[#0D0D0D]/40 tracking-wider uppercase">本月收入</p>
          <button
            onClick={() => setShowAddIncome(true)}
            className="text-xs text-[#1A1F5E] font-medium flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            新增
          </button>
        </div>
        {sources.length === 0 ? (
          <p className="text-sm text-[#0D0D0D]/25 py-2">尚無收入記錄</p>
        ) : (
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-[#0D0D0D]/70">{s.source_type}</span>
                  {s.from_month && <span className="text-[11px] text-[#0D0D0D]/35 ml-1">（來自 {s.from_month}）</span>}
                  {s.notes && <span className="text-[11px] text-[#0D0D0D]/35 ml-1">{s.notes}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bagel text-sm text-[#0D0D0D]">{formatCurrency(s.amount)}</span>
                  <button onClick={() => removeIncome(s.id)} className="text-[#0D0D0D]/20 text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-[#0D0D0D]/6 pt-2 flex justify-between">
              <span className="text-xs text-[#0D0D0D]/40">合計</span>
              <span className="font-bagel text-sm font-medium text-[#1A1F5E]">{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 支出細項 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-[#0D0D0D]/40 tracking-wider uppercase">支出配置</p>
          <button
            onClick={() => setShowAddItem(true)}
            className="text-xs text-[#1A1F5E] font-medium flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            新增項目
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((n) => <div key={n} className="h-12 rounded-xl bg-[#0D0D0D]/4 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#0D0D0D]/25 py-4 text-center">點右上角新增第一筆</p>
        ) : (
          <>
            {items.map((item) => (
              <BudgetRow key={item.id} item={item} onEdit={() => setEditItem(item)} />
            ))}
            <div className="border-t border-[#0D0D0D]/6 pt-3 flex justify-between">
              <span className="text-xs text-[#0D0D0D]/40">總支出</span>
              <span className="font-bagel text-sm font-medium text-[#1A1F5E]">{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </div>

      {/* 新增支出 Sheet */}
      <BottomSheet open={showAddItem} onClose={() => setShowAddItem(false)} title="新增支出項目">
        <BudgetItemForm
          onSave={async (data) => { await add(data) }}
          onClose={() => setShowAddItem(false)}
          categories={categories}
          accounts={accounts}
        />
      </BottomSheet>

      {/* 編輯支出 Sheet */}
      <BottomSheet open={!!editItem} onClose={() => setEditItem(null)} title="編輯項目">
        {editItem && (
          <BudgetItemForm
            initial={editItem}
            onSave={async (data) => { await update(editItem.id, data) }}
            onDelete={async () => { await remove(editItem.id) }}
            onClose={() => setEditItem(null)}
            categories={categories}
            accounts={accounts}
          />
        )}
      </BottomSheet>

      {/* 新增收入 Sheet */}
      <BottomSheet open={showAddIncome} onClose={() => setShowAddIncome(false)} title="新增收入">
        <IncomeForm
          month={month}
          onSave={async (data) => { await addIncome(data) }}
          onClose={() => setShowAddIncome(false)}
          prevMonths={prevMonths}
        />
      </BottomSheet>
    </div>
  )
}
