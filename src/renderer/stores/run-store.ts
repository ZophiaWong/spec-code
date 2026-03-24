import { create } from 'zustand'
import type { Run, RunEvent, PlanOutput } from '../../shared/types'

export interface PendingApprovalRequest {
  runId: string
  command: string
  reason?: string
}

interface RunState {
  runs: Run[]
  liveEvents: RunEvent[]
  planOutputs: Record<string, PlanOutput>
  pendingApprovals: Record<string, PendingApprovalRequest>
  loading: boolean
  fetchRuns: (sessionId: string) => Promise<void>
  loadRunEvents: (runId: string) => Promise<RunEvent[]>
  startRun: (sessionId: string, prompt: string) => Promise<Run | { error: string }>
  approveRun: (planRunId: string) => Promise<Run | { error: string }>
  confirmRisky: (runId: string, approved: boolean) => Promise<void>
  appendEvent: (event: RunEvent) => void
  handleStatusChange: (runId: string, status: 'completed' | 'failed') => void
  clear: () => void
}

export const useRunStore = create<RunState>((set, get) => ({
  runs: [],
  liveEvents: [],
  planOutputs: {},
  pendingApprovals: {},
  loading: false,

  fetchRuns: async (sessionId) => {
    set({ loading: true })
    const runs = await window.api.listRuns(sessionId)
    set({ runs, liveEvents: [], planOutputs: {}, pendingApprovals: {}, loading: false })
  },

  loadRunEvents: async (runId) => {
    return window.api.getRunEvents(runId)
  },

  startRun: async (sessionId, prompt) => {
    const result = await window.api.startRun(sessionId, prompt)
    if ('error' in result) return result
    set((state) => ({
      runs: [...state.runs, result],
      liveEvents: []
    }))
    return result
  },

  approveRun: async (planRunId) => {
    const result = await window.api.approveRun(planRunId)
    if ('error' in result) return result
    set((state) => ({
      runs: [...state.runs, result],
      liveEvents: []
    }))
    return result
  },

  confirmRisky: async (runId, approved) => {
    await window.api.confirmRisky(runId, approved)
    set((state) => {
      const next = { ...state.pendingApprovals }
      delete next[runId]
      return { pendingApprovals: next }
    })
  },

  appendEvent: (event) => {
    set((state) => {
      const nextState: Partial<RunState> = {
        liveEvents: [...state.liveEvents, event]
      }

      if (event.type === 'plan_output') {
        try {
          const parsed = JSON.parse(event.payload)
          nextState.planOutputs = {
            ...state.planOutputs,
            [event.runId]: { steps: Array.isArray(parsed.steps) ? parsed.steps : [] }
          }
        } catch {
          // Ignore malformed payloads from stub/IPC.
        }
      }

      if (event.type === 'approval_request') {
        try {
          const parsed = JSON.parse(event.payload)
          nextState.pendingApprovals = {
            ...state.pendingApprovals,
            [event.runId]: {
              runId: event.runId,
              command: parsed.command ?? '',
              reason: parsed.reason
            }
          }
        } catch {
          // Ignore malformed payloads from stub/IPC.
        }
      }

      return nextState as RunState
    })
  },

  handleStatusChange: (runId, status) => {
    set((state) => ({
      runs: state.runs.map((r) =>
        r.id === runId ? { ...r, status, finishedAt: new Date().toISOString() } : r
      )
    }))
  },

  clear: () => set({ runs: [], liveEvents: [], planOutputs: {}, pendingApprovals: {}, loading: false })
}))
