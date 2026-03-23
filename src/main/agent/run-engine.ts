import type { BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import type { Run } from '../../shared/types'
import { createRun, updateRunStatus, insertRunEvent, hasActiveRun } from '../db/runs'
import { touchSession } from '../db/sessions'
import { runStubAgent } from './stub'

export async function startRun(
  sessionId: string,
  prompt: string,
  win: BrowserWindow
): Promise<Run | { error: string }> {
  if (hasActiveRun(sessionId)) {
    return { error: 'A run is already active in this session' }
  }

  const run = createRun(sessionId, prompt)
  touchSession(sessionId)

  runStubAgent((stubEvent) => {
    const event = insertRunEvent(run.id, stubEvent.type, stubEvent.payload)
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.RUN_EVENT, event)
    }
  })
    .then(() => {
      updateRunStatus(run.id, 'completed')
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.RUN_EVENT, {
          id: -1,
          runId: run.id,
          type: 'status_change',
          payload: JSON.stringify({ status: 'completed' }),
          createdAt: new Date().toISOString()
        })
      }
    })
    .catch((err) => {
      updateRunStatus(run.id, 'failed')
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.RUN_EVENT, {
          id: -1,
          runId: run.id,
          type: 'status_change',
          payload: JSON.stringify({ status: 'failed', error: String(err) }),
          createdAt: new Date().toISOString()
        })
      }
    })

  return run
}
