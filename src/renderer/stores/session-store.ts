import { create } from 'zustand'
import type { Session } from '../../shared/types'

interface SessionState {
  sessions: Session[]
  activeSessionId: string | null
  loading: boolean
  setActiveSession: (id: string | null) => void
  fetchSessions: (repoPath: string) => Promise<void>
  createSession: (repoPath: string, title?: string) => Promise<Session>
  forkSession: (sessionId: string) => Promise<Session>
  clear: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  loading: false,

  setActiveSession: (id) => set({ activeSessionId: id }),

  fetchSessions: async (repoPath) => {
    set({ loading: true })
    const sessions = await window.api.listSessions(repoPath)
    set({ sessions, loading: false })
  },

  createSession: async (repoPath, title?) => {
    const session = await window.api.createSession(repoPath, title)
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session.id
    }))
    return session
  },

  forkSession: async (sessionId) => {
    const session = await window.api.forkSession(sessionId)
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session.id
    }))
    return session
  },

  clear: () => set({ sessions: [], activeSessionId: null, loading: false })
}))
