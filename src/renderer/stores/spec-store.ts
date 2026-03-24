import { create } from 'zustand'
import type { ChangeSummary, SpecSummary } from '../../shared/types'

export type ActiveView =
  | { view: 'repo-info' }
  | { view: 'session'; sessionId: string }
  | { view: 'spec-detail'; specName: string }
  | { view: 'change-detail'; changeName: string }

interface SpecState {
  specs: SpecSummary[]
  changes: ChangeSummary[]
  activeView: ActiveView
  loadingSpecs: boolean
  loadingChanges: boolean
  specsError: string | null
  changesError: string | null
  loadSpecs: (repoPath: string) => Promise<void>
  loadChanges: (repoPath: string) => Promise<void>
  selectSpec: (specName: string) => void
  selectChange: (changeName: string) => void
  setSessionView: (sessionId: string | null) => void
  clearSelection: () => void
  clearData: () => void
}

export const useSpecStore = create<SpecState>((set) => ({
  specs: [],
  changes: [],
  activeView: { view: 'repo-info' },
  loadingSpecs: false,
  loadingChanges: false,
  specsError: null,
  changesError: null,

  loadSpecs: async (repoPath) => {
    set({ loadingSpecs: true, specsError: null })
    const result = await window.api.listSpecs(repoPath)
    if (isErrorResult(result)) {
      set({ specs: [], loadingSpecs: false, specsError: result.error })
      return
    }
    set({ specs: result, loadingSpecs: false, specsError: null })
  },

  loadChanges: async (repoPath) => {
    set({ loadingChanges: true, changesError: null })
    const result = await window.api.listChanges(repoPath)
    if (isErrorResult(result)) {
      set({ changes: [], loadingChanges: false, changesError: result.error })
      return
    }
    set({ changes: result, loadingChanges: false, changesError: null })
  },

  selectSpec: (specName) => {
    set({ activeView: { view: 'spec-detail', specName } })
  },

  selectChange: (changeName) => {
    set({ activeView: { view: 'change-detail', changeName } })
  },

  setSessionView: (sessionId) => {
    if (!sessionId) {
      set({ activeView: { view: 'repo-info' } })
      return
    }
    set({ activeView: { view: 'session', sessionId } })
  },

  clearSelection: () => {
    set({ activeView: { view: 'repo-info' } })
  },

  clearData: () => {
    set({
      specs: [],
      changes: [],
      activeView: { view: 'repo-info' },
      loadingSpecs: false,
      loadingChanges: false,
      specsError: null,
      changesError: null
    })
  }
}))

function isErrorResult<T>(value: T | { error: string }): value is { error: string } {
  return typeof value === 'object' && value !== null && 'error' in value
}
