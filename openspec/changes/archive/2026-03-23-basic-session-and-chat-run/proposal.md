## Why

Phase 1 gave us a static desktop shell that can open repos and show basic info. To become a useful coding agent, the app needs the ability to manage working sessions and execute agent tasks within them. Users need to start tasks, see agent activity in real-time, and resume sessions after restarting the app.

## What Changes

- Introduce a session model: create, continue, and fork sessions tied to a repo
- Add a session list in the left sidebar for navigating between sessions
- Build a chat/run panel in the center that streams agent messages and tool-call logs
- Persist sessions and runs in SQLite so they survive app restarts
- Wire up IPC contracts for session and run lifecycle between main and renderer

## Capabilities

### New Capabilities
- `session-management`: Session CRUD — create, list, continue, fork, and persist sessions tied to a repo
- `chat-run-panel`: Center panel UI that displays agent message stream, tool-call logs, and run status
- `run-engine`: Run lifecycle — initiate a run within a session, stream agent events, and persist run records

### Modified Capabilities
- `app-layout`: Left sidebar changes from placeholder to session list; center panel conditionally shows chat/run view when a session is active

## Non-goals

- Actual AI agent integration (Claude API calls) — this phase uses mock/stub agent responses
- Spec panel or diff/verify/rewind features (Phase 3+)
- Multi-repo or multi-window support
- Run cancellation or retry logic
- Rich message rendering (markdown, code blocks) — plain text is sufficient for now

## Impact

- **UI panels affected**: Left sidebar (session list), Center panel (chat/run view)
- **Data**: New SQLite tables for `sessions` and `runs`; new IPC channels for session/run operations
- **Dependencies**: No new external dependencies expected; agent stub runs in-process
- **Code**: New stores (`sessionStore`, `runStore`), new main-process services, new IPC handlers, new renderer components
