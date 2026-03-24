import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChangeSummary } from '../../shared/types'
import { useRunStore } from '../stores/run-store'
import { useSessionStore } from '../stores/session-store'
import { useSpecStore } from '../stores/spec-store'

interface ChangeDetailProps {
  repoPath: string
  change: ChangeSummary
}

export function ChangeDetail({ repoPath, change }: ChangeDetailProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [contents, setContents] = useState<Record<string, string>>({})
  const [loadingPath, setLoadingPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startingPlan, setStartingPlan] = useState(false)

  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const createSession = useSessionStore((s) => s.createSession)
  const setActiveSession = useSessionStore((s) => s.setActiveSession)
  const startRun = useRunStore((s) => s.startRun)
  const setSessionView = useSpecStore((s) => s.setSessionView)

  const tasksArtifact = change.artifacts.find((artifact) => artifact.path === 'tasks.md')
  const canStartPlan = tasksArtifact?.status === 'done'

  const handleToggleArtifact = async (artifactPath: string, artifactStatus: string) => {
    if (artifactStatus !== 'done') return

    const nextExpanded = !expanded[artifactPath]
    setExpanded((prev) => ({ ...prev, [artifactPath]: nextExpanded }))
    if (!nextExpanded || contents[artifactPath]) return

    setLoadingPath(artifactPath)
    setError(null)
    const result = await window.api.readChangeArtifact(repoPath, change.name, artifactPath)
    if ('error' in result) {
      setError(result.error)
    } else {
      setContents((prev) => ({ ...prev, [artifactPath]: result.content }))
    }
    setLoadingPath(null)
  }

  const handleStartPlan = async () => {
    if (!tasksArtifact) return

    setStartingPlan(true)
    setError(null)

    const tasksResult = await window.api.readChangeArtifact(repoPath, change.name, tasksArtifact.path)
    if ('error' in tasksResult) {
      setError(tasksResult.error)
      setStartingPlan(false)
      return
    }

    let sessionId = activeSessionId
    if (!sessionId) {
      const session = await createSession(repoPath, `Plan: ${change.name}`)
      sessionId = session.id
    }

    const prompt = `Apply OpenSpec change "${change.name}".\n\nUse this tasks context:\n\n${tasksResult.content}`
    const runResult = await startRun(sessionId, prompt)
    if ('error' in runResult) {
      setError(runResult.error)
      setStartingPlan(false)
      return
    }

    setActiveSession(sessionId)
    setSessionView(sessionId)
    setStartingPlan(false)
  }

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-normal text-white mb-1">Change: {change.name}</h1>
          <div className="text-[12px] text-text-muted">Schema: {change.schema} • Status: {change.status}</div>
        </div>
        {canStartPlan && (
          <button
            onClick={handleStartPlan}
            disabled={startingPlan}
            className="px-3 py-1.5 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer disabled:opacity-60"
          >
            {startingPlan ? 'Starting...' : 'Start Plan'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-error-bg border border-error-border rounded text-[13px] text-error-text">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {change.artifacts.map((artifact) => {
          const isExpanded = !!expanded[artifact.path]
          const isLoading = loadingPath === artifact.path
          const isDone = artifact.status === 'done'

          return (
            <div key={artifact.path} className="bg-sidebar border border-border rounded overflow-hidden">
              <button
                onClick={() => handleToggleArtifact(artifact.path, artifact.status)}
                disabled={!isDone}
                className="w-full text-left px-3 py-2 bg-transparent border-none cursor-pointer disabled:cursor-default disabled:opacity-65"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] text-text-primary font-mono">{artifact.id}</div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      artifact.status === 'done'
                        ? 'bg-[#224d31] text-[#b5f3c8]'
                        : artifact.status === 'blocked'
                          ? 'bg-[#5a1d1d] text-[#f48771]'
                          : 'bg-titlebar text-text-secondary'
                    }`}
                  >
                    {artifact.status}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-3 py-3">
                  {isLoading && <div className="text-[13px] text-text-secondary">Loading artifact...</div>}
                  {!isLoading && contents[artifact.path] && (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contents[artifact.path]}</ReactMarkdown>
                    </div>
                  )}
                  {!isLoading && !contents[artifact.path] && isDone && (
                    <div className="text-[13px] text-text-secondary">Artifact is empty.</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
