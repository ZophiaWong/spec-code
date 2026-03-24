import type { RunMode } from '../../shared/types'

interface ModeBadgeProps {
  mode: RunMode
}

export function ModeBadge({ mode }: ModeBadgeProps) {
  const isPlan = mode === 'plan'
  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${
        isPlan
          ? 'text-accent-blue border-accent-blue/50 bg-[#10324a]'
          : 'text-accent-green border-accent-green/50 bg-[#14352f]'
      }`}
    >
      {isPlan ? 'Plan' : 'Apply'}
    </span>
  )
}
