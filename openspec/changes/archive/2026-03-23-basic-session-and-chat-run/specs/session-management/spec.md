## ADDED Requirements

### Requirement: Create a new session
The system SHALL allow users to create a new session tied to the currently opened repo. Each session SHALL have a unique ID (UUID), a title (defaulting to "Session <N>"), and a reference to the repo path.

#### Scenario: User creates a new session
- **WHEN** the user clicks "New Session" in the left sidebar
- **THEN** a new session record is created in SQLite with the current repo path, a default title, and current timestamp
- **AND** the new session becomes the active session

#### Scenario: Session ID uniqueness
- **WHEN** a new session is created
- **THEN** it SHALL have a UUID that is unique across all sessions

### Requirement: List sessions for the current repo
The system SHALL provide an IPC handler `session:list` that returns all sessions for a given repo path, ordered by `updated_at` descending.

#### Scenario: Sessions listed for open repo
- **WHEN** a repo is opened
- **THEN** the left sidebar displays all sessions associated with that repo path, most recently updated first

#### Scenario: No sessions exist
- **WHEN** a repo is opened that has no sessions
- **THEN** the session list is empty and the sidebar shows a prompt to create the first session

### Requirement: Continue an existing session
The system SHALL allow users to select and continue a previously created session. Selecting a session loads its run history into the center panel.

#### Scenario: User selects a session from the list
- **WHEN** the user clicks a session in the left sidebar
- **THEN** that session becomes active, and the center panel displays its run history and chat view

### Requirement: Fork a session
The system SHALL allow users to fork an existing session. A forked session creates a new session record with `parent_session_id` set to the original session's ID. The forked session starts with no runs (empty).

#### Scenario: User forks a session
- **WHEN** the user triggers fork on an active session
- **THEN** a new session is created with `parent_session_id` referencing the original
- **AND** the new session has zero runs and becomes the active session

### Requirement: Persist sessions in SQLite
Sessions SHALL be stored in a `sessions` table with columns: `id` (TEXT PRIMARY KEY), `repo_path` (TEXT), `title` (TEXT), `parent_session_id` (TEXT nullable), `created_at` (TEXT ISO-8601), `updated_at` (TEXT ISO-8601).

#### Scenario: Session survives app restart
- **WHEN** the user creates a session, closes the app, and reopens it
- **THEN** the session appears in the session list for that repo

### Requirement: Session store in renderer
The renderer SHALL maintain a Zustand store (`sessionStore`) holding: the list of sessions for the current repo, the currently active session ID, and loading state.

#### Scenario: Store updated on session create
- **WHEN** a new session is created
- **THEN** `sessionStore` is updated with the new session in the list and it is set as active

#### Scenario: Store cleared on repo change
- **WHEN** the user opens a different repo
- **THEN** `sessionStore` is cleared and reloaded with sessions for the new repo

### Requirement: IPC contracts for session operations
The main process SHALL expose IPC handlers: `session:create` (creates a session for a repo), `session:list` (lists sessions for a repo), `session:fork` (forks a session). Request/response types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: session:create returns new session
- **WHEN** the renderer calls `session:create` with `{ repoPath, title? }`
- **THEN** the main process creates the record and returns the full session object

#### Scenario: session:list returns sessions for repo
- **WHEN** the renderer calls `session:list` with `{ repoPath }`
- **THEN** the main process returns an array of session objects ordered by `updated_at` desc
