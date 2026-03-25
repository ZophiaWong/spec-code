# Capability: Changed Files Panel

## Purpose
Display files changed by apply runs and enable quick navigation to file-level diffs.

## Requirements

### Requirement: Display changed files for the active run
The right sidebar SHALL display a list of files changed during the current or most recent completed apply run. Each file entry SHALL show the file path (relative to repo root) and a status indicator: **A** (added), **M** (modified), **D** (deleted). The list SHALL update in real time as the run progresses.

#### Scenario: Changed files appear after apply run
- **WHEN** an apply-mode run completes
- **THEN** the Changed Files panel lists all files that differ from the pre-apply checkpoint, each with the correct A/M/D status

#### Scenario: Real-time updates during apply run
- **WHEN** an apply-mode run is in progress and the agent modifies a file
- **THEN** the Changed Files panel updates to include the newly modified file within 2 seconds

#### Scenario: No changes — empty state
- **WHEN** an apply run completes but no files were changed
- **THEN** the Changed Files panel shows "No files changed" message

### Requirement: Select a file to view its diff
The user SHALL be able to click a file in the Changed Files panel to open its diff in the center panel. The currently selected file SHALL be visually highlighted.

#### Scenario: Click file opens diff
- **WHEN** the user clicks a file entry in the Changed Files panel
- **THEN** the center panel switches to the diff viewer showing that file's changes
- **AND** the file entry is highlighted in the list

### Requirement: Changed files scoped to session
The Changed Files panel SHALL show files from the most recent apply run in the active session. When switching sessions, the panel SHALL update to reflect the new session's changes.

#### Scenario: Session switch updates changed files
- **WHEN** the user switches to a different session
- **THEN** the Changed Files panel updates to show files from that session's most recent apply run

### Requirement: Changed files IPC contract
The main process SHALL expose: `diff:changed-files` (returns changed file list for a run) and push `diff:files-updated` events during active runs. Types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: diff:changed-files returns file list
- **WHEN** the renderer calls `diff:changed-files` with `{ runId }`
- **THEN** the main process returns an array of `{ path: string, status: 'added' | 'modified' | 'deleted' }`

### Requirement: Changed files Zustand store
The renderer SHALL maintain changed files state in a Zustand store (`diffStore`) holding: the list of changed files, the currently selected file path, and loading state.

#### Scenario: Store populated on run completion
- **WHEN** an apply run completes
- **THEN** `diffStore.changedFiles` is populated with the changed file list from the main process
