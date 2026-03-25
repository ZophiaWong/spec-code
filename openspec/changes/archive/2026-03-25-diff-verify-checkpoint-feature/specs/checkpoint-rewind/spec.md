## ADDED Requirements

### Requirement: Auto-checkpoint before apply runs
The system SHALL automatically create a checkpoint (git snapshot) of the repo's working state before each apply-mode run begins. The checkpoint SHALL be stored as a git tag named `spec-code/checkpoint/<runId>`.

#### Scenario: Checkpoint created before apply
- **WHEN** an apply-mode run is about to start
- **THEN** a checkpoint tag `spec-code/checkpoint/<runId>` is created capturing the current working tree and index state
- **AND** a checkpoint record is persisted in SQLite

#### Scenario: Checkpoint not created for plan runs
- **WHEN** a plan-mode run starts
- **THEN** no checkpoint is created (plan runs are read-only)

### Requirement: Checkpoint list display
The right sidebar SHALL display a list of checkpoints for the active session, ordered by creation time (newest first). Each entry SHALL show the associated run's prompt (truncated) and timestamp.

#### Scenario: Checkpoints visible in sidebar
- **WHEN** the user has completed multiple apply runs in a session
- **THEN** the right sidebar shows a list of checkpoints with run prompts and timestamps

#### Scenario: No checkpoints — empty state
- **WHEN** no apply runs have been made in the session
- **THEN** the checkpoint list shows "No checkpoints yet"

### Requirement: Rewind to checkpoint
The user SHALL be able to select a checkpoint and click "Rewind" to restore the repo to that checkpoint's state. Rewind SHALL restore the working tree and index to match the checkpoint snapshot.

#### Scenario: Rewind restores repo state
- **WHEN** the user selects a checkpoint and clicks "Rewind"
- **THEN** the repo working tree and index are restored to the state captured by that checkpoint
- **AND** the Changed Files panel updates to reflect the restored state

#### Scenario: Rewind confirmation
- **WHEN** the user clicks "Rewind"
- **THEN** a confirmation dialog appears: "Rewind to checkpoint from [timestamp]? Current uncommitted changes will be overwritten."

#### Scenario: Rewind cancelled
- **WHEN** the user dismisses the confirmation dialog
- **THEN** no changes are made to the repo

### Requirement: Rewind disabled during active run
The Rewind button SHALL be disabled while any run is in `running` state.

#### Scenario: Rewind disabled during run
- **WHEN** a run is active
- **THEN** the Rewind button is disabled

### Requirement: Checkpoint persistence in SQLite
Checkpoints SHALL be stored in a `checkpoints` table with columns: `id` (TEXT PRIMARY KEY), `run_id` (TEXT), `session_id` (TEXT), `tag_name` (TEXT), `created_at` (TEXT ISO-8601).

#### Scenario: Checkpoint persists across restart
- **WHEN** the app is restarted
- **THEN** checkpoint records are loaded from SQLite and the corresponding git tags still exist

### Requirement: Checkpoint cleanup on session delete
When a session is deleted, all associated checkpoint tags SHALL be removed from the repo and checkpoint records deleted from SQLite.

#### Scenario: Session deleted cleans up checkpoints
- **WHEN** a session is deleted
- **THEN** all `spec-code/checkpoint/*` tags for that session's runs are deleted from git
- **AND** checkpoint records are removed from SQLite

### Requirement: Checkpoint IPC contract
The main process SHALL expose: `checkpoint:list` (list checkpoints for a session), `checkpoint:rewind` (restore to a checkpoint). Types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: checkpoint:list returns checkpoints
- **WHEN** the renderer calls `checkpoint:list` with `{ sessionId }`
- **THEN** the main process returns an array of checkpoint objects ordered by `created_at` desc

#### Scenario: checkpoint:rewind restores state
- **WHEN** the renderer calls `checkpoint:rewind` with `{ checkpointId }`
- **THEN** the main process restores the working tree from the checkpoint's git tag and returns success
