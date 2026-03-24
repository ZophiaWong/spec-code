import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'
import type {
  IpcApi,
  CreateSpecRequest,
  CreateChangeRequest
} from '../shared/ipc'

const api: IpcApi = {
  openRepo: () => ipcRenderer.invoke(IPC_CHANNELS.REPO_OPEN),
  getRepoInfo: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.REPO_GET_INFO, path),
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_LIST),
  clearProjects: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_CLEAR),
  removeProject: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_REMOVE, path),
  createSession: (repoPath: string, title?: string) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_CREATE, repoPath, title),
  listSessions: (repoPath: string) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_LIST, repoPath),
  forkSession: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_FORK, sessionId),
  startRun: (sessionId: string, prompt: string) => ipcRenderer.invoke(IPC_CHANNELS.RUN_START, sessionId, prompt),
  approveRun: (planRunId: string) => ipcRenderer.invoke(IPC_CHANNELS.RUN_APPROVE, planRunId),
  confirmRisky: (runId: string, approved: boolean) => ipcRenderer.invoke(IPC_CHANNELS.RUN_CONFIRM_RISKY, runId, approved),
  listRuns: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.RUN_LIST, sessionId),
  getRunEvents: (runId: string) => ipcRenderer.invoke(IPC_CHANNELS.RUN_EVENTS, runId),
  listSpecs: (repoPath: string) => ipcRenderer.invoke(IPC_CHANNELS.SPEC_LIST, repoPath),
  readSpec: (repoPath: string, name: string) => ipcRenderer.invoke(IPC_CHANNELS.SPEC_READ, repoPath, name),
  listChanges: (repoPath: string) => ipcRenderer.invoke(IPC_CHANNELS.CHANGE_LIST, repoPath),
  readChangeArtifact: (repoPath: string, changeName: string, artifactPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CHANGE_READ_ARTIFACT, repoPath, changeName, artifactPath),
  createSpec: (input: CreateSpecRequest) => ipcRenderer.invoke(IPC_CHANNELS.SPEC_CREATE, input),
  createChange: (input: CreateChangeRequest) => ipcRenderer.invoke(IPC_CHANNELS.CHANGE_CREATE, input),
  onRunEvent: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data as Parameters<typeof callback>[0])
    ipcRenderer.on(IPC_CHANNELS.RUN_EVENT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RUN_EVENT, handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
