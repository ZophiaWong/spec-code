import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import { openRepoDialog, getRepoInfo } from '../git'
import { upsertProject, listProjects, clearProjects, removeProject } from '../db/recent-projects'
import type { RepoInfo } from '../../shared/types'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.REPO_OPEN, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { error: 'No window found' }

    const result = await openRepoDialog(win)
    if (!('error' in result)) {
      upsertProject(result.path, result.name)
    }
    return result
  })

  ipcMain.handle(
    IPC_CHANNELS.REPO_GET_INFO,
    async (_event, path: string) => {
      return getRepoInfo(path)
    }
  )

  ipcMain.handle(IPC_CHANNELS.PROJECTS_LIST, () => {
    return listProjects()
  })

  ipcMain.handle(IPC_CHANNELS.PROJECTS_CLEAR, () => {
    clearProjects()
  })

  ipcMain.handle(IPC_CHANNELS.PROJECTS_REMOVE, (_event, path: string) => {
    removeProject(path)
  })
}
