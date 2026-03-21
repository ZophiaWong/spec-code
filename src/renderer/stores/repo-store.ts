import { create } from 'zustand'
import type { RepoInfo } from '../../shared/types'

interface RepoState {
  repo: RepoInfo | null
  setRepo: (repo: RepoInfo | null) => void
}

export const useRepoStore = create<RepoState>((set) => ({
  repo: null,
  setRepo: (repo) => set({ repo })
}))
