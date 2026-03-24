import type { RunMode, RunStatus } from '../../shared/types'
import { ModeBadge } from './ModeBadge'

interface RunStatusIndicatorProps {
  status: RunStatus
  mode: RunMode
}

export function RunStatusIndicator({ status, mode }: RunStatusIndicatorProps) {
  if (status === 'running') {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-[12px] text-accent-blue">
        <ModeBadge mode={mode} />
        <span className="inline-block w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        Running...
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-[12px] text-accent-green">
        <ModeBadge mode={mode} />
        Completed
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-[12px] text-red-400">
        <ModeBadge mode={mode} />
        Failed
      </div>
    )
  }

  return null
}
