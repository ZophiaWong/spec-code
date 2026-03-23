## 1. Data Layer — Schema & Types

- [x] 1.1 Add `sessions`, `runs`, and `run_events` tables to SQLite init in `src/main/db/index.ts` | data
- [x] 1.2 Add Session, Run, RunEvent, and RunEventType types to `src/shared/types.ts` | data
- [x] 1.3 Add session and run IPC channels and API methods to `src/shared/ipc.ts` | data

## 2. Main Process — Session Service

- [x] 2.1 Create `src/main/db/sessions.ts` with create, list, and fork operations | runtime
- [x] 2.2 Register IPC handlers for `session:create`, `session:list`, `session:fork` in `src/main/ipc/index.ts` | runtime
- [x] 2.3 Expose session IPC methods in preload script `src/preload/index.ts` | desktop

## 3. Main Process — Run Engine & Stub Agent

- [x] 3.1 Create `src/main/db/runs.ts` with run and event CRUD operations | runtime
- [x] 3.2 Create `src/main/agent/stub.ts` — stub agent that emits scripted events with delays | runtime
- [x] 3.3 Create `src/main/agent/run-engine.ts` — orchestrates run lifecycle (create record → invoke agent → persist events → update status) | runtime
- [x] 3.4 Register IPC handlers for `run:start`, `run:list`, `run:events` and push `run:event` channel in `src/main/ipc/index.ts` | runtime
- [x] 3.5 Expose run IPC methods and `run:event` listener in preload script | desktop

## 4. Renderer — Stores

- [x] 4.1 Create `src/renderer/stores/session-store.ts` with session list, active session, and IPC-backed actions | desktop
- [x] 4.2 Create `src/renderer/stores/run-store.ts` with run list, live events, and IPC event subscription | desktop

## 5. Renderer — UI Components

- [x] 5.1 Create `src/renderer/components/SessionList.tsx` — session list with "New Session" button, fork action, click to activate | desktop
- [x] 5.2 Update `src/renderer/components/LeftSidebar.tsx` to render SessionList when a repo is open | desktop
- [x] 5.3 Create `src/renderer/components/ChatRunView.tsx` — scrollable message area with auto-scroll and prompt input | desktop
- [x] 5.4 Create `src/renderer/components/RunEventItem.tsx` — renders a single event (message block or collapsible tool-call entry) | desktop
- [x] 5.5 Create `src/renderer/components/RunStatusIndicator.tsx` — spinner/completed/failed indicator | desktop
- [x] 5.6 Update `src/renderer/pages/WorkspacePage.tsx` to show ChatRunView when a session is active, repo info otherwise | desktop

## 6. Integration & Verification

- [x] 6.1 Wire up session load on repo open — when a repo is opened, auto-fetch sessions for that repo path | desktop
- [x] 6.2 Wire up run history load on session select — when a session is activated, load its runs and events | desktop
- [x] 6.3 End-to-end manual test: open repo → create session → submit prompt → see streamed events → close and reopen → verify persistence | desktop
