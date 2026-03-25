import { useEffect } from 'react'
import { useRepoStore } from './stores/repo-store'
import { useSessionStore } from './stores/session-store'
import { useRunStore } from './stores/run-store'
import { useSpecStore } from './stores/spec-store'
import { useDiffStore } from './stores/diff-store'
import { useCheckpointStore } from './stores/checkpoint-store'
import { WelcomePage } from './pages/WelcomePage'
import { WorkspacePage } from './pages/WorkspacePage'

export function App() {
  const repo = useRepoStore((s) => s.repo)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const fetchSessions = useSessionStore((s) => s.fetchSessions)
  const clearSessions = useSessionStore((s) => s.clear)
  const clearRuns = useRunStore((s) => s.clear)
  const appendVerifyResult = useRunStore((s) => s.appendVerifyResult)
  const loadSpecs = useSpecStore((s) => s.loadSpecs)
  const loadChanges = useSpecStore((s) => s.loadChanges)
  const clearSpecData = useSpecStore((s) => s.clearData)
  const loadChangedFiles = useDiffStore((s) => s.loadChangedFiles)
  const clearDiff = useDiffStore((s) => s.clear)
  const fetchCheckpoints = useCheckpointStore((s) => s.fetchCheckpoints)
  const clearCheckpoints = useCheckpointStore((s) => s.clear)

  useEffect(() => {
    if (repo) {
      fetchSessions(repo.path)
      loadSpecs(repo.path)
      loadChanges(repo.path)
    } else {
      clearSessions()
      clearRuns()
      clearSpecData()
      clearDiff()
      clearCheckpoints()
    }
  }, [
    repo,
    fetchSessions,
    clearSessions,
    clearRuns,
    loadSpecs,
    loadChanges,
    clearSpecData,
    clearDiff,
    clearCheckpoints
  ])

  useEffect(() => {
    if (!repo) return

    const handleFocus = () => {
      loadSpecs(repo.path)
      loadChanges(repo.path)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [repo, loadSpecs, loadChanges])

  useEffect(() => {
    const offDiff = window.api.onDiffFilesUpdated(({ runId }) => {
      void loadChangedFiles(runId)
    })
    const offVerify = window.api.onVerifyResult((result) => {
      appendVerifyResult(result)
    })
    const offCheckpoints = window.api.onCheckpointUpdated(({ sessionId }) => {
      if (sessionId !== activeSessionId) return
      void fetchCheckpoints(sessionId)
    })

    return () => {
      offDiff()
      offVerify()
      offCheckpoints()
    }
  }, [activeSessionId, appendVerifyResult, fetchCheckpoints, loadChangedFiles])

  if (!repo) {
    return <WelcomePage />
  }

  return <WorkspacePage />
}
