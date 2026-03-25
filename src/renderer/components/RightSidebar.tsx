import { useState } from 'react'
import { useSessionStore } from '../stores/session-store'
import { ChangedFilesPanel } from './ChangedFilesPanel'
import { CheckpointList } from './CheckpointList'
import { VerifyButton } from './VerifyButton'
import { VerifyResults } from './VerifyResults'

export function RightSidebar() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const [noVerifyConfig, setNoVerifyConfig] = useState(false)

  if (!activeSessionId) {
    return <div className="text-[12px] text-text-muted italic">Select a session to view changed files and checkpoints.</div>
  }

  return (
    <div>
      <ChangedFilesPanel />
      <CheckpointList />
      <div className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2">Verify</div>
        <VerifyButton onNoCommands={() => setNoVerifyConfig(true)} />
        {noVerifyConfig && (
          <div className="mt-2 text-[11px] text-text-muted">
            No verify commands configured. Add `verify.commands` to `.spec-code/config.json`.
          </div>
        )}
        <VerifyResults />
      </div>
    </div>
  )
}
