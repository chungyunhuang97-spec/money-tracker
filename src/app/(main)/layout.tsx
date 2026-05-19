import TabBar from '@/components/layout/TabBar'

export const dynamic = 'force-dynamic'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-24">{children}</main>
      <TabBar />
    </>
  )
}
