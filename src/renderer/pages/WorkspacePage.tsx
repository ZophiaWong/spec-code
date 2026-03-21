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
          <h1 className="text-2xl font-bold text-neutral-100 mb-4">{repo.name}</h1>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">Branch:</span>
              <span className="text-neutral-200 text-sm font-mono bg-neutral-800 px-2 py-0.5 rounded">
                {repo.currentBranch}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 text-sm">Last commit:</span>
              <div className="mt-1 text-sm text-neutral-300 bg-neutral-800 p-3 rounded-lg font-mono">
                <span className="text-blue-400">{repo.lastCommit.hash.slice(0, 7)}</span>
                {' '}
                {repo.lastCommit.message}
              </div>
            </div>
            <div className="text-neutral-500 text-xs mt-2">{repo.path}</div>
          </div>
        </div>
      }
      right={<RightSidebar />}
    />
  )
}
