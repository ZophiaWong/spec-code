# Capability: Run Engine

## Purpose
Backend engine for initiating runs within sessions, streaming run events from main to renderer, persisting run data in SQLite, and managing IPC contracts for run operations.

## Requirements

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

### Requirement: Persist run events in SQLite
All run events SHALL be persisted in a `run_events` table with columns: `id` (INTEGER PRIMARY KEY AUTOINCREMENT), `run_id` (TEXT), `type` (TEXT), `payload` (TEXT JSON), `created_at` (TEXT ISO-8601). Events are inserted as they are emitted.

#### Scenario: Events survive app restart
- **WHEN** a completed run's events are saved and the app restarts
- **THEN** the events are reloaded from SQLite when the session is opened

### Requirement: Persist run records in SQLite
Runs SHALL be stored in a `runs` table with columns: `id` (TEXT PRIMARY KEY), `session_id` (TEXT), `prompt` (TEXT), `status` (TEXT), `mode` (TEXT DEFAULT 'plan'), `source_plan_run_id` (TEXT nullable), `created_at` (TEXT ISO-8601), `finished_at` (TEXT nullable).

#### Scenario: Run record created on start
- **WHEN** a run is initiated
- **THEN** a row is inserted into `runs` with status `running` and the appropriate `mode` value

#### Scenario: Run record updated on completion
- **WHEN** a run finishes (success or failure)
- **THEN** the `status` is updated to `completed` or `failed` and `finished_at` is set

#### Scenario: Apply run references plan run
- **WHEN** an apply run is created from an approved plan
- **THEN** the `source_plan_run_id` column references the originating plan run's ID

### Requirement: Stub agent for Phase 2
The run engine SHALL use a stub agent that emits different event sequences based on run mode. In **plan mode**, the stub emits read-only tool calls followed by a `plan_output` event with structured steps. In **apply mode**, the stub emits write tool calls (with one high-risk command triggering an `approval_request`) followed by completion events.

#### Scenario: Stub agent produces plan events
- **WHEN** a plan-mode run is started
- **THEN** the stub agent emits read-only tool calls and a `plan_output` event with structured steps, and the run completes with status `completed`

#### Scenario: Stub agent produces apply events
- **WHEN** an apply-mode run is started
- **THEN** the stub agent emits write tool calls including a simulated high-risk command, and the run completes with status `completed`

### Requirement: Run store in renderer
The renderer SHALL maintain a Zustand store (`runStore`) holding: the list of runs for the active session, the current run's live events, and run loading state.

#### Scenario: Store populated on session load
- **WHEN** a session is made active
- **THEN** `runStore` loads all runs and their events for that session from the main process

#### Scenario: Live events appended during run
- **WHEN** a `run:event` IPC message arrives
- **THEN** the event is appended to the current run's event list in `runStore`

### Requirement: IPC contracts for run operations
The main process SHALL expose IPC handlers: `run:start` (create and start a run), `run:list` (list runs for a session), `run:events` (get events for a run), `run:approve` (create apply run from completed plan), `run:confirm-risky` (confirm or reject high-risk operation). The renderer SHALL subscribe to `run:event` push channel. Types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: run:list returns runs for session
- **WHEN** the renderer calls `run:list` with `{ sessionId }`
- **THEN** the main process returns an array of run objects (including `mode` field) ordered by `created_at` asc

#### Scenario: run:events returns events for a run
- **WHEN** the renderer calls `run:events` with `{ runId }`
- **THEN** the main process returns an array of event objects ordered by `created_at` asc

#### Scenario: run:approve creates an apply run
- **WHEN** the renderer calls `run:approve` with `{ planRunId }`
- **THEN** the main process creates a new run with `mode = 'apply'` and `sourcePlanRunId` set, and starts execution

#### Scenario: run:confirm-risky resumes or skips
- **WHEN** the renderer calls `run:confirm-risky` with `{ runId, approved }`
- **THEN** if `approved` is true, execution resumes; if false, the command is skipped with an error event

### Requirement: Tool permission matrix enforcement
The run engine SHALL enforce a tool permission matrix based on the run's mode. Plan-mode runs are restricted to read-only tools (`read_file`, `search`, `list_files`). Apply-mode runs have access to all tools including write tools (`write_file`, `bash`, `git`). Permission checks happen in the main process before tool execution.

#### Scenario: Permission check passes
- **WHEN** the agent calls a tool that is allowed for the current run mode
- **THEN** the tool call proceeds normally

#### Scenario: Permission check fails
- **WHEN** the agent calls a tool that is not allowed for the current run mode
- **THEN** the tool call is blocked and an `error` event is emitted with a permission denial message

### Requirement: High-risk command detection
The run engine SHALL maintain a list of high-risk command patterns (e.g., `rm -rf`, `git push --force`, `git reset --hard`, `DROP TABLE`). When an apply-mode run's agent attempts a `bash` tool call matching any pattern, execution pauses and an `approval_request` event is emitted.

#### Scenario: Dangerous pattern matched
- **WHEN** a `bash` tool call in apply mode matches a high-risk pattern
- **THEN** an `approval_request` event is emitted with the command details and execution pauses

#### Scenario: Non-dangerous command passes through
- **WHEN** a `bash` tool call in apply mode does not match any high-risk pattern
- **THEN** the command executes normally without interruption
