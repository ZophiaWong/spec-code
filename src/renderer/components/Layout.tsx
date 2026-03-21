import type { ReactNode } from 'react'

interface LayoutProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export function Layout({ left, center, right }: LayoutProps) {
  return (
    <div className="flex w-screen h-screen">
      <div className="w-60 min-w-[180px] h-full bg-sidebar border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#bbbbbb] bg-sidebar border-b border-border">
          Explorer
        </div>
        <div className="flex-1 p-3 overflow-y-auto">{left}</div>
      </div>

      <div className="flex-1 h-full bg-editor flex flex-col overflow-hidden">
        <div className="h-[35px] bg-sidebar border-b border-border flex items-center pl-3">
          <div className="px-4 py-1.5 text-[13px] text-white bg-editor border-t border-accent-blue border-r border-r-border -mb-px">
            Workspace
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">{center}</div>
      </div>

      <div className="w-70 min-w-[180px] h-full bg-sidebar border-l border-border flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#bbbbbb] bg-sidebar border-b border-border">
          Panel
        </div>
        <div className="flex-1 p-3 overflow-y-auto">{right}</div>
      </div>
    </div>
  )
}
