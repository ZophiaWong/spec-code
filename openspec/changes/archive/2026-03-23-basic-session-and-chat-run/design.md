## Context

Phase 1 established the Electron shell with repo opening, recent projects (SQLite), and a three-panel layout. The app is currently a static viewer — it can open repos and display info but cannot execute any tasks. Phase 2 adds the session and run layer that turns it into an interactive agent workspace.

Current architecture:
- Main process: IPC handlers for repo/project operations, SQLite via `better-sqlite3`, git via `simple-git`
- Renderer: Zustand stores (`repoStore`, `projectsStore`), React components, three-panel layout
- Shared: typed IPC channels in `src/shared/ipc.ts`, types in `src/shared/types.ts`

## Goals / Non-Goals

**Goals:**
- Users can create, list, continue, and fork sessions within an opened repo
- Users can initiate a run (task) within a session and see streamed agent messages and tool-call logs
- Sessions and runs persist in SQLite and survive app restarts
- Left sidebar becomes a navigable session list
- Center panel shows a chat/run view when a session is active

**Non-Goals:**
- Real AI agent integration — runs use a stub/mock agent that emits fake events
- Rich message rendering (markdown, syntax highlighting)
- Run cancellation, retry, or branching
- Multi-window or multi-repo sessions

## Decisions

### 1. Session and run data model in SQLite

Add two tables to the existing SQLite database:

```sql
sessions (
  id TEXT PRIMARY KEY,        -- UUID
  repo_path TEXT NOT NULL,
  title TEXT NOT NULL,
  parent_session_id TEXT,     -- NULL unless forked
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)

runs (
  id TEXT PRIMARY KEY,        -- UUID
  session_id TEXT NOT NULL REFERENCES sessions(id),
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,        -- 'running' | 'completed' | 'failed'
  created_at TEXT NOT NULL,
  finished_at TEXT
)

run_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES runs(id),
  type TEXT NOT NULL,          -- 'agent_message' | 'tool_call' | 'tool_result' | 'error'
  payload TEXT NOT NULL,       -- JSON blob
  created_at TEXT NOT NULL
)
```

**Why**: SQLite is already in use for recent_projects. Keeping sessions/runs in the same DB is simpler than introducing a new storage layer. `run_events` is append-only which aligns well with WAL mode.

**Alternative considered**: Filesystem-based session storage (JSON files). Rejected because querying/listing sessions by repo would be cumbersome and we already have SQLite set up.

### 2. IPC streaming via Electron event emitter pattern

Run events stream from main → renderer using `webContents.send()` on a channel like `run:event`. The renderer subscribes via `ipcRenderer.on()` in the preload bridge. This is a push model — no polling.

**Why**: Electron's built-in IPC supports both request/response (`invoke`/`handle`) and push (`send`/`on`). Using push for streaming events is the natural Electron pattern.

**Alternative considered**: WebSocket between main and renderer. Rejected — unnecessary complexity when IPC is built in.

### 3. Stub agent in main process

The run engine will use a `StubAgent` class that emits a scripted sequence of events (messages + tool calls) with small delays to simulate streaming. This keeps the architecture ready for real agent integration in Phase 3 without requiring API keys or external dependencies now.

**Why**: Lets us build and test the full UI pipeline end-to-end without external dependencies.

### 4. Zustand stores for session and run state

Two new renderer stores:
- `sessionStore`: current session, session list for the active repo
- `runStore`: current run, event stream, run history for the active session

**Why**: Consistent with existing `repoStore` and `projectsStore` patterns.

### 5. Left sidebar shows session list when repo is open

The left sidebar transitions from a placeholder to a session list. It shows sessions for the currently opened repo, with a "New Session" button.

**Why**: The left sidebar is the natural home for navigation/lists (proposal specifies this panel).

## Risks / Trade-offs

- **[Stub fidelity]** → The stub agent may not accurately represent real agent behavior (timing, error patterns). Mitigation: design the event interface to match the Anthropic Agent SDK event shape from the start.
- **[Event table growth]** → `run_events` could grow large for long sessions. Mitigation: acceptable for MVP; can add pagination or cleanup later.
- **[Session/repo coupling]** → Sessions are tied to `repo_path` as a string. If the repo moves, sessions become orphaned. Mitigation: acceptable for MVP; same approach as `recent_projects`.

## Open Questions

- Should forked sessions copy the parent's run history or start empty? (Leaning toward: start empty, with a reference to the parent for context.)
