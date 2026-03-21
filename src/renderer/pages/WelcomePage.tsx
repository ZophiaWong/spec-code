import { useEffect, useState } from 'react'
import { useRepoStore } from '../stores/repo-store'
import { useProjectsStore } from '../stores/projects-store'
import type { RepoInfo } from '../../shared/types'

export function WelcomePage() {
  const setRepo = useRepoStore((s) => s.setRepo)
  const { projects, fetchProjects } = useProjectsStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleOpenRepo = async () => {
    setError(null)
    const result = await window.api.openRepo()
    if ('error' in result) {
      if (result.error !== 'cancelled') {
        setError(result.error)
      }
      return
    }
    setRepo(result)
  }

  const handleOpenRecent = async (path: string) => {
    setError(null)
    const result = await window.api.getRepoInfo(path)
    if ('error' in result) {
      setError(`Could not open: ${result.error}`)
      await window.api.removeProject(path)
      await fetchProjects()
      return
    }
    setRepo(result as RepoInfo)
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-editor">
      <div className="max-w-[460px] w-full px-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue rounded-xl flex items-center justify-center text-[28px] font-bold text-white">
            SC
          </div>
          <h1 className="text-[26px] font-light text-white mb-1.5">Spec Code</h1>
          <p className="text-[13px] text-text-secondary">Spec-driven desktop coding agent</p>
        </div>

        <button
          onClick={handleOpenRepo}
          className="w-full py-2.5 px-5 text-sm font-medium text-white bg-accent-btn border-none rounded cursor-pointer mb-6 transition-colors hover:bg-accent-btn-hover"
        >
          Open Repository...
        </button>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 bg-error-bg border border-error-border rounded text-[13px] text-error-text flex items-center gap-2">
            <span className="text-base">&#9888;</span>
            {error}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-secondary mb-2 flex items-center gap-1 cursor-pointer select-none">
              Recent
            </div>
            <div className="bg-sidebar border border-border rounded overflow-hidden">
              {projects.map((project, i) => (
                <button
                  key={project.id}
                  onClick={() => handleOpenRecent(project.path)}
                  className={`w-full text-left px-3.5 py-2.5 bg-transparent border-none cursor-pointer block transition-colors hover:bg-hover ${i > 0 ? 'border-t border-t-border' : ''}`}
                >
                  <div className="text-[13px] text-accent-link mb-0.5">{project.name}</div>
                  <div className="text-[11px] text-text-muted font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                    {project.path}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-[12px] text-text-muted">
          <kbd className="text-text-secondary">Ctrl+O</kbd> to open a repository
        </div>
      </div>
    </div>
  )
}
