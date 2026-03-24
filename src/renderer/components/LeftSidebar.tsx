import { useState } from 'react'
import { SessionList } from './SessionList'
import { useRepoStore } from '../stores/repo-store'
import { useSessionStore } from '../stores/session-store'
import { useSpecStore } from '../stores/spec-store'

export function LeftSidebar() {
  const repo = useRepoStore((s) => s.repo)
  const setActiveSession = useSessionStore((s) => s.setActiveSession)
  const {
    specs,
    changes,
    activeView,
    loadingSpecs,
    loadingChanges,
    specsError,
    changesError,
    loadSpecs,
    loadChanges,
    selectSpec,
    selectChange
  } = useSpecStore()

  const [sessionsExpanded, setSessionsExpanded] = useState(true)
  const [specsExpanded, setSpecsExpanded] = useState(true)
  const [changesExpanded, setChangesExpanded] = useState(true)
  const [createMode, setCreateMode] = useState<'spec' | 'change' | null>(null)
  const [createName, setCreateName] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSelectSpec = (name: string) => {
    setActiveSession(null)
    selectSpec(name)
  }

  const handleSelectChange = (name: string) => {
    setActiveSession(null)
    selectChange(name)
  }

  const handleNewSpec = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!repo || submittingCreate) return
    setActionError(null)
    setCreateName('')
    setCreateMode('spec')
  }

  const handleNewChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!repo || submittingCreate) return
    setActionError(null)
    setCreateName('')
    setCreateMode('change')
  }

  const handleCreateSubmit = async () => {
    if (!repo || !createMode || submittingCreate) return

    const name = createName.trim()
    if (!name) {
      setActionError('Name is required')
      return
    }

    setSubmittingCreate(true)
    setActionError(null)

    if (createMode === 'spec') {
      const result = await window.api.createSpec({ repoPath: repo.path, name })
      if ('error' in result) {
        setActionError(result.error)
        setSubmittingCreate(false)
        return
      }

      await loadSpecs(repo.path)
      setActiveSession(null)
      selectSpec(result.name)
    } else {
      const result = await window.api.createChange({ repoPath: repo.path, name })
      if ('error' in result) {
        setActionError(result.error)
        setSubmittingCreate(false)
        return
      }

      await loadChanges(repo.path)
      setActiveSession(null)
      selectChange(result.name)
    }

    setSubmittingCreate(false)
    setCreateMode(null)
    setCreateName('')
  }

  return (
    <div>
      {actionError && (
        <div className="mb-3 px-2 py-1.5 bg-error-bg border border-error-border rounded text-[12px] text-error-text">
          {actionError}
        </div>
      )}

      {createMode && (
        <form
          className="mb-3 p-2 bg-sidebar border border-border rounded"
          onSubmit={(e) => {
            e.preventDefault()
            void handleCreateSubmit()
          }}
        >
          <div className="text-[11px] text-text-secondary mb-2">
            New {createMode === 'spec' ? 'Spec' : 'Change'} (kebab-case)
          </div>
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            autoFocus
            placeholder={createMode === 'spec' ? 'my-new-spec' : 'my-new-change'}
            className="w-full mb-2 bg-input border border-border rounded px-2 py-1.5 text-[13px] text-text-primary outline-none focus:border-accent-blue"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submittingCreate}
              className="px-2.5 py-1 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer disabled:opacity-60"
            >
              {submittingCreate ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (submittingCreate) return
                setCreateMode(null)
                setCreateName('')
              }}
              className="px-2.5 py-1 text-[12px] text-text-secondary bg-transparent border border-border rounded-[3px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <button
          onClick={() => setSessionsExpanded((prev) => !prev)}
          className="w-full text-left text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center gap-1 cursor-pointer select-none"
        >
          <span className="text-[9px]">{sessionsExpanded ? '▾' : '▸'}</span> Sessions
        </button>
        {sessionsExpanded && <SessionList />}
      </div>

      <div className="mb-4">
        <div className="w-full text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center justify-between select-none">
          <button
            type="button"
            onClick={() => setSpecsExpanded((prev) => !prev)}
            className="text-left bg-transparent border-none text-inherit cursor-pointer"
          >
            <span className="text-[9px] mr-1">{specsExpanded ? '▾' : '▸'}</span>
            Specs
          </button>
          <button
            type="button"
            onClick={handleNewSpec}
            className="text-[14px] leading-none bg-transparent border-none text-text-secondary hover:text-white cursor-pointer disabled:opacity-60"
            title="New Spec"
            disabled={submittingCreate}
          >
            +
          </button>
        </div>
        {specsExpanded && (
          <div className="flex flex-col gap-0.5 pl-2">
            {loadingSpecs && <div className="text-[12px] text-text-secondary py-[3px]">Loading specs...</div>}
            {specsError && <div className="text-[12px] text-error-text py-[3px]">{specsError}</div>}
            {!loadingSpecs && !specsError && specs.length === 0 && (
              <div className="text-[13px] text-text-secondary py-[3px]">No specs found</div>
            )}
            {!loadingSpecs && !specsError &&
              specs.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => handleSelectSpec(spec.name)}
                  className={`w-full text-left px-2 py-1 rounded-[3px] border-none cursor-pointer ${
                    activeView.view === 'spec-detail' && activeView.specName === spec.name
                      ? 'bg-[#37373d] text-white'
                      : 'bg-transparent text-text-secondary hover:bg-[#2a2d2e]'
                  }`}
                >
                  <div className="text-[13px]">{spec.name}</div>
                  <div className="text-[11px] text-text-muted truncate">{spec.purpose}</div>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="w-full text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center justify-between select-none">
          <button
            type="button"
            onClick={() => setChangesExpanded((prev) => !prev)}
            className="text-left bg-transparent border-none text-inherit cursor-pointer"
          >
            <span className="text-[9px] mr-1">{changesExpanded ? '▾' : '▸'}</span>
            Changes
          </button>
          <button
            type="button"
            onClick={handleNewChange}
            className="text-[14px] leading-none bg-transparent border-none text-text-secondary hover:text-white cursor-pointer disabled:opacity-60"
            title="New Change"
            disabled={submittingCreate}
          >
            +
          </button>
        </div>
        {changesExpanded && (
          <div className="flex flex-col gap-0.5 pl-2">
            {loadingChanges && <div className="text-[12px] text-text-secondary py-[3px]">Loading changes...</div>}
            {changesError && <div className="text-[12px] text-error-text py-[3px]">{changesError}</div>}
            {!loadingChanges && !changesError && changes.length === 0 && (
              <div className="text-[13px] text-text-secondary py-[3px]">No active changes</div>
            )}
            {!loadingChanges && !changesError &&
              changes.map((change) => (
                <button
                  key={change.name}
                  onClick={() => handleSelectChange(change.name)}
                  className={`w-full text-left px-2 py-1 rounded-[3px] border-none cursor-pointer ${
                    activeView.view === 'change-detail' && activeView.changeName === change.name
                      ? 'bg-[#37373d] text-white'
                      : 'bg-transparent text-text-secondary hover:bg-[#2a2d2e]'
                  }`}
                >
                  <div className="text-[13px]">{change.name}</div>
                  <div className="text-[11px] text-text-muted truncate">{change.status}</div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
