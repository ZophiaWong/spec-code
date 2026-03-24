import type {
  RepoInfo,
  RecentProject,
  Session,
  Run,
  RunEvent,
  SpecSummary,
  ChangeSummary
} from './types'

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
  RUN_EVENT: 'run:event',
  SPEC_LIST: 'spec:list',
  SPEC_READ: 'spec:read',
  CHANGE_LIST: 'change:list',
  CHANGE_READ_ARTIFACT: 'change:read-artifact',
  SPEC_CREATE: 'spec:create',
  CHANGE_CREATE: 'change:create'
} as const

export interface CreateSpecRequest {
  repoPath: string
  name: string
}

export interface CreateChangeRequest {
  repoPath: string
  name: string
}

export interface CreateEntitySuccess {
  success: true
  name: string
}

export interface ContentResult {
  content: string
}

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
  listSpecs(repoPath: string): Promise<SpecSummary[] | { error: string }>
  readSpec(repoPath: string, name: string): Promise<ContentResult | { error: string }>
  listChanges(repoPath: string): Promise<ChangeSummary[] | { error: string }>
  readChangeArtifact(
    repoPath: string,
    changeName: string,
    artifactPath: string
  ): Promise<ContentResult | { error: string }>
  createSpec(input: CreateSpecRequest): Promise<CreateEntitySuccess | { error: string }>
  createChange(input: CreateChangeRequest): Promise<CreateEntitySuccess | { error: string }>
  onRunEvent(callback: (event: RunEvent) => void): () => void
}

declare global {
  interface Window {
    api: IpcApi
  }
}
