## MODIFIED Requirements

### Requirement: Right sidebar placeholder
The right sidebar SHALL display the **Changed Files panel** at the top (listing files modified during the active session's most recent apply run), a **Checkpoint list** in the middle (with Rewind action), and a **Verify button** with results summary at the bottom. When no session is active, the right sidebar SHALL show a minimal empty state. The right sidebar SHALL occupy approximately 20% of the window width with a minimum of 240px.

#### Scenario: Right sidebar shows diff/verify/checkpoint panels
- **WHEN** a session is active and an apply run has completed
- **THEN** the right sidebar shows Changed Files at the top, Checkpoints in the middle, and Verify at the bottom

#### Scenario: Right sidebar empty state
- **WHEN** no session is active
- **THEN** the right sidebar shows a minimal empty state message

#### Scenario: Right sidebar minimum width
- **WHEN** the window is resized
- **THEN** the right sidebar maintains a minimum width of 240px

### Requirement: Center panel shows repo info or welcome
The center panel SHALL display the appropriate view based on the current navigation state: the welcome screen when no repo is open, repo information when a repo is open but nothing is selected, the chat/run view when a session is active, the spec detail view when a spec is selected, the change detail view when a change is selected, or the **diff viewer** when a changed file is selected from the right sidebar.

#### Scenario: No repo open — welcome screen
- **WHEN** no repo is currently open
- **THEN** the center panel displays the welcome screen with the recent projects list and an "Open Repo" button

#### Scenario: Repo open, no selection — repo info
- **WHEN** a repo is open but no session, spec, or change is selected
- **THEN** the center panel displays the repo name, current branch, and last commit info

#### Scenario: Repo open, session active — chat/run view
- **WHEN** a repo is open and a session is selected
- **THEN** the center panel displays the chat/run view for that session

#### Scenario: Spec selected — spec detail view
- **WHEN** a spec is selected from the left sidebar
- **THEN** the center panel displays the rendered spec detail view

#### Scenario: Change selected — change detail view
- **WHEN** a change is selected from the left sidebar
- **THEN** the center panel displays the change detail view with artifact list

#### Scenario: Changed file selected — diff viewer
- **WHEN** a file is selected from the Changed Files panel in the right sidebar
- **THEN** the center panel displays the diff viewer for that file
