import type {
  RepoInfo,
  RecentProject,
  Session,
  Run,
  RunEvent,
  SpecSummary,
  ChangeSummary,
  Checkpoint,
  ChangedFile,
  VerifyResult,
  VerifyConfig
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
  SESSION_DELETE: 'session:delete',
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
  CHANGE_CREATE: 'change:create',
  CHECKPOINT_LIST: 'checkpoint:list',
  CHECKPOINT_REWIND: 'checkpoint:rewind',
  CHECKPOINTS_UPDATED: 'checkpoint:updated',
  DIFF_CHANGED_FILES: 'diff:changed-files',
  DIFF_FILE_CONTENT: 'diff:file-content',
  DIFF_FILES_UPDATED: 'diff:files-updated',
  VERIFY_RUN: 'verify:run',
  VERIFY_CONFIG: 'verify:config',
  VERIFY_RESULT: 'verify:result'
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
  deleteSession(sessionId: string): Promise<void>
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
  listCheckpoints(sessionId: string): Promise<Checkpoint[]>
  rewindCheckpoint(checkpointId: string): Promise<{ success: true } | { error: string }>
  getChangedFiles(runId: string): Promise<ChangedFile[]>
  getFileDiff(runId: string, filePath: string): Promise<ContentResult | { error: string }>
  runVerify(repoPath: string): Promise<{ started: boolean } | { error: string }>
  getVerifyConfig(repoPath: string): Promise<VerifyConfig | { error: string }>
  onRunEvent(callback: (event: RunEvent) => void): () => void
  onDiffFilesUpdated(callback: (payload: { runId: string }) => void): () => void
  onCheckpointUpdated(callback: (payload: { sessionId: string }) => void): () => void
  onVerifyResult(callback: (result: VerifyResult) => void): () => void
}

declare global {
  interface Window {
    api: IpcApi
  }
}
