import type { RepoInfo, RecentProject } from './types'

export const IPC_CHANNELS = {
  REPO_OPEN: 'repo:open',
  REPO_GET_INFO: 'repo:getInfo',
  PROJECTS_LIST: 'projects:list',
  PROJECTS_CLEAR: 'projects:clear',
  PROJECTS_REMOVE: 'projects:remove'
} as const

export interface IpcApi {
  openRepo(): Promise<RepoInfo | { error: string }>
  getRepoInfo(path: string): Promise<RepoInfo | { error: string }>
  listProjects(): Promise<RecentProject[]>
  clearProjects(): Promise<void>
  removeProject(path: string): Promise<void>
}

declare global {
  interface Window {
    api: IpcApi
  }
}
