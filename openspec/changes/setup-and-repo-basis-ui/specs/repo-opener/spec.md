## ADDED Requirements

### Requirement: Open folder via native dialog
The system SHALL open a native OS folder picker dialog when the user triggers "Open Repo". The dialog SHALL allow selecting exactly one directory.

#### Scenario: User selects a folder
- **WHEN** the user selects a folder in the native dialog
- **THEN** the system validates whether the folder is a git repository

#### Scenario: User cancels the dialog
- **WHEN** the user cancels the folder picker dialog
- **THEN** no action is taken and the current view remains unchanged

### Requirement: Git repository detection
The system SHALL validate that a selected folder contains a git repository by checking for a `.git` directory or valid git metadata. The system SHALL use `simple-git` for git operations.

#### Scenario: Valid git repo selected
- **WHEN** the selected folder is a valid git repository
- **THEN** the system opens the repo workspace and extracts repo metadata

#### Scenario: Non-git folder selected
- **WHEN** the selected folder is NOT a git repository
- **THEN** the system displays an error message: "Selected folder is not a git repository" and does NOT navigate away from the current view

### Requirement: Repo metadata extraction
Upon opening a valid git repo, the system SHALL extract and provide: repository name (folder name), current branch name, and latest commit hash + message.

#### Scenario: Metadata displayed after opening
- **WHEN** a valid git repo is opened
- **THEN** the center panel displays the repo name, current branch, and last commit info

### Requirement: Repo context available to renderer
The current repo state (path, name, branch, last commit) SHALL be held in a Zustand store and accessible to all renderer components.

#### Scenario: Store updated on repo open
- **WHEN** a repo is successfully opened
- **THEN** the `repoStore` is updated with the repo's path, name, currentBranch, and lastCommit

#### Scenario: Store cleared when no repo open
- **WHEN** no repo is open (app start or after closing)
- **THEN** the `repoStore` holds null/empty values

### Requirement: IPC contract for repo operations
The main process SHALL expose IPC handlers: `repo:open` (triggers dialog + validation), `repo:getInfo` (returns metadata for a given path). Request/response types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: repo:open returns repo info
- **WHEN** the renderer calls `repo:open`
- **THEN** the main process opens the dialog, validates, and returns `{ path, name, branch, lastCommit }` or `{ error }` if invalid

#### Scenario: repo:getInfo for a known path
- **WHEN** the renderer calls `repo:getInfo` with a valid repo path
- **THEN** the main process returns current metadata for that repo
