import { create } from 'zustand'
import type { ChangedFile } from '../../shared/types'

interface DiffState {
  changedFiles: ChangedFile[]
  selectedFile: string | null
  selectedRunId: string | null
  diffContent: string
  loading: boolean
  loadChangedFiles: (runId: string | null) => Promise<void>
  upsertChangedFile: (runId: string, file: ChangedFile) => void
  selectFile: (filePath: string | null) => void
  loadDiffContent: () => Promise<void>
  clear: () => void
}

export const useDiffStore = create<DiffState>((set, get) => ({
  changedFiles: [],
  selectedFile: null,
  selectedRunId: null,
  diffContent: '',
  loading: false,

  loadChangedFiles: async (runId) => {
    if (!runId) {
      set({ changedFiles: [], selectedFile: null, selectedRunId: null, diffContent: '', loading: false })
      return
    }

    set({ loading: true, selectedRunId: runId })
    const changedFiles = await window.api.getChangedFiles(runId)
    set((state) => {
      const selectedFile = state.selectedFile && changedFiles.some((f) => f.path === state.selectedFile)
        ? state.selectedFile
        : null
      return { changedFiles, selectedFile, loading: false, diffContent: selectedFile ? state.diffContent : '' }
    })
  },

  upsertChangedFile: (runId, file) => {
    set((state) => {
      if (state.selectedRunId !== runId) {
        return state
      }
      const existingIndex = state.changedFiles.findIndex((entry) => entry.path === file.path)
      if (existingIndex === -1) {
        return { changedFiles: [...state.changedFiles, file] }
      }
      const updated = [...state.changedFiles]
      updated[existingIndex] = file
      return { changedFiles: updated }
    })
  },

  selectFile: (filePath) => {
    set({ selectedFile: filePath, diffContent: '' })
  },

  loadDiffContent: async () => {
    const { selectedRunId, selectedFile } = get()
    if (!selectedRunId || !selectedFile) {
      set({ diffContent: '' })
      return
    }

    set({ loading: true })
    const result = await window.api.getFileDiff(selectedRunId, selectedFile)
    if ('error' in result) {
      set({ diffContent: `Failed to load diff: ${result.error}`, loading: false })
      return
    }
    set({ diffContent: result.content, loading: false })
  },

  clear: () => set({ changedFiles: [], selectedFile: null, selectedRunId: null, diffContent: '', loading: false })
}))
