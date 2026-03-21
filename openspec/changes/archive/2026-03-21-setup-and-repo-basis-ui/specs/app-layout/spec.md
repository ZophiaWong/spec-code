## ADDED Requirements

### Requirement: Three-panel layout structure
The workspace view SHALL use a three-panel layout: left sidebar, center main panel, and right sidebar. The layout SHALL fill the entire window viewport.

#### Scenario: Panels visible after opening a repo
- **WHEN** a repo is opened and the workspace view is displayed
- **THEN** three panels are visible: left sidebar, center main area, and right sidebar

#### Scenario: Layout fills viewport
- **WHEN** the window is resized
- **THEN** the three-panel layout adjusts to fill the full window area

### Requirement: Left sidebar placeholder
The left sidebar SHALL display a placeholder label "Left Panel" in Phase 1. It SHALL occupy approximately 20% of the window width with a minimum of 180px.

#### Scenario: Left sidebar visible with placeholder
- **WHEN** the workspace view is displayed
- **THEN** the left sidebar shows "Left Panel" placeholder text

### Requirement: Right sidebar placeholder
The right sidebar SHALL display a placeholder label "Right Panel" in Phase 1. It SHALL occupy approximately 20% of the window width with a minimum of 180px.

#### Scenario: Right sidebar visible with placeholder
- **WHEN** the workspace view is displayed
- **THEN** the right sidebar shows "Right Panel" placeholder text

### Requirement: Center panel shows repo info or welcome
The center panel SHALL display the welcome screen (with recent projects) when no repo is open, and repo information when a repo is open.

#### Scenario: No repo open — welcome screen
- **WHEN** no repo is currently open
- **THEN** the center panel displays the welcome screen with the recent projects list and an "Open Repo" button

#### Scenario: Repo open — repo info displayed
- **WHEN** a repo is open
- **THEN** the center panel displays the repo name, current branch, and last commit info

### Requirement: Welcome screen has Open Repo action
The welcome screen SHALL include a prominent "Open Repo" button that triggers the folder picker dialog.

#### Scenario: Open Repo button triggers dialog
- **WHEN** the user clicks the "Open Repo" button on the welcome screen
- **THEN** the native folder picker dialog opens
