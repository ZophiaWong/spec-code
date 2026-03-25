import type { BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import type { Run, RunMode } from '../../shared/types'
import { createRun, updateRunStatus, insertRunEvent, hasActiveRun, getRunById } from '../db/runs'
import { getSessionById, touchSession } from '../db/sessions'
import { runStubAgent } from './stub'
import { isToolAllowed } from './permissions'
import { isRiskyCommand } from './risky-patterns'
import { createCheckpoint } from '../git/checkpoint'

interface PendingApproval {
  resolve: (approved: boolean) => void
}

const pendingApprovals = new Map<string, PendingApproval>()

export async function startRun(
  sessionId: string,
  prompt: string,
  win: BrowserWindow,
  mode: RunMode = 'plan',
  sourcePlanRunId: string | null = null
): Promise<Run | { error: string }> {
  if (hasActiveRun(sessionId)) {
    return { error: 'A run is already active in this session' }
  }

  const run = createRun(sessionId, prompt, { mode, sourcePlanRunId })
  touchSession(sessionId)
  const session = getSessionById(sessionId)
  if (!session) {
    return { error: 'Session not found' }
  }

  if (mode === 'apply') {
    try {
      await createCheckpoint(session.repoPath, run.id, sessionId)
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.CHECKPOINTS_UPDATED, { sessionId })
      }
    } catch (error) {
      updateRunStatus(run.id, 'failed')
      const message = error instanceof Error ? error.message : 'Failed to create checkpoint'
      emitRunEvent(run.id, 'error', JSON.stringify({ message }), win)
      return { error: message }
    }
  }

  let pendingWritePath: string | null = null

  runStubAgent(run.mode, async (stubEvent) => {
    if (stubEvent.type === 'tool_call') {
      const parsed = safeJsonParse(stubEvent.payload)
      const toolName = typeof parsed?.tool === 'string' ? parsed.tool : ''
      if (!isToolAllowed(run.mode, toolName)) {
        emitRunEvent(
          run.id,
          'error',
          JSON.stringify({ message: `Tool "${toolName}" is not permitted in ${run.mode} mode.` }),
          win
        )
        return
      }

      if (run.mode === 'apply' && toolName === 'bash') {
        const command = typeof parsed?.args?.command === 'string' ? parsed.args.command : ''
        if (isRiskyCommand(command)) {
          emitRunEvent(
            run.id,
            'approval_request',
            JSON.stringify({
              tool: 'bash',
              command,
              reason: 'High-risk command requires explicit user confirmation.'
            }),
            win
          )
          const approved = await waitForRiskyApproval(run.id)
          if (!approved) {
            emitRunEvent(
              run.id,
              'error',
              JSON.stringify({ message: `Risky command rejected: ${command}` }),
              win
            )
            return
          }
        }
      }

      if (run.mode === 'apply' && isWriteTool(toolName)) {
        pendingWritePath = getToolPath(parsed?.args)
      }
    }

    const event = insertRunEvent(run.id, stubEvent.type, stubEvent.payload)
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.RUN_EVENT, event)
    }

    if (run.mode === 'apply' && stubEvent.type === 'tool_result' && pendingWritePath) {
      const fileChangedPayload = JSON.stringify({
        path: pendingWritePath,
        status: 'modified'
      })
      const fileEvent = insertRunEvent(run.id, 'file_changed', fileChangedPayload)
      pendingWritePath = null
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.RUN_EVENT, fileEvent)
      }
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
        if (run.mode === 'apply') {
          win.webContents.send(IPC_CHANNELS.DIFF_FILES_UPDATED, { runId: run.id })
        }
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

export async function approveRun(planRunId: string, win: BrowserWindow): Promise<Run | { error: string }> {
  const planRun = getRunById(planRunId)
  if (!planRun) {
    return { error: 'Plan run not found' }
  }
  if (planRun.mode !== 'plan') {
    return { error: 'Only plan runs can be approved' }
  }
  if (planRun.status !== 'completed') {
    return { error: 'Plan run must be completed before approval' }
  }

  return startRun(planRun.sessionId, planRun.prompt, win, 'apply', planRun.id)
}

export function confirmRisky(runId: string, approved: boolean): void {
  const pending = pendingApprovals.get(runId)
  if (!pending) return
  pendingApprovals.delete(runId)
  pending.resolve(approved)
}

function waitForRiskyApproval(runId: string): Promise<boolean> {
  return new Promise((resolve) => {
    pendingApprovals.set(runId, { resolve })
  })
}

function emitRunEvent(
  runId: string,
  type: 'error' | 'approval_request',
  payload: string,
  win: BrowserWindow
): void {
  const event = insertRunEvent(runId, type, payload)
  if (!win.isDestroyed()) {
    win.webContents.send(IPC_CHANNELS.RUN_EVENT, event)
  }
}

function safeJsonParse(payload: string): any {
  try {
    return JSON.parse(payload)
  } catch {
    return null
  }
}

function isWriteTool(toolName: string): boolean {
  return new Set(['write_file', 'replace_text', 'create_file', 'edit_file']).has(toolName)
}

function getToolPath(args: unknown): string | null {
  if (typeof args !== 'object' || args === null) return null
  const path = (args as { path?: unknown }).path
  return typeof path === 'string' ? path : null
}
