import type { RunStatus } from '../../shared/types'

interface RunStatusIndicatorProps {
  status: RunStatus
}

export function RunStatusIndicator({ status }: RunStatusIndicatorProps) {
  if (status === 'running') {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-[12px] text-accent-blue">
        <span className="inline-block w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        Running...
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="py-2 px-3 text-[12px] text-accent-green">
        Completed
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="py-2 px-3 text-[12px] text-red-400">
        Failed
      </div>
    )
  }

  return null
}
