import { useEffect, useState } from 'react'
import { useCheckpointStore } from '../stores/checkpoint-store'
import { useSessionStore } from '../stores/session-store'
import { useRunStore } from '../stores/run-store'
import { useDiffStore } from '../stores/diff-store'

export function CheckpointList() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const { checkpoints, loading, fetchCheckpoints, rewind } = useCheckpointStore()
  const runs = useRunStore((s) => s.runs)
  const loadChangedFiles = useDiffStore((s) => s.loadChangedFiles)
  const [busyId, setBusyId] = useState<string | null>(null)

  const isRunActive = runs.some((run) => run.status === 'running')
  const latestApplyRun = [...runs].reverse().find((run) => run.mode === 'apply')

  useEffect(() => {
    void fetchCheckpoints(activeSessionId)
  }, [activeSessionId, fetchCheckpoints])

  const handleRewind = async (checkpointId: string, timestamp: string) => {
    const confirmed = window.confirm(
      `Rewind to checkpoint from ${new Date(timestamp).toLocaleString()}? Current uncommitted changes will be overwritten.`
    )
    if (!confirmed) return

    setBusyId(checkpointId)
    const result = await rewind(checkpointId)
    if ('error' in result) {
      window.alert(result.error)
      setBusyId(null)
      return
    }

    await fetchCheckpoints(activeSessionId)
    await loadChangedFiles(latestApplyRun?.id ?? null)
    setBusyId(null)
  }

  return (
    <div className="mb-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2">
        Checkpoints
      </div>
      {loading && <div className="text-[12px] text-text-secondary">Loading checkpoints...</div>}
      {!loading && checkpoints.length === 0 && (
        <div className="text-[12px] text-text-muted italic py-1">No checkpoints yet</div>
      )}
      <div className="flex flex-col gap-1">
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint.id} className="bg-titlebar border border-border rounded p-2">
            <div className="text-[12px] text-text-primary truncate">{checkpoint.runPrompt || checkpoint.runId}</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {new Date(checkpoint.createdAt).toLocaleString()}
            </div>
            <button
              type="button"
              onClick={() => handleRewind(checkpoint.id, checkpoint.createdAt)}
              disabled={isRunActive || busyId === checkpoint.id}
              className="mt-2 px-2 py-1 text-[11px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer disabled:opacity-50"
            >
              Rewind
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
