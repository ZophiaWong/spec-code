import { randomUUID } from 'crypto'
import { getDb } from './index'
import type { Run, RunEvent, RunEventType, RunMode } from '../../shared/types'

interface CreateRunParams {
  mode?: RunMode
  sourcePlanRunId?: string | null
}

export function createRun(
  sessionId: string,
  prompt: string,
  params: CreateRunParams = {}
): Run {
  const db = getDb()
  const id = randomUUID()
  const now = new Date().toISOString()
  const mode = params.mode ?? 'plan'
  const sourcePlanRunId = params.sourcePlanRunId ?? null

  db.prepare(`
    INSERT INTO runs (id, session_id, prompt, status, mode, source_plan_run_id, created_at, finished_at)
    VALUES (?, ?, ?, 'running', ?, ?, ?, NULL)
  `).run(id, sessionId, prompt, mode, sourcePlanRunId, now)

  return {
    id,
    sessionId,
    prompt,
    status: 'running',
    mode,
    sourcePlanRunId,
    createdAt: now,
    finishedAt: null
  }
}

export function listRuns(sessionId: string): Run[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT
      id,
      session_id as sessionId,
      prompt,
      status,
      COALESCE(mode, 'plan') as mode,
      source_plan_run_id as sourcePlanRunId,
      created_at as createdAt,
      finished_at as finishedAt
    FROM runs
    WHERE session_id = ?
    ORDER BY created_at ASC
  `).all(sessionId)
  return rows as Run[]
}

export function getRunById(runId: string): Run | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT
      id,
      session_id as sessionId,
      prompt,
      status,
      COALESCE(mode, 'plan') as mode,
      source_plan_run_id as sourcePlanRunId,
      created_at as createdAt,
      finished_at as finishedAt
    FROM runs
    WHERE id = ?
  `).get(runId)

  return (row as Run | undefined) ?? null
}

export function updateRunStatus(runId: string, status: 'completed' | 'failed'): void {
  const db = getDb()
  db.prepare('UPDATE runs SET status = ?, finished_at = ? WHERE id = ?').run(status, new Date().toISOString(), runId)
}

export function insertRunEvent(runId: string, type: RunEventType, payload: string): RunEvent {
  const db = getDb()
  const now = new Date().toISOString()

  const result = db.prepare(`
    INSERT INTO run_events (run_id, type, payload, created_at)
    VALUES (?, ?, ?, ?)
  `).run(runId, type, payload, now)

  return { id: Number(result.lastInsertRowid), runId, type, payload, createdAt: now }
}

export function getRunEvents(runId: string): RunEvent[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, run_id as runId, type, payload, created_at as createdAt
    FROM run_events
    WHERE run_id = ?
    ORDER BY created_at ASC
  `).all(runId)
  return rows as RunEvent[]
}

export function hasActiveRun(sessionId: string): boolean {
  const db = getDb()
  const row = db.prepare(`
    SELECT COUNT(*) as c FROM runs WHERE session_id = ? AND status = 'running'
  `).get(sessionId) as { c: number }
  return row.c > 0
}
