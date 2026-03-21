import { create } from 'zustand'
import type { RecentProject } from '../../shared/types'

interface ProjectsState {
  projects: RecentProject[]
  loading: boolean
  setProjects: (projects: RecentProject[]) => void
  setLoading: (loading: boolean) => void
  fetchProjects: () => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,
  setProjects: (projects) => set({ projects }),
  setLoading: (loading) => set({ loading }),
  fetchProjects: async () => {
    set({ loading: true })
    const projects = await window.api.listProjects()
    set({ projects, loading: false })
  }
}))
