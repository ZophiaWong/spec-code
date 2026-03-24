import type { RunEventType, RunMode } from '../../shared/types'

export interface StubEvent {
  type: RunEventType
  payload: string
}

const PLAN_SEQUENCE: StubEvent[] = [
  { type: 'agent_message', payload: JSON.stringify({ text: 'Starting plan analysis.' }) },
  { type: 'tool_call', payload: JSON.stringify({ tool: 'read_file', args: { path: 'src/main/agent/run-engine.ts' } }) },
  { type: 'tool_result', payload: JSON.stringify({ tool: 'read_file', result: 'Loaded run engine source.' }) },
  { type: 'tool_call', payload: JSON.stringify({ tool: 'search', args: { query: 'RUN_START and RUN_EVENT usage' } }) },
  { type: 'tool_result', payload: JSON.stringify({ tool: 'search', result: 'Found IPC contracts and UI integration points.' }) },
  {
    type: 'plan_output',
    payload: JSON.stringify({
      steps: [
        {
          title: 'Add mode-aware run model',
          description: 'Extend run types and persistence with mode and plan linkage.',
          affectedFiles: ['src/shared/types.ts', 'src/main/db/runs.ts']
        },
        {
          title: 'Implement approval flow',
          description: 'Create apply runs from approved plans and route risky command approvals.',
          affectedFiles: ['src/main/agent/run-engine.ts', 'src/main/ipc/index.ts']
        },
        {
          title: 'Render review and confirmation UI',
          description: 'Show plan cards, mode badges, and risky command prompts in the chat panel.',
          affectedFiles: ['src/renderer/components/RunEventItem.tsx', 'src/renderer/components/ChatRunView.tsx']
        }
      ]
    })
  },
  { type: 'agent_message', payload: JSON.stringify({ text: 'Plan ready for approval.' }) }
]

const APPLY_SEQUENCE: StubEvent[] = [
  { type: 'agent_message', payload: JSON.stringify({ text: 'Starting apply execution.' }) },
  { type: 'tool_call', payload: JSON.stringify({ tool: 'write_file', args: { path: 'src/main/agent/run-engine.ts' } }) },
  { type: 'tool_result', payload: JSON.stringify({ tool: 'write_file', result: 'Patched run engine successfully.' }) },
  { type: 'tool_call', payload: JSON.stringify({ tool: 'bash', args: { command: 'git reset --hard HEAD~1' } }) },
  {
    type: 'approval_request',
    payload: JSON.stringify({
      tool: 'bash',
      command: 'git reset --hard HEAD~1',
      reason: 'This command can discard local work.'
    })
  },
  { type: 'tool_result', payload: JSON.stringify({ tool: 'bash', result: 'Risky command handled by user decision.' }) },
  { type: 'agent_message', payload: JSON.stringify({ text: 'Apply run completed.' }) }
]

export async function runStubAgent(
  mode: RunMode,
  onEvent: (event: StubEvent) => Promise<void> | void
): Promise<void> {
  const sequence = mode === 'plan' ? PLAN_SEQUENCE : APPLY_SEQUENCE
  for (const event of sequence) {
    await delay(200 + Math.random() * 300)
    await onEvent(event)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
