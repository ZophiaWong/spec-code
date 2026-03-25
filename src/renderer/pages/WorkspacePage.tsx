import { useRepoStore } from '../stores/repo-store'
import { useSpecStore } from '../stores/spec-store'
import { Layout } from '../components/Layout'
import { LeftSidebar } from '../components/LeftSidebar'
import { RightSidebar } from '../components/RightSidebar'
import { ChatRunView } from '../components/ChatRunView'
import { SpecDetail } from '../components/SpecDetail'
import { ChangeDetail } from '../components/ChangeDetail'
import { DiffViewer } from '../components/DiffViewer'
import { useDiffStore } from '../stores/diff-store'

export function WorkspacePage() {
  const repo = useRepoStore((s) => s.repo)
  const activeView = useSpecStore((s) => s.activeView)
  const changes = useSpecStore((s) => s.changes)
  const selectedFile = useDiffStore((s) => s.selectedFile)

  if (!repo) return null

  const activeChange = activeView.view === 'change-detail'
    ? changes.find((change) => change.name === activeView.changeName)
    : null

  let center = <RepoInfoPanel />

  if (selectedFile) {
    center = <DiffViewer />
  } else if (activeView.view === 'session') {
    center = <ChatRunView />
  } else if (activeView.view === 'spec-detail') {
    center = <SpecDetail repoPath={repo.path} specName={activeView.specName} />
  } else if (activeView.view === 'change-detail') {
    center = activeChange ? (
      <ChangeDetail repoPath={repo.path} change={activeChange} />
    ) : (
      <div className="text-[13px] text-error-text">Selected change was not found.</div>
    )
  }

  return (
    <Layout
      left={<LeftSidebar />}
      center={center}
      right={<RightSidebar />}
    />
  )
}

function RepoInfoPanel() {
  const repo = useRepoStore((s) => s.repo)
  if (!repo) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-normal text-white mb-1">{repo.name}</h1>
        <div className="text-[12px] text-text-muted font-mono">{repo.path}</div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-sidebar border border-border rounded p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-2">
            Branch
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-blue text-sm">&#9741;</span>
            <span className="font-mono text-sm text-accent-green">{repo.currentBranch}</span>
          </div>
        </div>

        <div className="flex-2 bg-sidebar border border-border rounded p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-2">
            Last Commit
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-[13px] text-accent-yellow bg-titlebar px-2 py-0.5 rounded-[3px]">
              {repo.lastCommit.hash.slice(0, 7)}
            </span>
            <span className="text-[13px] text-text-primary">{repo.lastCommit.message}</span>
          </div>
        </div>
      </div>

      <div className="bg-sidebar border border-border rounded p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-2">
          Quick Actions
        </div>
        <div className="flex gap-2.5">
          {['New Session', 'Open Spec', 'View Diff'].map((label) => (
            <button
              key={label}
              className="px-4 py-1.5 text-[13px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer opacity-50"
              disabled
              title="Coming soon"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
