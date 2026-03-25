import { randomUUID } from 'crypto'
import { getDb } from './index'
import type { Session } from '../../shared/types'

export function createSession(repoPath: string, title?: string): Session {
  const db = getDb()
  const id = randomUUID()
  const now = new Date().toISOString()

  const count = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE repo_path = ?').get(repoPath) as { c: number }
  const sessionTitle = title || `Session ${count.c + 1}`

  db.prepare(`
    INSERT INTO sessions (id, repo_path, title, parent_session_id, created_at, updated_at)
    VALUES (?, ?, ?, NULL, ?, ?)
  `).run(id, repoPath, sessionTitle, now, now)

  return { id, repoPath, title: sessionTitle, parentSessionId: null, createdAt: now, updatedAt: now }
}

export function listSessions(repoPath: string): Session[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, repo_path as repoPath, title, parent_session_id as parentSessionId,
           created_at as createdAt, updated_at as updatedAt
    FROM sessions
    WHERE repo_path = ?
    ORDER BY updated_at DESC
  `).all(repoPath)
  return rows as Session[]
}

export function getSessionById(sessionId: string): Session | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT id, repo_path as repoPath, title, parent_session_id as parentSessionId,
           created_at as createdAt, updated_at as updatedAt
    FROM sessions
    WHERE id = ?
  `).get(sessionId)
  return (row as Session | undefined) ?? null
}

export function forkSession(sessionId: string): Session {
  const db = getDb()
  const parent = db.prepare(`
    SELECT id, repo_path as repoPath, title FROM sessions WHERE id = ?
  `).get(sessionId) as { id: string; repoPath: string; title: string } | undefined

  if (!parent) throw new Error(`Session ${sessionId} not found`)

  const id = randomUUID()
  const now = new Date().toISOString()

  const count = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE repo_path = ?').get(parent.repoPath) as { c: number }
  const title = `Session ${count.c + 1} (fork)`

  db.prepare(`
    INSERT INTO sessions (id, repo_path, title, parent_session_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, parent.repoPath, title, sessionId, now, now)

  return { id, repoPath: parent.repoPath, title, parentSessionId: sessionId, createdAt: now, updatedAt: now }
}

export function touchSession(sessionId: string): void {
  const db = getDb()
  db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), sessionId)
}

export function deleteSession(sessionId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM run_events WHERE run_id IN (SELECT id FROM runs WHERE session_id = ?)').run(sessionId)
  db.prepare('DELETE FROM runs WHERE session_id = ?').run(sessionId)
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
}
