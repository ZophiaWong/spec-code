## Why

Spec Code has no runnable application yet. Before any of the 5 core capabilities can be built, we need a desktop shell that can open a local git repository, persist recent-project history, and present the foundational three-panel layout. This is Phase 1 of the MVP — "像一个真正 app".

## What Changes

- Initialize an Electron + React + TypeScript project with build tooling (Vite).
- Create the main window with a left / center / right three-panel layout shell.
- Implement "Open Repo" flow: native folder picker → validate the folder is a git repo → load repo metadata.
- Persist recently-opened projects in a local SQLite database and display them on a welcome/start screen.
- Display basic repo info (name, current branch, last commit) in the center panel after opening.

## Non-goals

- No agent runtime, session, or spec execution in this phase.
- No file tree browsing or code editing.
- No cloud/account features.
- No real content in the left or right panels beyond placeholder shells.

## Capabilities

### New Capabilities
- `electron-shell`: Electron main process bootstrap, window management, native menus, IPC bridge.
- `repo-opener`: Open-folder dialog, git repo detection, repo metadata extraction, and repo-context provider.
- `recent-projects`: SQLite-backed recent-project list with add/read/clear operations and a start-screen UI.
- `app-layout`: Three-panel responsive layout shell (left sidebar, center main, right sidebar) with panel placeholders.

### Modified Capabilities
<!-- None — greenfield project, no existing specs. -->

## Impact

- **New dependencies**: electron, electron-builder/forge, react, vite, better-sqlite3 (or drizzle + better-sqlite3), simple-git.
- **New project scaffolding**: `src/main/` (Electron main), `src/renderer/` (React UI), `src/shared/` (types/IPC contracts).
- **Build & dev**: Vite dev server with Electron hot-reload; production packaging via electron-builder.
- **Affected panels**: Welcome/start screen (center panel), left sidebar (placeholder), right sidebar (placeholder).
