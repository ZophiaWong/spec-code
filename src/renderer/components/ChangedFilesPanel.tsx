import { useEffect } from 'react'
import { useDiffStore } from '../stores/diff-store'
import { useRunStore } from '../stores/run-store'

export function ChangedFilesPanel() {
  const { changedFiles, selectedFile, loadChangedFiles, selectFile } = useDiffStore()
  const runs = useRunStore((s) => s.runs)
  const latestApplyRun = [...runs].reverse().find((run) => run.mode === 'apply')

  useEffect(() => {
    void loadChangedFiles(latestApplyRun?.id ?? null)
  }, [latestApplyRun?.id, loadChangedFiles])

  return (
    <div className="mb-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2">
        Changed Files
      </div>
      {changedFiles.length === 0 ? (
        <div className="text-[12px] text-text-muted italic py-1">No files changed</div>
      ) : (
        <div className="flex flex-col gap-1">
          {changedFiles.map((file) => (
            <button
              key={file.path}
              type="button"
              onClick={() => selectFile(file.path)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left border-none cursor-pointer ${
                selectedFile === file.path
                  ? 'bg-[#37373d] text-white'
                  : 'bg-transparent text-text-secondary hover:bg-[#2a2d2e]'
              }`}
            >
              <span className={statusClass(file.status)}>{statusShort(file.status)}</span>
              <span className="truncate text-[12px]">{file.path}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function statusShort(status: 'added' | 'modified' | 'deleted'): string {
  if (status === 'added') return 'A'
  if (status === 'deleted') return 'D'
  return 'M'
}

function statusClass(status: 'added' | 'modified' | 'deleted'): string {
  if (status === 'added') return 'text-accent-green text-[11px] font-semibold'
  if (status === 'deleted') return 'text-accent-red text-[11px] font-semibold'
  return 'text-accent-yellow text-[11px] font-semibold'
}
