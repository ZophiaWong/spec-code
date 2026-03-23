import { randomUUID } from 'crypto'
import { getDb } from './index'
import type { Run, RunEvent, RunEventType } from '../../shared/types'

export function createRun(sessionId: string, prompt: string): Run {
  const db = getDb()
  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO runs (id, session_id, prompt, status, created_at, finished_at)
    VALUES (?, ?, ?, 'running', ?, NULL)
  `).run(id, sessionId, prompt, now)

  return { id, sessionId, prompt, status: 'running', createdAt: now, finishedAt: null }
}

export function listRuns(sessionId: string): Run[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, session_id as sessionId, prompt, status, created_at as createdAt, finished_at as finishedAt
    FROM runs
    WHERE session_id = ?
    ORDER BY created_at ASC
  `).all(sessionId)
  return rows as Run[]
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
