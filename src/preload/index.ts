import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'
import type { IpcApi } from '../shared/ipc'

const api: IpcApi = {
  openRepo: () => ipcRenderer.invoke(IPC_CHANNELS.REPO_OPEN),
  getRepoInfo: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.REPO_GET_INFO, path),
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_LIST),
  clearProjects: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_CLEAR),
  removeProject: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_REMOVE, path)
}

contextBridge.exposeInMainWorld('api', api)
