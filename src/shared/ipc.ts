import type { RepoInfo, RecentProject, Session, Run, RunEvent } from './types'

export const IPC_CHANNELS = {
  REPO_OPEN: 'repo:open',
  REPO_GET_INFO: 'repo:getInfo',
  PROJECTS_LIST: 'projects:list',
  PROJECTS_CLEAR: 'projects:clear',
  PROJECTS_REMOVE: 'projects:remove',
  SESSION_CREATE: 'session:create',
  SESSION_LIST: 'session:list',
  SESSION_FORK: 'session:fork',
  RUN_START: 'run:start',
  RUN_LIST: 'run:list',
  RUN_EVENTS: 'run:events',
  RUN_APPROVE: 'run:approve',
  RUN_CONFIRM_RISKY: 'run:confirm-risky',
  RUN_EVENT: 'run:event'
} as const

export interface IpcApi {
  openRepo(): Promise<RepoInfo | { error: string }>
  getRepoInfo(path: string): Promise<RepoInfo | { error: string }>
  listProjects(): Promise<RecentProject[]>
  clearProjects(): Promise<void>
  removeProject(path: string): Promise<void>
  createSession(repoPath: string, title?: string): Promise<Session>
  listSessions(repoPath: string): Promise<Session[]>
  forkSession(sessionId: string): Promise<Session>
  startRun(sessionId: string, prompt: string): Promise<Run | { error: string }>
  approveRun(planRunId: string): Promise<Run | { error: string }>
  confirmRisky(runId: string, approved: boolean): Promise<void>
  listRuns(sessionId: string): Promise<Run[]>
  getRunEvents(runId: string): Promise<RunEvent[]>
  onRunEvent(callback: (event: RunEvent) => void): () => void
}

declare global {
  interface Window {
    api: IpcApi
  }
}
