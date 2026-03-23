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
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      repo_path TEXT NOT NULL,
      title TEXT NOT NULL,
      parent_session_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      prompt TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      finished_at TEXT
    );

    CREATE TABLE IF NOT EXISTS run_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL REFERENCES runs(id),
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
}

export function getDb(): Database.Database {
  return db
}
