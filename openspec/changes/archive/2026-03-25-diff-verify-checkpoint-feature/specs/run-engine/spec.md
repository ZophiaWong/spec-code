## MODIFIED Requirements

### Requirement: Initiate a run within a session
The system SHALL allow initiating a run by providing a prompt string and a session ID. A new run record is created with status `running` and the specified mode (defaulting to `plan`). Events begin streaming. For apply-mode runs, the system SHALL create an auto-checkpoint before execution begins.

#### Scenario: Run created successfully
- **WHEN** the renderer calls `run:start` with `{ sessionId, prompt }`
- **THEN** the main process creates a run record in SQLite with status `running` and `mode = 'plan'`, and returns the run object
- **AND** the session's `updated_at` timestamp is updated

#### Scenario: Run start while another run is active
- **WHEN** a run is started while another run in the same session has status `running`
- **THEN** the system SHALL reject the request with an error (one active run per session)

#### Scenario: Apply run creates checkpoint before execution
- **WHEN** an apply-mode run is initiated
- **THEN** the system creates a checkpoint tag `spec-code/checkpoint/<runId>` before the agent begins executing
- **AND** a checkpoint record is saved in SQLite

### Requirement: Stream run events from main to renderer
During a run, the main process SHALL push events to the renderer via the `run:event` IPC channel using `webContents.send()`. Each event contains: `runId`, `type` (`agent_message` | `tool_call` | `tool_result` | `error` | `file_changed` | `verify_result`), `payload` (JSON), and `createdAt`.

#### Scenario: Agent message event streamed
- **WHEN** the agent produces a message during a run
- **THEN** the main process sends a `run:event` with type `agent_message` and the message text as payload

#### Scenario: Tool call event streamed
- **WHEN** the agent invokes a tool during a run
- **THEN** the main process sends a `run:event` with type `tool_call` and tool name + arguments as payload

#### Scenario: Tool result event streamed
- **WHEN** a tool call completes during a run
- **THEN** the main process sends a `run:event` with type `tool_result` and the result as payload

#### Scenario: File changed event streamed
- **WHEN** a write tool call modifies a file during an apply run
- **THEN** the main process sends a `run:event` with type `file_changed` and the file path + change status as payload
