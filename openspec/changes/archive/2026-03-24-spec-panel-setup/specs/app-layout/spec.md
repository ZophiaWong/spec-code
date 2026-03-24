## MODIFIED Requirements

### Requirement: Left sidebar placeholder
The left sidebar SHALL display three collapsible sections: **Sessions** (the session list for the current repo), **Specs** (the spec list for the current repo), and **Changes** (the active change list for the current repo). Each section header SHALL be clickable to expand/collapse, and the Specs and Changes headers SHALL include a "+" button to create new items. When no repo is open, the left sidebar is hidden or shows a minimal empty state.

#### Scenario: Repo open — three sections visible
- **WHEN** a repo is opened
- **THEN** the left sidebar shows Sessions, Specs, and Changes sections, each populated with data from the repo

#### Scenario: No repo open — left sidebar empty
- **WHEN** no repo is open
- **THEN** the left sidebar is hidden or shows a minimal empty state

#### Scenario: Sections are collapsible
- **WHEN** the user clicks a section header
- **THEN** the section toggles between expanded and collapsed

### Requirement: Center panel shows repo info or welcome
The center panel SHALL display the appropriate view based on the current navigation state: the welcome screen when no repo is open, repo information when a repo is open but nothing is selected, the chat/run view when a session is active, the spec detail view when a spec is selected, or the change detail view when a change is selected.

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
