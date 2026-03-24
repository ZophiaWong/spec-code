import { useEffect } from 'react'
import { useRepoStore } from './stores/repo-store'
import { useSessionStore } from './stores/session-store'
import { useRunStore } from './stores/run-store'
import { useSpecStore } from './stores/spec-store'
import { WelcomePage } from './pages/WelcomePage'
import { WorkspacePage } from './pages/WorkspacePage'

export function App() {
  const repo = useRepoStore((s) => s.repo)
  const fetchSessions = useSessionStore((s) => s.fetchSessions)
  const clearSessions = useSessionStore((s) => s.clear)
  const clearRuns = useRunStore((s) => s.clear)
  const loadSpecs = useSpecStore((s) => s.loadSpecs)
  const loadChanges = useSpecStore((s) => s.loadChanges)
  const clearSpecData = useSpecStore((s) => s.clearData)

  useEffect(() => {
    if (repo) {
      fetchSessions(repo.path)
      loadSpecs(repo.path)
      loadChanges(repo.path)
    } else {
      clearSessions()
      clearRuns()
      clearSpecData()
    }
  }, [repo, fetchSessions, clearSessions, clearRuns, loadSpecs, loadChanges, clearSpecData])

  useEffect(() => {
    if (!repo) return

    const handleFocus = () => {
      loadSpecs(repo.path)
      loadChanges(repo.path)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [repo, loadSpecs, loadChanges])

  if (!repo) {
    return <WelcomePage />
  }

  return <WorkspacePage />
}
