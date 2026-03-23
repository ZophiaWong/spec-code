## MODIFIED Requirements

### Requirement: Left sidebar placeholder
The left sidebar SHALL display the session list for the currently opened repo instead of the "Left Panel" placeholder. It SHALL include a "New Session" button at the top and list existing sessions below, each showing the session title and last-updated time.

#### Scenario: Repo open — session list in left sidebar
- **WHEN** a repo is opened
- **THEN** the left sidebar shows a "New Session" button and a list of sessions for that repo

#### Scenario: No repo open — left sidebar empty
- **WHEN** no repo is open
- **THEN** the left sidebar is hidden or shows a minimal empty state

### Requirement: Center panel shows repo info or welcome
The center panel SHALL display the welcome screen when no repo is open, repo information when a repo is open but no session is active, and the chat/run view when a session is active.

#### Scenario: No repo open — welcome screen
- **WHEN** no repo is currently open
- **THEN** the center panel displays the welcome screen with the recent projects list and an "Open Repo" button

#### Scenario: Repo open, no active session — repo info
- **WHEN** a repo is open but no session is selected
- **THEN** the center panel displays the repo name, current branch, and last commit info

#### Scenario: Repo open, session active — chat/run view
- **WHEN** a repo is open and a session is selected
- **THEN** the center panel displays the chat/run view for that session
