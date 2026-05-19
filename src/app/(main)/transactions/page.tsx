'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMonth } from '@/hooks/useMonth'
import { useTransactions } from '@/hooks/useTransactions'
import { useBudgetCategories } from '@/hooks/useSettings'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction, TransactionInsert, CardId } from '@/types'
import MonthPicker from '@/components/ui/MonthPicker'
import BottomSheet from '@/components/ui/BottomSheet'

const CARD_META: Record<string, { name: string; color: string; textColor: string }> = {
  yushan: { name: '玉山', color: '#FFE000', textColor: '#0D0D0D' },
  fubon:  { name: '富邦', color: '#FF4D1A', textColor: '#FFFFFF' },
  dbs:    { name: '星展', color: '#00E0C8', textColor: '#0D0D0D' },
}

function TransactionForm({
  initial,
  onSave,
  onDelete,
  onClose,
  categories,
}: {
  initial?: Transaction
  onSave: (data: TransactionInsert) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  categories: ReturnType<typeof useBudgetCategories>['categories']
}) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    card_id: initial?.card_id || 'yushan' as CardId,
    amount: initial?.amount?.toString() || '',
    merchant: initial?.merchant || '',
    category_id: initial?.category_id || '',
    is_proxy_payment: initial?.is_proxy_payment || false,
    proxy_amount: initial?.proxy_amount?.toString() || '',
    proxy_note: initial?.proxy_note || '',
    transaction_date: initial?.transaction_date || today,
    notes: initial?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.merchant || !form.amount || !form.category_id) return
    setSaving(true)
    await onSave({
      card_id: form.card_id,
      amount: parseFloat(form.amount),
      merchant: form.merchant,
      category_id: form.category_id,
      is_proxy_payment: form.is_proxy_payment,
      proxy_amount: form.is_proxy_payment && form.proxy_amount ? parseFloat(form.proxy_amount) : undefined,
      proxy_note: form.is_proxy_payment ? form.proxy_note || undefined : undefined,
      transaction_date: form.transaction_date,
      notes: form.notes || undefined,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-4 pb-4">
      {/* 選卡 */}
      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-2 block">信用卡</label>
        <div className="flex gap-2">
          {(['yushan', 'fubon', 'dbs'] as CardId[]).map((c) => (
            <button
              key={c}
              onClick={() => setForm({ ...form, card_id: c })}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={form.card_id === c
                ? { backgroundColor: CARD_META[c].color, color: CARD_META[c].textColor }
                : { backgroundColor: 'rgba(13,13,13,0.06)', color: 'rgba(13,13,13,0.4)' }
              }
            >
              {CARD_META[c].name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">金額</label>
          <input
            type="number"
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-[#0D0D0D]/40 mb-1 block">日期</label>
          <input
            type="date"
            className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            value={form.transaction_date}
            onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[#0D0D0D]/40 mb-1 block">店家名稱</label>
        <input
          className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1F5E]/40"
          placeholder="例：麥當勞、全聯"
          value={form.merchant}
          onChange={(e) => setForm({ ...form, merchant: e.target.value })}
        />
      </div>

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

      {/* 代付 */}
      <div className="bg-[#0D0D0D]/3 rounded-xl p-3">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#FF4D1A]"
            checked={form.is_proxy_payment}
            onChange={(e) => setForm({ ...form, is_proxy_payment: e.target.checked })}
          />
          <span className="text-sm font-medium text-[#0D0D0D]/70">這筆有代付</span>
        </label>
        {form.is_proxy_payment && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#0D0D0D]/40 mb-1 block">代付金額</label>
              <input
                type="number"
                className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                placeholder="0"
                value={form.proxy_amount}
                onChange={(e) => setForm({ ...form, proxy_amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-[#0D0D0D]/40 mb-1 block">代付給誰</label>
              <input
                className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                placeholder="例：媽媽"
                value={form.proxy_note}
                onChange={(e) => setForm({ ...form, proxy_note: e.target.value })}
              />
            </div>
          </div>
        )}
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
          disabled={saving || !form.merchant || !form.amount || !form.category_id}
          className="flex-1 py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium disabled:opacity-40"
        >
          {saving ? '儲存中...' : '儲存'}
        </button>
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  const { month, goToPrev, goToNext, isCurrentMonth } = useMonth()
  const { transactions, loading, add, update, remove } = useTransactions({ month })
  const { categories } = useBudgetCategories()
  const [selectedCard, setSelectedCard] = useState<CardId | ''>('')
  const [showAdd, setShowAdd] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const filtered = selectedCard
    ? transactions.filter((t) => t.card_id === selectedCard)
    : transactions

  return (
    <div className="px-4 pt-10 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-[#1A1F5E]">刷卡記錄</h1>
        <div className="flex items-center gap-2">
          <MonthPicker month={month} onPrev={goToPrev} onNext={goToNext} isCurrentMonth={isCurrentMonth} />
          <button
            onClick={() => setShowAdd(true)}
            className="w-8 h-8 rounded-full bg-[#1A1F5E] text-white flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>

      {/* 卡別篩選 */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {[{ id: '', label: '全部' }, { id: 'yushan', label: '玉山' }, { id: 'fubon', label: '富邦' }, { id: 'dbs', label: '星展' }].map(
          (opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedCard(opt.id as CardId | '')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCard === opt.id ? 'bg-[#1A1F5E] text-white' : 'bg-[#0D0D0D]/6 text-[#0D0D0D]/50'}`}
            >
              {opt.label}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((n) => <div key={n} className="h-14 rounded-2xl bg-[#0D0D0D]/4 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-[#0D0D0D]/25">尚無記錄，點右上角新增</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm shadow-[#0D0D0D]/4 divide-y divide-[#0D0D0D]/5"
        >
          {filtered.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setEditTx(tx)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            >
              <span
                className="text-[10px] font-medium px-2 py-1 rounded-lg flex-shrink-0"
                style={{ backgroundColor: CARD_META[tx.card_id].color, color: CARD_META[tx.card_id].textColor }}
              >
                {CARD_META[tx.card_id].name}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0D0D0D] truncate">{tx.merchant}</p>
                <p className="text-[11px] text-[#0D0D0D]/35">
                  {tx.category?.name} · {formatDate(tx.transaction_date)}
                  {tx.is_proxy_payment && tx.proxy_amount && (
                    <span className="text-[#FF4D1A] ml-1">代付 {formatCurrency(tx.proxy_amount)}</span>
                  )}
                </p>
              </div>
              <span className="font-number text-base text-[#0D0D0D] flex-shrink-0">
                -{formatCurrency(tx.amount)}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title="新增刷卡記錄">
        <TransactionForm
          onSave={async (data) => { await add(data) }}
          onClose={() => setShowAdd(false)}
          categories={categories}
        />
      </BottomSheet>

      <BottomSheet open={!!editTx} onClose={() => setEditTx(null)} title="編輯刷卡記錄">
        {editTx && (
          <TransactionForm
            initial={editTx}
            onSave={async (data) => { await update(editTx.id, data) }}
            onDelete={async () => { await remove(editTx.id) }}
            onClose={() => setEditTx(null)}
            categories={categories}
          />
        )}
      </BottomSheet>
    </div>
  )
}
