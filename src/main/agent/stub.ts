import type { RunEventType } from '../../shared/types'

export interface StubEvent {
  type: RunEventType
  payload: string
}

const STUB_SEQUENCE: StubEvent[] = [
  { type: 'agent_message', payload: JSON.stringify({ text: 'I\'ll analyze your request and work on it.' }) },
  { type: 'tool_call', payload: JSON.stringify({ tool: 'read_file', args: { path: 'src/index.ts' } }) },
  { type: 'tool_result', payload: JSON.stringify({ tool: 'read_file', result: 'File contents: export function main() { ... }' }) },
  { type: 'tool_call', payload: JSON.stringify({ tool: 'search', args: { query: 'relevant code' } }) },
  { type: 'tool_result', payload: JSON.stringify({ tool: 'search', result: 'Found 3 matches in src/' }) },
  { type: 'agent_message', payload: JSON.stringify({ text: 'I\'ve reviewed the code. Here\'s what I found and the changes I\'d suggest.' }) }
]

export async function runStubAgent(onEvent: (event: StubEvent) => void): Promise<void> {
  for (const event of STUB_SEQUENCE) {
    await delay(200 + Math.random() * 300)
    onEvent(event)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
