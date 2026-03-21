import { getDb } from './index'
import type { RecentProject } from '../../shared/types'

export function upsertProject(path: string, name: string): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO recent_projects (path, name, opened_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(path) DO UPDATE SET
      name = excluded.name,
      opened_at = datetime('now')
  `).run(path, name)
}

export function listProjects(): RecentProject[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, path, name, opened_at as openedAt
    FROM recent_projects
    ORDER BY opened_at DESC
    LIMIT 20
  `).all()
  return rows as RecentProject[]
}

export function clearProjects(): void {
  const db = getDb()
  db.prepare('DELETE FROM recent_projects').run()
}

export function removeProject(path: string): void {
  const db = getDb()
  db.prepare('DELETE FROM recent_projects WHERE path = ?').run(path)
}
