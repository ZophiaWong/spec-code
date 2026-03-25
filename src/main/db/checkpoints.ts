import { randomUUID } from 'crypto'
import { getDb } from './index'
import type { Checkpoint } from '../../shared/types'

export interface CreateCheckpointRecordInput {
  runId: string
  sessionId: string
  tagName: string
}

export function createCheckpointRecord(input: CreateCheckpointRecordInput): Checkpoint {
  const db = getDb()
  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO checkpoints (id, run_id, session_id, tag_name, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, input.runId, input.sessionId, input.tagName, now)

  const runPrompt = getRunPromptById(input.runId)

  return {
    id,
    runId: input.runId,
    sessionId: input.sessionId,
    tagName: input.tagName,
    createdAt: now,
    runPrompt
  }
}

export function getCheckpointById(checkpointId: string): Checkpoint | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT
      c.id,
      c.run_id as runId,
      c.session_id as sessionId,
      c.tag_name as tagName,
      c.created_at as createdAt,
      COALESCE(r.prompt, '') as runPrompt
    FROM checkpoints c
    LEFT JOIN runs r ON r.id = c.run_id
    WHERE c.id = ?
  `).get(checkpointId)

  return (row as Checkpoint | undefined) ?? null
}

export function listCheckpoints(sessionId: string): Checkpoint[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT
      c.id,
      c.run_id as runId,
      c.session_id as sessionId,
      c.tag_name as tagName,
      c.created_at as createdAt,
      COALESCE(r.prompt, '') as runPrompt
    FROM checkpoints c
    LEFT JOIN runs r ON r.id = c.run_id
    WHERE c.session_id = ?
    ORDER BY c.created_at DESC
  `).all(sessionId)

  return rows as Checkpoint[]
}

export function deleteCheckpointById(checkpointId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM checkpoints WHERE id = ?').run(checkpointId)
}

export function deleteCheckpointsBySession(sessionId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM checkpoints WHERE session_id = ?').run(sessionId)
}

export function listCheckpointTagsBySession(sessionId: string): string[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT tag_name as tagName
    FROM checkpoints
    WHERE session_id = ?
    ORDER BY created_at DESC
  `).all(sessionId) as Array<{ tagName: string }>

  return rows.map((row) => row.tagName)
}

export function getCheckpointTagByRun(runId: string): string | null {
  const db = getDb()
  const row = db.prepare('SELECT tag_name as tagName FROM checkpoints WHERE run_id = ?').get(runId) as
    | { tagName: string }
    | undefined

  return row?.tagName ?? null
}

function getRunPromptById(runId: string): string {
  const db = getDb()
  const row = db.prepare('SELECT prompt FROM runs WHERE id = ?').get(runId) as { prompt: string } | undefined
  return row?.prompt ?? ''
}
