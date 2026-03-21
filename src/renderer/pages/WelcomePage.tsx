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
    <div className="flex items-center justify-center h-screen bg-neutral-900">
      <div className="max-w-md w-full px-8">
        <h1 className="text-3xl font-bold text-neutral-100 mb-2">Spec Code</h1>
        <p className="text-neutral-400 mb-8">Spec-driven desktop coding agent</p>

        <button
          onClick={handleOpenRepo}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-6"
        >
          Open Repo
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-neutral-400 mb-3">Recent Projects</h2>
            <ul className="space-y-1">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => handleOpenRecent(project.path)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <div className="text-neutral-200 text-sm font-medium">{project.name}</div>
                    <div className="text-neutral-500 text-xs truncate">{project.path}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
