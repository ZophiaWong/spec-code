export interface RepoInfo {
  path: string
  name: string
  currentBranch: string
  lastCommit: {
    hash: string
    message: string
  }
}

export interface RecentProject {
  id: number
  path: string
  name: string
  openedAt: string
}

export interface Session {
  id: string
  repoPath: string
  title: string
  parentSessionId: string | null
  createdAt: string
  updatedAt: string
}

export type RunStatus = 'running' | 'completed' | 'failed'

export interface Run {
  id: string
  sessionId: string
  prompt: string
  status: RunStatus
  createdAt: string
  finishedAt: string | null
}

export type RunEventType = 'agent_message' | 'tool_call' | 'tool_result' | 'error'

export interface RunEvent {
  id: number
  runId: string
  type: RunEventType
  payload: string
  createdAt: string
}
