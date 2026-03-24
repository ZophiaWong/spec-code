import { useState } from 'react'
import type { RunEvent } from '../../shared/types'
import { PlanCard } from './PlanCard'
import { ApprovalPrompt } from './ApprovalPrompt'

interface RunEventItemProps {
  event: RunEvent
  canApprovePlan?: boolean
  onApprovePlan?: (runId: string) => void
  onConfirmRisky?: (runId: string, approved: boolean) => void
}

export function RunEventItem({
  event,
  canApprovePlan = false,
  onApprovePlan,
  onConfirmRisky
}: RunEventItemProps) {
  const [expanded, setExpanded] = useState(false)

  const parsed = (() => {
    try {
      return JSON.parse(event.payload)
    } catch {
      return { text: event.payload }
    }
  })()

  if (event.type === 'agent_message') {
    return (
      <div className="py-2 px-3 text-[13px] text-text-primary">
        {parsed.text}
      </div>
    )
  }

  if (event.type === 'tool_call') {
    return (
      <div
        className="py-1 px-3 text-[12px] text-text-secondary cursor-pointer hover:bg-[#2a2d2e] rounded"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[9px] mr-1">{expanded ? '\u25BC' : '\u25B6'}</span>
        <span className="text-accent-yellow">{parsed.tool}</span>
        <span className="text-text-muted ml-1">
          ({typeof parsed.args === 'object' ? Object.keys(parsed.args).join(', ') : '...'})
        </span>
        {expanded && (
          <pre className="mt-1 p-2 bg-[#1e1e1e] rounded text-[11px] text-text-muted overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(parsed.args, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  if (event.type === 'tool_result') {
    return (
      <div
        className="py-1 px-3 pl-6 text-[11px] text-text-muted cursor-pointer hover:bg-[#2a2d2e] rounded"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[9px] mr-1">{expanded ? '\u25BC' : '\u25B6'}</span>
        <span className="text-accent-green">result</span>
        {expanded && (
          <pre className="mt-1 p-2 bg-[#1e1e1e] rounded text-[11px] text-text-muted overflow-x-auto whitespace-pre-wrap">
            {parsed.result || JSON.stringify(parsed, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  if (event.type === 'error') {
    return (
      <div className="py-2 px-3 text-[13px] text-red-400">
        Error: {parsed.message || parsed.text || event.payload}
      </div>
    )
  }

  if (event.type === 'plan_output') {
    const steps = Array.isArray(parsed.steps) ? parsed.steps : []
    return (
      <PlanCard
        steps={steps}
        canApprove={canApprovePlan}
        onApprove={() => onApprovePlan?.(event.runId)}
      />
    )
  }

  if (event.type === 'approval_request') {
    return (
      <ApprovalPrompt
        command={parsed.command || '(unknown command)'}
        reason={parsed.reason}
        onConfirm={() => onConfirmRisky?.(event.runId, true)}
        onReject={() => onConfirmRisky?.(event.runId, false)}
      />
    )
  }

  return null
}
