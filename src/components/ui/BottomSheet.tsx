'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    // 鎖住 body 捲動，但允許 sheet 內部捲動
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [open])

  // 防止 sheet 內部的 touch 事件冒泡到 body（造成左右滑）
  // 但允許內部 scroll container 上下滑
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    // 如果觸控點在 scroll container 內，且能往那個方向滑，就放行
    const touch = e.touches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    if (scrollEl.contains(target as Node)) {
      // 允許上下滑，阻止左右滑
      e.stopPropagation()
    } else {
      e.preventDefault()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Sheet 本體 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onTouchMove={handleSheetTouchMove}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#F8F8F5] rounded-t-3xl max-w-md mx-auto"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[#0D0D0D]/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-[#0D0D0D]/6">
              <h2 className="text-base font-medium text-[#0D0D0D]">{title}</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#0D0D0D]/6 flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* 可捲動的內容區 — ref 掛在這裡 */}
            <div
              ref={scrollRef}
              className="px-5 pt-4 overflow-y-auto overscroll-contain"
              style={{ maxHeight: '70dvh', WebkitOverflowScrolling: 'touch' }}
            >
              {children}
              {/* 底部 padding，防止內容被 safe area 擋住 */}
              <div className="h-2" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
