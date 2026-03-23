import { useEffect } from 'react'
import { useRepoStore } from './stores/repo-store'
import { useSessionStore } from './stores/session-store'
import { useRunStore } from './stores/run-store'
import { WelcomePage } from './pages/WelcomePage'
import { WorkspacePage } from './pages/WorkspacePage'

export function App() {
  const repo = useRepoStore((s) => s.repo)
  const fetchSessions = useSessionStore((s) => s.fetchSessions)
  const clearSessions = useSessionStore((s) => s.clear)
  const clearRuns = useRunStore((s) => s.clear)

  useEffect(() => {
    if (repo) {
      fetchSessions(repo.path)
    } else {
      clearSessions()
      clearRuns()
    }
  }, [repo, fetchSessions, clearSessions, clearRuns])

  if (!repo) {
    return <WelcomePage />
  }

  return <WorkspacePage />
}
