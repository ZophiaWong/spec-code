import { useRepoStore } from '../stores/repo-store'
import { Layout } from '../components/Layout'
import { LeftSidebar } from '../components/LeftSidebar'
import { RightSidebar } from '../components/RightSidebar'

export function WorkspacePage() {
  const repo = useRepoStore((s) => s.repo)

  if (!repo) return null

  return (
    <Layout
      left={<LeftSidebar />}
      center={
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
      }
      right={<RightSidebar />}
    />
  )
}
