import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '記帳',
  description: '個人現金流管理',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '記帳' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1,
  userScalable: false, themeColor: '#F8F8F5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#F8F8F5] antialiased">
        <div className="max-w-md mx-auto min-h-dvh relative">{children}</div>
      </body>
    </html>
  )
}
