## ADDED Requirements

### Requirement: Render unified diff for a selected file
The center panel SHALL display a unified diff view when a file is selected from the Changed Files panel. The diff SHALL show added lines (green), removed lines (red), and context lines with line numbers for both old and new versions.

#### Scenario: Diff displayed for modified file
- **WHEN** the user selects a modified file from the Changed Files panel
- **THEN** the center panel renders a unified diff with highlighted additions and deletions

#### Scenario: Diff displayed for added file
- **WHEN** the user selects a newly added file
- **THEN** the diff viewer shows all lines as additions (green)

#### Scenario: Diff displayed for deleted file
- **WHEN** the user selects a deleted file
- **THEN** the diff viewer shows all lines as deletions (red)

### Requirement: Diff content fetched from main process
The diff viewer SHALL fetch diff content via the `diff:file-content` IPC channel, passing the run ID and file path. The main process SHALL return the raw unified diff string.

#### Scenario: diff:file-content returns diff string
- **WHEN** the renderer calls `diff:file-content` with `{ runId, filePath }`
- **THEN** the main process returns the unified diff string for that file against the pre-apply checkpoint

### Requirement: Large diff handling
When a diff exceeds 10,000 lines, the diff viewer SHALL show a truncation notice with the option to load the full diff on demand.

#### Scenario: Diff exceeds line limit
- **WHEN** a file's diff has more than 10,000 lines
- **THEN** the viewer shows the first 10,000 lines plus a "Show full diff" button

#### Scenario: User loads full diff
- **WHEN** the user clicks "Show full diff"
- **THEN** the complete diff is rendered

### Requirement: Navigation back to previous center view
The diff viewer SHALL include a back/close action that returns the center panel to its previous view (chat/run, spec detail, etc.).

#### Scenario: Close diff viewer
- **WHEN** the user clicks the close/back button in the diff viewer
- **THEN** the center panel returns to the view that was active before the diff was opened
