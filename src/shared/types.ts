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

export interface SpecSummary {
  name: string
  purpose: string
}

export interface ChangeArtifactSummary {
  id: string
  path: string
  status: string
}

export interface ChangeSummary {
  name: string
  schema: string
  status: string
  artifacts: ChangeArtifactSummary[]
}

export type RunStatus = 'running' | 'completed' | 'failed'
export type RunMode = 'plan' | 'apply'

export interface Run {
  id: string
  sessionId: string
  prompt: string
  status: RunStatus
  mode: RunMode
  sourcePlanRunId: string | null
  createdAt: string
  finishedAt: string | null
}

export interface PlanStep {
  title: string
  description: string
  affectedFiles: string[]
}

export interface PlanOutput {
  steps: PlanStep[]
}

export type RunEventType =
  | 'agent_message'
  | 'tool_call'
  | 'tool_result'
  | 'error'
  | 'plan_output'
  | 'approval_request'

export interface RunEvent {
  id: number
  runId: string
  type: RunEventType
  payload: string
  createdAt: string
}
