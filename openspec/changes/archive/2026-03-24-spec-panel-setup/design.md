## Context

The app currently has a three-panel layout with session list in the left sidebar, chat/run view in the center, and a placeholder right sidebar. The left sidebar already has collapsed "Specs" and "Changes" sections with placeholder text. The `openspec/` directory in each repo contains `specs/<name>/spec.md` files and `changes/<name>/` directories with artifacts. Phase 4 wires these filesystem structures into the UI.

## Goals / Non-Goals

**Goals:**
- Users can browse specs and changes from the left sidebar without leaving the app
- Clicking a spec/change shows rendered detail in the center panel
- Users can scaffold new specs/changes from the UI
- Users can launch a plan-mode run seeded with context from a change's tasks

**Non-Goals:**
- Editing spec files inline (they're authored via agent or external editor)
- Syncing delta specs to main specs from the UI
- Real-time file watching for spec changes (manual refresh is fine for now)

## Decisions

### 1. Read openspec directory via main process filesystem, not SQLite

**Decision**: Specs and changes are read directly from the repo's `openspec/` directory using Node.js `fs` in the main process, served to the renderer via IPC.

**Rationale**: Specs live in the repo filesystem (version-controlled). Duplicating them into SQLite would create sync issues. The openspec directory is small — a flat read on each repo open is fast enough.

**Alternative considered**: Indexing specs into SQLite on repo open. Rejected because it adds complexity and sync bugs for no meaningful performance gain.

### 2. Markdown rendering with `react-markdown`

**Decision**: Use `react-markdown` (with `remark-gfm`) to render spec markdown in the center panel.

**Rationale**: Lightweight, React-native, no DOM manipulation. Supports GFM tables and task lists which specs use. `marked` + `dangerouslySetInnerHTML` would work but introduces XSS surface area unnecessarily.

### 3. Center panel routing via Zustand view state, not React Router

**Decision**: Extend the existing Zustand store pattern with a `viewState` union type: `{ view: 'welcome' } | { view: 'repo-info' } | { view: 'session', sessionId } | { view: 'spec-detail', specName } | { view: 'change-detail', changeName }`.

**Rationale**: The app already uses Zustand for all state. Adding React Router for 5 view states would introduce routing concepts (URL, history) that don't map well to a desktop app with no URL bar. The view state is purely driven by sidebar selection.

### 4. New IPC channels for spec/change operations

**Decision**: Add these IPC channels:
- `spec:list` → returns `SpecSummary[]` (name, purpose line)
- `spec:read` → returns markdown content of a spec file
- `change:list` → returns `ChangeSummary[]` (name, schema, status, artifact list)
- `change:read-artifact` → returns markdown content of a specific artifact
- `change:create` → runs `openspec new change <name>` via child_process
- `spec:create` → scaffolds a new spec directory with empty `spec.md`

**Rationale**: Follows the existing IPC pattern. Main process handles all filesystem access; renderer only gets serialized data.

### 5. Spec/change store as a new Zustand store

**Decision**: Create `spec-store.ts` with: `specs: SpecSummary[]`, `changes: ChangeSummary[]`, `activeView: ViewState`, loading flags, and actions to load/refresh.

**Rationale**: Keeps spec UI state separate from session/run state. The store loads on repo open and refreshes after create operations.

## Risks / Trade-offs

**[No file watching]** → Users must manually refresh (or we refresh on window focus) to see external spec changes. Acceptable for Phase 4; file watching can be added later.

**[openspec CLI dependency for change:create]** → Requires `openspec` to be installed and on PATH in the main process environment. Mitigation: detect missing CLI and show a helpful error.

**[Markdown rendering security]** → `react-markdown` doesn't execute scripts by default, but we should avoid `rehype-raw` to prevent HTML injection from spec files. Mitigation: only use `remark-gfm`, no raw HTML plugin.
