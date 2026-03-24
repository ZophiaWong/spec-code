## ADDED Requirements

### Requirement: List specs from repo openspec directory
The system SHALL provide an IPC handler `spec:list` that reads the `openspec/specs/` directory of the currently opened repo and returns a `SpecSummary[]`. Each summary SHALL include the spec's `name` (directory name) and `purpose` (first non-heading line from `spec.md`).

#### Scenario: Specs listed for open repo
- **WHEN** a repo is opened that has `openspec/specs/` with spec directories
- **THEN** the IPC handler returns a `SpecSummary[]` with one entry per spec directory, each containing name and purpose

#### Scenario: No openspec directory
- **WHEN** a repo is opened that has no `openspec/` directory
- **THEN** the IPC handler returns an empty array

### Requirement: Display spec list in left sidebar
The left sidebar SHALL display the list of specs under a collapsible "Specs" section. Each item SHALL show the capability name. Clicking a spec item SHALL set the center panel to display that spec's detail view.

#### Scenario: Spec items shown in sidebar
- **WHEN** the spec list is loaded for the current repo
- **THEN** the left sidebar "Specs" section shows each spec name as a clickable item

#### Scenario: Clicking spec item opens detail
- **WHEN** the user clicks a spec name in the sidebar
- **THEN** the center panel switches to the spec detail view for that spec

#### Scenario: No specs available
- **WHEN** the repo has no specs
- **THEN** the "Specs" section shows "No specs found"

### Requirement: Read and display spec detail
The system SHALL provide an IPC handler `spec:read` that returns the full markdown content of a spec file given a spec name. The renderer SHALL render this markdown in the center panel as formatted HTML.

#### Scenario: Spec detail rendered
- **WHEN** the user selects a spec from the sidebar
- **THEN** the center panel displays the spec's markdown content rendered as formatted HTML with headings, lists, and scenario blocks

#### Scenario: Spec file not found
- **WHEN** a spec name is requested but its `spec.md` file does not exist
- **THEN** the center panel shows an error message "Spec file not found"

### Requirement: Spec store in renderer
The renderer SHALL maintain spec-related state in a Zustand store holding: the list of `SpecSummary` objects, loading state, and a `loadSpecs(repoPath)` action that fetches specs via IPC.

#### Scenario: Store populated on repo open
- **WHEN** a repo is opened
- **THEN** the spec store loads the spec list for that repo

#### Scenario: Store cleared on repo change
- **WHEN** the user opens a different repo
- **THEN** the spec store is cleared and reloaded with the new repo's specs

### Requirement: SpecSummary and related types
The `SpecSummary` type SHALL be defined in `src/shared/types.ts` with fields: `name` (string) and `purpose` (string).

#### Scenario: Type available for use
- **WHEN** components or IPC handlers need to reference spec data
- **THEN** they import `SpecSummary` from `src/shared/types.ts`
