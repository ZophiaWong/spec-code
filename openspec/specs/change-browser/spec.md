# change-browser Specification

## Purpose
TBD - created by archiving change spec-panel-setup. Update Purpose after archive.
## Requirements
### Requirement: List changes from repo openspec directory
The system SHALL provide an IPC handler `change:list` that reads the `openspec/changes/` directory of the currently opened repo (excluding the `archive/` subdirectory) and returns a `ChangeSummary[]`. Each summary SHALL include: `name` (directory name), `status` (derived from `.openspec.yaml` or artifact presence), and `artifacts` (list of artifact IDs with their completion status).

#### Scenario: Changes listed for open repo
- **WHEN** a repo is opened that has `openspec/changes/` with change directories
- **THEN** the IPC handler returns a `ChangeSummary[]` with one entry per non-archived change

#### Scenario: Archived changes excluded
- **WHEN** the `openspec/changes/archive/` directory contains archived changes
- **THEN** those changes are NOT included in the `change:list` response

#### Scenario: No changes directory
- **WHEN** a repo has no `openspec/changes/` directory or it is empty
- **THEN** the IPC handler returns an empty array

### Requirement: Display change list in left sidebar
The left sidebar SHALL display the list of active changes under a collapsible "Changes" section. Each item SHALL show the change name and a status indicator (e.g., artifact count completed). Clicking a change item SHALL set the center panel to display that change's detail view.

#### Scenario: Change items shown in sidebar
- **WHEN** the change list is loaded for the current repo
- **THEN** the left sidebar "Changes" section shows each change name with status

#### Scenario: Clicking change item opens detail
- **WHEN** the user clicks a change name in the sidebar
- **THEN** the center panel switches to the change detail view for that change

#### Scenario: No active changes
- **WHEN** the repo has no active changes
- **THEN** the "Changes" section shows "No active changes"

### Requirement: Read and display change detail
The system SHALL provide an IPC handler `change:read-artifact` that returns the markdown content of a specific artifact (proposal, design, tasks, or a spec file) within a change directory. The center panel SHALL display a change detail view showing all artifacts with their status and allowing the user to expand any artifact to see its rendered markdown content.

#### Scenario: Change detail view with artifacts
- **WHEN** the user selects a change from the sidebar
- **THEN** the center panel shows the change name, a list of artifacts (proposal, design, specs, tasks) with done/pending/blocked indicators

#### Scenario: Expanding an artifact
- **WHEN** the user clicks on a completed artifact in the change detail view
- **THEN** the artifact's markdown content is fetched and rendered inline

#### Scenario: Artifact not yet created
- **WHEN** an artifact has status "blocked" or "ready" (not yet created)
- **THEN** it is shown with a dimmed label and no expandable content

### Requirement: Change store in renderer
The renderer SHALL maintain change-related state in the same Zustand store as specs, adding: the list of `ChangeSummary` objects, loading state, and a `loadChanges(repoPath)` action.

#### Scenario: Store populated on repo open
- **WHEN** a repo is opened
- **THEN** the change store loads the change list for that repo

#### Scenario: Store refreshed after change creation
- **WHEN** a new change is created via the UI
- **THEN** the change store is refreshed to include the new change

### Requirement: ChangeSummary and related types
The `ChangeSummary` type SHALL be defined in `src/shared/types.ts` with fields: `name` (string), `status` (string), and `artifacts` (array of `{ id: string, status: string }`).

#### Scenario: Type available for use
- **WHEN** components or IPC handlers need to reference change data
- **THEN** they import `ChangeSummary` from `src/shared/types.ts`

