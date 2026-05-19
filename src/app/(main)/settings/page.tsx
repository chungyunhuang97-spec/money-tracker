'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCardSettings, useBankAccounts, useBudgetCategories } from '@/hooks/useSettings'
import { formatCurrency } from '@/lib/utils'
import { DEPOSIT_COLORS } from '@/types'
import BottomSheet from '@/components/ui/BottomSheet'

export default function SettingsPage() {
  const { cards, update: updateCard } = useCardSettings()
  const { accounts, add: addAccount, remove: removeAccount } = useBankAccounts()
  const { categories, add: addCategory, remove: removeCategory } = useBudgetCategories()

  const [editCard, setEditCard] = useState<string | null>(null)
  const [cardForm, setCardForm] = useState({ credit_limit: '', billing_day: '' })
  const [newBank, setNewBank] = useState('')
  const [newCat, setNewCat] = useState({ name: '', color: DEPOSIT_COLORS[0] })

  return (
    <div className="px-4 pt-10 pb-4">
      <h1 className="text-lg font-medium text-[#1A1F5E] mb-6">設定</h1>

      {/* 信用卡設定 */}
      <section className="mb-6">
        <p className="text-xs font-medium text-[#0D0D0D]/40 tracking-wider uppercase mb-3">信用卡設定</p>
        <div className="space-y-3">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                  <div>
                    <p className="text-sm font-medium text-[#0D0D0D]">{card.name}</p>
                    <p className="text-[11px] text-[#0D0D0D]/35">
                      帳單日：每月 {card.billing_day} 日　額度：{formatCurrency(card.credit_limit)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditCard(card.id)
                    setCardForm({ credit_limit: card.credit_limit.toString(), billing_day: card.billing_day.toString() })
                  }}
                  className="text-xs text-[#1A1F5E] font-medium px-3 py-1.5 rounded-full bg-[#1A1F5E]/8"
                >
                  編輯
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 銀行帳戶 */}
      <section className="mb-6">
        <p className="text-xs font-medium text-[#0D0D0D]/40 tracking-wider uppercase mb-3">銀行帳戶</p>
        <div className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4">
          <div className="space-y-2 mb-3">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-[#0D0D0D]/70">{a.name}</span>
                <button onClick={() => removeAccount(a.id)} className="text-[#0D0D0D]/25">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-[#0D0D0D]/5 pt-3">
            <input
              className="flex-1 bg-[#0D0D0D]/4 rounded-xl px-3 py-2 text-sm focus:outline-none"
              placeholder="新增帳戶名稱"
              value={newBank}
              onChange={(e) => setNewBank(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newBank.trim()) { addAccount(newBank.trim()); setNewBank('') } }}
            />
            <button
              onClick={() => { if (newBank.trim()) { addAccount(newBank.trim()); setNewBank('') } }}
              className="px-3 py-2 rounded-xl bg-[#1A1F5E] text-white text-sm"
            >
              新增
            </button>
          </div>
        </div>
      </section>

      {/* 支出類別 */}
      <section className="mb-6">
        <p className="text-xs font-medium text-[#0D0D0D]/40 tracking-wider uppercase mb-3">支出類別</p>
        <div className="bg-white rounded-2xl p-4 shadow-sm shadow-[#0D0D0D]/4">
          <div className="space-y-2 mb-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm text-[#0D0D0D]/70">{c.name}</span>
                </div>
                <button onClick={() => removeCategory(c.id)} className="text-[#0D0D0D]/25">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-[#0D0D0D]/5 pt-3 space-y-2">
            <input
              className="w-full bg-[#0D0D0D]/4 rounded-xl px-3 py-2 text-sm focus:outline-none"
              placeholder="新類別名稱"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
            />
            <div className="flex gap-2 flex-wrap">
              {DEPOSIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewCat({ ...newCat, color: c })}
                  className={`w-6 h-6 rounded-full transition-transform ${newCat.color === c ? 'scale-125 ring-2 ring-[#0D0D0D]/20 ring-offset-1' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              onClick={() => { if (newCat.name.trim()) { addCategory(newCat.name.trim(), newCat.color); setNewCat({ name: '', color: DEPOSIT_COLORS[0] }) } }}
              className="w-full py-2 rounded-xl bg-[#1A1F5E] text-white text-sm font-medium"
            >
              新增類別
            </button>
          </div>
        </div>
      </section>

      {/* 編輯信用卡 Sheet */}
      <BottomSheet
        open={!!editCard}
        onClose={() => setEditCard(null)}
        title={`編輯 ${cards.find((c) => c.id === editCard)?.name || ''}`}
      >
        <div className="space-y-4 pb-4">
          <div>
            <label className="text-xs text-[#0D0D0D]/40 mb-1 block">信用額度</label>
            <input
              type="number"
              className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              value={cardForm.credit_limit}
              onChange={(e) => setCardForm({ ...cardForm, credit_limit: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[#0D0D0D]/40 mb-1 block">帳單日（每月幾號）</label>
            <input
              type="number"
              className="w-full bg-white border border-[#0D0D0D]/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              min={1}
              max={31}
              value={cardForm.billing_day}
              onChange={(e) => setCardForm({ ...cardForm, billing_day: e.target.value })}
            />
          </div>
          <button
            onClick={async () => {
              if (!editCard || !cardForm.credit_limit || !cardForm.billing_day) return
              await updateCard(editCard, {
                credit_limit: parseFloat(cardForm.credit_limit),
                billing_day: parseInt(cardForm.billing_day),
              })
              setEditCard(null)
            }}
            className="w-full py-3 rounded-2xl bg-[#1A1F5E] text-white text-sm font-medium"
          >
            儲存
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
