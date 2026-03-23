import { create } from 'zustand'
import type { Run, RunEvent } from '../../shared/types'

interface RunState {
  runs: Run[]
  liveEvents: RunEvent[]
  loading: boolean
  fetchRuns: (sessionId: string) => Promise<void>
  loadRunEvents: (runId: string) => Promise<RunEvent[]>
  startRun: (sessionId: string, prompt: string) => Promise<Run | { error: string }>
  appendEvent: (event: RunEvent) => void
  handleStatusChange: (runId: string, status: 'completed' | 'failed') => void
  clear: () => void
}

export const useRunStore = create<RunState>((set, get) => ({
  runs: [],
  liveEvents: [],
  loading: false,

  fetchRuns: async (sessionId) => {
    set({ loading: true })
    const runs = await window.api.listRuns(sessionId)
    set({ runs, liveEvents: [], loading: false })
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

  appendEvent: (event) => {
    set((state) => ({
      liveEvents: [...state.liveEvents, event]
    }))
  },

  handleStatusChange: (runId, status) => {
    set((state) => ({
      runs: state.runs.map((r) =>
        r.id === runId ? { ...r, status, finishedAt: new Date().toISOString() } : r
      )
    }))
  },

  clear: () => set({ runs: [], liveEvents: [], loading: false })
}))
