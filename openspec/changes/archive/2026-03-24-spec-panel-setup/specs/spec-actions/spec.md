## ADDED Requirements

### Requirement: Create a new change from the UI
The system SHALL provide a "New Change" button in the left sidebar's "Changes" section header. Clicking it SHALL prompt the user for a change name (kebab-case), then invoke `openspec new change "<name>"` via `child_process.execFile` in the main process, and refresh the change list.

#### Scenario: User creates a new change
- **WHEN** the user clicks "New Change" and enters a name
- **THEN** the `openspec new change` CLI command is executed in the repo directory
- **AND** the change list is refreshed to show the new change

#### Scenario: Change creation fails
- **WHEN** the `openspec` CLI command fails (e.g., name already exists)
- **THEN** the error message is returned to the renderer and displayed to the user

#### Scenario: openspec CLI not found
- **WHEN** `openspec` is not available on PATH
- **THEN** the system returns an error indicating the CLI is not installed

### Requirement: Create a new spec from the UI
The system SHALL provide a "New Spec" button in the left sidebar's "Specs" section header. Clicking it SHALL prompt the user for a spec name (kebab-case), then create the directory `openspec/specs/<name>/` with an empty `spec.md` scaffold, and refresh the spec list.

#### Scenario: User creates a new spec
- **WHEN** the user clicks "New Spec" and enters a name
- **THEN** a new directory `openspec/specs/<name>/` is created with a scaffolded `spec.md`
- **AND** the spec list is refreshed to show the new spec

#### Scenario: Spec name already exists
- **WHEN** the user enters a spec name that already exists
- **THEN** an error is returned indicating the spec already exists

### Requirement: Launch plan run from change tasks
The change detail view SHALL include a "Start Plan" button visible when the change has a completed `tasks` artifact. Clicking it SHALL create a new session (or use the active one) and start a plan-mode run with a prompt that includes the change's task context.

#### Scenario: Start Plan button visible
- **WHEN** a change detail view is displayed and the `tasks` artifact is complete
- **THEN** a "Start Plan" button is visible

#### Scenario: Start Plan button hidden
- **WHEN** the `tasks` artifact is not yet complete
- **THEN** the "Start Plan" button is not displayed

#### Scenario: Launching a plan run from tasks
- **WHEN** the user clicks "Start Plan" on a change
- **THEN** a new plan-mode run is initiated with a prompt derived from the change's task list
- **AND** the center panel switches to the chat/run view showing the new run

### Requirement: IPC contracts for spec/change actions
The main process SHALL expose IPC handlers: `spec:create` (create a new spec scaffold), `change:create` (run `openspec new change`). Request/response types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: spec:create returns success
- **WHEN** the renderer calls `spec:create` with `{ repoPath, name }`
- **THEN** the main process creates the scaffold and returns `{ success: true, name }`

#### Scenario: change:create returns success
- **WHEN** the renderer calls `change:create` with `{ repoPath, name }`
- **THEN** the main process runs the CLI command and returns `{ success: true, name }`
