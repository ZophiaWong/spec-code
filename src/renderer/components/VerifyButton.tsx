import { useState } from 'react'
import { useRepoStore } from '../stores/repo-store'
import { useRunStore } from '../stores/run-store'

interface VerifyButtonProps {
  onNoCommands: () => void
}

export function VerifyButton({ onNoCommands }: VerifyButtonProps) {
  const repo = useRepoStore((s) => s.repo)
  const runs = useRunStore((s) => s.runs)
  const [runningVerify, setRunningVerify] = useState(false)

  const runActive = runs.some((run) => run.status === 'running')
  const disabled = runActive || runningVerify || !repo

  const handleVerify = async () => {
    if (!repo || disabled) return
    const config = await window.api.getVerifyConfig(repo.path)
    if ('error' in config || config.commands.length === 0) {
      onNoCommands()
      return
    }

    setRunningVerify(true)
    const result = await window.api.runVerify(repo.path)
    if ('error' in result) {
      window.alert(result.error)
    }
    setRunningVerify(false)
  }

  return (
    <button
      type="button"
      onClick={handleVerify}
      disabled={disabled}
      title={runActive ? 'Wait for run to complete' : undefined}
      className="w-full px-3 py-1.5 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer disabled:opacity-50"
    >
      {runningVerify ? 'Running Verify...' : 'Verify'}
    </button>
  )
}
