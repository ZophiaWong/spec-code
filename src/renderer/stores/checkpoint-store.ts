import { create } from 'zustand'
import type { Checkpoint } from '../../shared/types'

interface CheckpointState {
  checkpoints: Checkpoint[]
  loading: boolean
  fetchCheckpoints: (sessionId: string | null) => Promise<void>
  rewind: (checkpointId: string) => Promise<{ success: true } | { error: string }>
  clear: () => void
}

export const useCheckpointStore = create<CheckpointState>((set) => ({
  checkpoints: [],
  loading: false,

  fetchCheckpoints: async (sessionId) => {
    if (!sessionId) {
      set({ checkpoints: [], loading: false })
      return
    }
    set({ loading: true })
    const checkpoints = await window.api.listCheckpoints(sessionId)
    set({ checkpoints, loading: false })
  },

  rewind: async (checkpointId) => {
    const result = await window.api.rewindCheckpoint(checkpointId)
    if ('error' in result) return result
    return { success: true }
  },

  clear: () => set({ checkpoints: [], loading: false })
}))
