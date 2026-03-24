# Capability: Chat Run Panel (Delta)

## MODIFIED Requirements

### Requirement: Display agent message stream
The chat/run view SHALL display run events as a chronological message list. Agent messages appear as text blocks. Tool-call events appear as collapsible log entries showing the tool name and a summary. **Plan-output events** appear as a structured plan card showing numbered steps with titles, descriptions, and affected file lists. **Approval-request events** appear as a confirmation prompt with the risky command details and Confirm/Reject buttons.

#### Scenario: Agent message displayed
- **WHEN** a run emits an `agent_message` event
- **THEN** a new message block appears in the chat area with the message text

#### Scenario: Tool call displayed as log entry
- **WHEN** a run emits a `tool_call` event
- **THEN** a collapsible entry appears showing the tool name and arguments summary

#### Scenario: Tool result displayed
- **WHEN** a run emits a `tool_result` event after a `tool_call`
- **THEN** the corresponding tool-call entry is updated to show the result (collapsed by default)

#### Scenario: Plan output displayed as structured card
- **WHEN** a run emits a `plan_output` event
- **THEN** a plan card appears showing numbered steps, each with title, description, and affected files
- **AND** an "Approve & Apply" button is shown below the card (only if the run completed successfully)

#### Scenario: Approval request displayed as confirmation prompt
- **WHEN** a run emits an `approval_request` event
- **THEN** a confirmation card appears showing the risky command details with "Confirm" and "Reject" buttons

### Requirement: Prompt input to initiate a run
The chat/run view SHALL include a text input area at the bottom where the user can type a prompt and submit it to start a new run in the active session. All new runs start in plan mode by default.

#### Scenario: User submits a prompt
- **WHEN** the user types a prompt and presses Enter (or clicks Send)
- **THEN** a new plan-mode run is initiated in the active session with the entered prompt text
- **AND** the input is cleared

#### Scenario: Empty prompt rejected
- **WHEN** the user attempts to submit an empty prompt
- **THEN** no run is created and the input remains focused

### Requirement: Run status indicator
The chat/run view SHALL display the current run's status and mode. While a run is in progress, a visual indicator (e.g., spinner or "Running..." label) SHALL be shown alongside the mode badge. When the run completes or fails, the indicator updates accordingly.

#### Scenario: Run in progress
- **WHEN** a run has status `running`
- **THEN** a spinner or "Running..." indicator is visible in the chat area, with the mode badge visible

#### Scenario: Run completed
- **WHEN** a run finishes with status `completed`
- **THEN** the indicator shows "Completed" and the prompt input is re-enabled

#### Scenario: Run failed
- **WHEN** a run finishes with status `failed`
- **THEN** the indicator shows an error state with the error message

## ADDED Requirements

### Requirement: Mode indicator in chat header
The chat/run view SHALL display a mode badge in the header area showing the current or most recent run's mode. Plan mode shows a "Plan" badge; apply mode shows an "Apply" badge.

#### Scenario: Plan mode badge displayed
- **WHEN** the active or most recent run has `mode = 'plan'`
- **THEN** a "Plan" badge is visible in the chat header

#### Scenario: Apply mode badge displayed
- **WHEN** the active or most recent run has `mode = 'apply'`
- **THEN** an "Apply" badge is visible in the chat header

### Requirement: Plan card with approve action
When a plan-mode run completes successfully, the plan card SHALL include an "Approve & Apply" button. Clicking it invokes `run:approve` IPC to create an apply run.

#### Scenario: Approve button triggers apply run
- **WHEN** the user clicks "Approve & Apply" on a completed plan card
- **THEN** the renderer calls `run:approve` with the plan run ID
- **AND** a new apply run appears in the session and begins executing

#### Scenario: Approve button disabled during active run
- **WHEN** another run is currently active in the session
- **THEN** the "Approve & Apply" button is disabled
