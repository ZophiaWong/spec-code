## ADDED Requirements

### Requirement: Chat/run view in center panel
When a session is active, the center panel SHALL display a chat/run view consisting of a scrollable message area and a prompt input at the bottom.

#### Scenario: Session active shows chat view
- **WHEN** a session is selected and active
- **THEN** the center panel switches from repo info to the chat/run view

#### Scenario: No session active shows repo info
- **WHEN** no session is active but a repo is open
- **THEN** the center panel continues to display repo information

### Requirement: Display agent message stream
The chat/run view SHALL display run events as a chronological message list. Agent messages appear as text blocks. Tool-call events appear as collapsible log entries showing the tool name and a summary.

#### Scenario: Agent message displayed
- **WHEN** a run emits an `agent_message` event
- **THEN** a new message block appears in the chat area with the message text

#### Scenario: Tool call displayed as log entry
- **WHEN** a run emits a `tool_call` event
- **THEN** a collapsible entry appears showing the tool name and arguments summary

#### Scenario: Tool result displayed
- **WHEN** a run emits a `tool_result` event after a `tool_call`
- **THEN** the corresponding tool-call entry is updated to show the result (collapsed by default)

### Requirement: Prompt input to initiate a run
The chat/run view SHALL include a text input area at the bottom where the user can type a prompt and submit it to start a new run in the active session.

#### Scenario: User submits a prompt
- **WHEN** the user types a prompt and presses Enter (or clicks Send)
- **THEN** a new run is initiated in the active session with the entered prompt text
- **AND** the input is cleared

#### Scenario: Empty prompt rejected
- **WHEN** the user attempts to submit an empty prompt
- **THEN** no run is created and the input remains focused

### Requirement: Run status indicator
The chat/run view SHALL display the current run's status. While a run is in progress, a visual indicator (e.g., spinner or "Running..." label) SHALL be shown. When the run completes or fails, the indicator updates accordingly.

#### Scenario: Run in progress
- **WHEN** a run has status `running`
- **THEN** a spinner or "Running..." indicator is visible in the chat area

#### Scenario: Run completed
- **WHEN** a run finishes with status `completed`
- **THEN** the indicator shows "Completed" and the prompt input is re-enabled

#### Scenario: Run failed
- **WHEN** a run finishes with status `failed`
- **THEN** the indicator shows an error state with the error message

### Requirement: Auto-scroll to latest event
The message area SHALL auto-scroll to the bottom when new events arrive, unless the user has manually scrolled up.

#### Scenario: New event arrives while at bottom
- **WHEN** a new event arrives and the user is scrolled to the bottom
- **THEN** the view auto-scrolls to show the new event

#### Scenario: New event arrives while scrolled up
- **WHEN** a new event arrives and the user has scrolled up
- **THEN** the view does NOT auto-scroll (preserving the user's scroll position)

### Requirement: Run history in session
When a session is loaded, the chat/run view SHALL display events from all previous runs in chronological order, followed by any active run's live events.

#### Scenario: Session with previous runs loaded
- **WHEN** the user selects a session that has past runs
- **THEN** the chat area shows all previous run prompts and their events in order
