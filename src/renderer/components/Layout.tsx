import type { ReactNode } from 'react'

interface LayoutProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export function Layout({ left, center, right }: LayoutProps) {
  return (
    <div className="flex h-screen w-screen">
      <aside className="w-1/5 min-w-[180px] border-r border-neutral-800 bg-neutral-950 p-4">
        {left}
      </aside>
      <main className="flex-1 overflow-auto bg-neutral-900 p-6">
        {center}
      </main>
      <aside className="w-1/5 min-w-[180px] border-l border-neutral-800 bg-neutral-950 p-4">
        {right}
      </aside>
    </div>
  )
}
