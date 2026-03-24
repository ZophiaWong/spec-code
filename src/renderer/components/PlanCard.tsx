import type { PlanStep } from '../../shared/types'

interface PlanCardProps {
  steps: PlanStep[]
  canApprove: boolean
  onApprove: () => void
}

export function PlanCard({ steps, canApprove, onApprove }: PlanCardProps) {
  return (
    <div className="mx-3 my-2 p-3 rounded border border-border bg-[#222425]">
      <div className="text-[12px] font-semibold text-text-primary mb-2">Execution Plan</div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="text-[12px] text-text-secondary">
            <div className="text-text-primary">
              {index + 1}. {step.title}
            </div>
            <div className="mt-0.5">{step.description}</div>
            <div className="mt-1 text-[11px] text-text-muted">
              Files: {step.affectedFiles.length > 0 ? step.affectedFiles.join(', ') : 'None'}
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onApprove}
        disabled={!canApprove}
        className="mt-3 px-3 py-1.5 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer disabled:opacity-50 disabled:cursor-default"
      >
        Approve & Apply
      </button>
    </div>
  )
}
