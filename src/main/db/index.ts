import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db: Database.Database

export function initDatabase(): void {
  const dbPath = join(app.getPath('userData'), 'spec-code.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS recent_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      opened_at TEXT NOT NULL
    )
  `)
}

export function getDb(): Database.Database {
  return db
}
