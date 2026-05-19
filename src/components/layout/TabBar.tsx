'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── 總覽中心按鈕（SVG 動畫版）────────────────────────────────
function DashboardButton({ isActive }: { isActive: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="relative flex flex-col items-center justify-end pb-2 flex-1"
      style={{ marginTop: '-20px' }}
    >
      {/* 圓形主體 */}
      <div
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
          isActive
            ? 'bg-[#1A1F5E] shadow-[#1A1F5E]/40'
            : 'bg-[#1A1F5E]/80 shadow-[#1A1F5E]/20'
        )}
      >
        {/* SVG 動畫 icon — 脈衝圓圈 + 中心點 */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          {/* 外圈脈衝（active 時播放） */}
          {isActive && (
            <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1" strokeOpacity="0.4">
              <animate attributeName="r" from="8" to="13" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}
          {/* 中간 사각형 grid */}
          <rect x="7" y="7" width="5.5" height="5.5" rx="1" fill="white" fillOpacity={isActive ? 1 : 0.6} />
          <rect x="15.5" y="7" width="5.5" height="5.5" rx="1" fill="white" fillOpacity={isActive ? 1 : 0.6} />
          <rect x="7" y="15.5" width="5.5" height="5.5" rx="1" fill="white" fillOpacity={isActive ? 1 : 0.6} />
          <rect x="15.5" y="15.5" width="5.5" height="5.5" rx="1" fill="white" fillOpacity={isActive ? 1 : 0.6}>
            {isActive && (
              <animate attributeName="fill-opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            )}
          </rect>
        </svg>
      </div>
      <span className={cn(
        'text-[9px] tracking-wide font-medium mt-1',
        isActive ? 'text-[#1A1F5E]' : 'text-[#0D0D0D]/30'
      )}>
        總覽
      </span>
    </Link>
  )
}

// ─── 一般 Tab ────────────────────────────────────────────────
const sideTabs = [
  {
    href: '/transactions',
    label: '刷卡記錄',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20"/>
      </svg>
    ),
  },
  {
    href: '/budget',
    label: '支出細項',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    href: '/savings',
    label: '儲蓄目標',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12h4l2-4"/>
        <path d="M12 8v4"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: '設定',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
]

export default function TabBar() {
  const pathname = usePathname()

  // 左側兩個 + 中間總覽 + 右側兩個
  const left = sideTabs.slice(0, 2)
  const right = sideTabs.slice(2, 4)

  return (
    <nav className="tab-bar">
      {/* 總覽凸出的缺口背景 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#F8F8F5] rounded-t-full" />
      <div className="flex items-end">
        {/* 左側 */}
        {left.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-all duration-200',
                isActive ? 'text-[#1A1F5E]' : 'text-[#0D0D0D]/30'
              )}
            >
              <div className={cn('transition-transform duration-200', isActive && 'scale-110')}>
                {tab.icon}
              </div>
              <span className={cn(
                'text-[9px] tracking-wide font-medium',
                isActive ? 'opacity-100' : 'opacity-50'
              )}>
                {tab.label}
              </span>
            </Link>
          )
        })}

        {/* 中間：總覽 */}
        <DashboardButton isActive={pathname === '/dashboard'} />

        {/* 右側 */}
        {right.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-all duration-200',
                isActive ? 'text-[#1A1F5E]' : 'text-[#0D0D0D]/30'
              )}
            >
              <div className={cn('transition-transform duration-200', isActive && 'scale-110')}>
                {tab.icon}
              </div>
              <span className={cn(
                'text-[9px] tracking-wide font-medium',
                isActive ? 'opacity-100' : 'opacity-50'
              )}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
