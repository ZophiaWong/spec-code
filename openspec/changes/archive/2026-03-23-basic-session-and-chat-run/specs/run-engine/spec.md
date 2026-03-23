## ADDED Requirements

### Requirement: Initiate a run within a session
The system SHALL allow initiating a run by providing a prompt string and a session ID. A new run record is created with status `running` and events begin streaming.

#### Scenario: Run created successfully
- **WHEN** the renderer calls `run:start` with `{ sessionId, prompt }`
- **THEN** the main process creates a run record in SQLite with status `running` and returns the run object
- **AND** the session's `updated_at` timestamp is updated

#### Scenario: Run start while another run is active
- **WHEN** a run is started while another run in the same session has status `running`
- **THEN** the system SHALL reject the request with an error (one active run per session)

### Requirement: Stream run events from main to renderer
During a run, the main process SHALL push events to the renderer via the `run:event` IPC channel using `webContents.send()`. Each event contains: `runId`, `type` (`agent_message` | `tool_call` | `tool_result` | `error`), `payload` (JSON), and `createdAt`.

#### Scenario: Agent message event streamed
- **WHEN** the agent produces a message during a run
- **THEN** the main process sends a `run:event` with type `agent_message` and the message text as payload

#### Scenario: Tool call event streamed
- **WHEN** the agent invokes a tool during a run
- **THEN** the main process sends a `run:event` with type `tool_call` and tool name + arguments as payload

#### Scenario: Tool result event streamed
- **WHEN** a tool call completes during a run
- **THEN** the main process sends a `run:event` with type `tool_result` and the result as payload

### Requirement: Persist run events in SQLite
All run events SHALL be persisted in a `run_events` table with columns: `id` (INTEGER PRIMARY KEY AUTOINCREMENT), `run_id` (TEXT), `type` (TEXT), `payload` (TEXT JSON), `created_at` (TEXT ISO-8601). Events are inserted as they are emitted.

#### Scenario: Events survive app restart
- **WHEN** a completed run's events are saved and the app restarts
- **THEN** the events are reloaded from SQLite when the session is opened

### Requirement: Persist run records in SQLite
Runs SHALL be stored in a `runs` table with columns: `id` (TEXT PRIMARY KEY), `session_id` (TEXT), `prompt` (TEXT), `status` (TEXT), `created_at` (TEXT ISO-8601), `finished_at` (TEXT nullable).

#### Scenario: Run record created on start
- **WHEN** a run is initiated
- **THEN** a row is inserted into `runs` with status `running`

#### Scenario: Run record updated on completion
- **WHEN** a run finishes (success or failure)
- **THEN** the `status` is updated to `completed` or `failed` and `finished_at` is set

### Requirement: Stub agent for Phase 2
The run engine SHALL use a stub agent that emits a scripted sequence of events: an initial `agent_message`, one or two `tool_call`/`tool_result` pairs, and a final `agent_message`. Events are emitted with small delays (200-500ms) to simulate streaming.

#### Scenario: Stub agent produces events
- **WHEN** a run is started
- **THEN** the stub agent emits a sequence of events over ~2 seconds and the run completes with status `completed`

### Requirement: Run store in renderer
The renderer SHALL maintain a Zustand store (`runStore`) holding: the list of runs for the active session, the current run's live events, and run loading state.

#### Scenario: Store populated on session load
- **WHEN** a session is made active
- **THEN** `runStore` loads all runs and their events for that session from the main process

#### Scenario: Live events appended during run
- **WHEN** a `run:event` IPC message arrives
- **THEN** the event is appended to the current run's event list in `runStore`

### Requirement: IPC contracts for run operations
The main process SHALL expose IPC handlers: `run:start` (create and start a run), `run:list` (list runs for a session), `run:events` (get events for a run). The renderer SHALL subscribe to `run:event` push channel. Types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: run:list returns runs for session
- **WHEN** the renderer calls `run:list` with `{ sessionId }`
- **THEN** the main process returns an array of run objects ordered by `created_at` asc

#### Scenario: run:events returns events for a run
- **WHEN** the renderer calls `run:events` with `{ runId }`
- **THEN** the main process returns an array of event objects ordered by `created_at` asc
