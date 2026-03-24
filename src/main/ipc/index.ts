import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import type { CreateSpecRequest, CreateChangeRequest } from '../../shared/ipc'
import { openRepoDialog, getRepoInfo } from '../git'
import { upsertProject, listProjects, clearProjects, removeProject } from '../db/recent-projects'
import { createSession, listSessions, forkSession } from '../db/sessions'
import { listRuns, getRunEvents } from '../db/runs'
import { startRun, approveRun, confirmRisky } from '../agent/run-engine'
import { listSpecs, readSpec } from '../openspec/specs'
import { listChanges, readChangeArtifact } from '../openspec/changes'
import { createSpec, createChange } from '../openspec/actions'

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

  ipcMain.handle(IPC_CHANNELS.SESSION_CREATE, (_event, repoPath: string, title?: string) => {
    return createSession(repoPath, title)
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_LIST, (_event, repoPath: string) => {
    return listSessions(repoPath)
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_FORK, (_event, sessionId: string) => {
    return forkSession(sessionId)
  })

  ipcMain.handle(IPC_CHANNELS.RUN_START, async (event, sessionId: string, prompt: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { error: 'No window found' }
    return startRun(sessionId, prompt, win)
  })

  ipcMain.handle(IPC_CHANNELS.RUN_LIST, (_event, sessionId: string) => {
    return listRuns(sessionId)
  })

  ipcMain.handle(IPC_CHANNELS.RUN_EVENTS, (_event, runId: string) => {
    return getRunEvents(runId)
  })

  ipcMain.handle(IPC_CHANNELS.RUN_APPROVE, async (event, planRunId: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { error: 'No window found' }
    return approveRun(planRunId, win)
  })

  ipcMain.handle(IPC_CHANNELS.RUN_CONFIRM_RISKY, (_event, runId: string, approved: boolean) => {
    confirmRisky(runId, approved)
  })

  ipcMain.handle(IPC_CHANNELS.SPEC_LIST, async (_event, repoPath: string) => {
    try {
      return await listSpecs(repoPath)
    } catch (error) {
      return { error: getErrorMessage(error, 'Failed to list specs') }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SPEC_READ, async (_event, repoPath: string, name: string) => {
    try {
      const content = await readSpec(repoPath, name)
      return { content }
    } catch (error) {
      return { error: getErrorMessage(error, 'Failed to read spec') }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CHANGE_LIST, async (_event, repoPath: string) => {
    try {
      return await listChanges(repoPath)
    } catch (error) {
      return { error: getErrorMessage(error, 'Failed to list changes') }
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.CHANGE_READ_ARTIFACT,
    async (_event, repoPath: string, changeName: string, artifactPath: string) => {
      try {
        const content = await readChangeArtifact(repoPath, changeName, artifactPath)
        return { content }
      } catch (error) {
        return { error: getErrorMessage(error, 'Failed to read change artifact') }
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.SPEC_CREATE, async (_event, input: CreateSpecRequest) => {
    try {
      await createSpec(input.repoPath, input.name)
      return { success: true, name: input.name }
    } catch (error) {
      return { error: getErrorMessage(error, 'Failed to create spec') }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CHANGE_CREATE, async (_event, input: CreateChangeRequest) => {
    try {
      await createChange(input.repoPath, input.name)
      return { success: true, name: input.name }
    } catch (error) {
      return { error: getErrorMessage(error, 'Failed to create change') }
    }
  })
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return fallback
}
