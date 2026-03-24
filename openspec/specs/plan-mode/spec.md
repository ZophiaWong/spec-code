# Capability: Plan Mode

## Purpose
Mode management for plan-mode runs: restricting the agent to read-only tools, producing structured plan output, and displaying the current mode in the UI.

## Requirements

### Requirement: Plan mode is the default run mode
Every new run SHALL default to `plan` mode unless explicitly created as an `apply` run (via the approval flow). The `mode` field is stored on each `Run` record.

#### Scenario: New run defaults to plan mode
- **WHEN** a user submits a prompt to start a new run
- **THEN** the run is created with `mode` set to `plan`

#### Scenario: Run mode persisted in database
- **WHEN** a plan-mode run is created
- **THEN** the `runs` table row has `mode = 'plan'`
- **AND** the mode value survives app restart

### Requirement: Plan mode restricts agent to read-only tools
In plan mode, the agent SHALL only be allowed to use read-only tools: `read_file`, `search`, `list_files`. Any attempt to call write tools (`write_file`, `bash`, `git`) SHALL be blocked by the run engine.

#### Scenario: Read-only tool allowed in plan mode
- **WHEN** the agent calls `read_file` during a plan-mode run
- **THEN** the tool call is executed and the result is returned

#### Scenario: Write tool blocked in plan mode
- **WHEN** the agent attempts to call `write_file` during a plan-mode run
- **THEN** the run engine blocks the call and emits an `error` event indicating the tool is not permitted in plan mode

### Requirement: Plan mode produces structured plan output
At the end of a plan-mode run, the agent SHALL emit a `plan_output` event containing a JSON array of `PlanStep` objects. Each step has: `title` (string), `description` (string), and `affectedFiles` (string array).

#### Scenario: Plan output emitted
- **WHEN** a plan-mode run completes its analysis
- **THEN** a `plan_output` event is emitted with an array of structured steps
- **AND** each step includes a title, description, and list of affected files

#### Scenario: Plan output persisted as run event
- **WHEN** a `plan_output` event is emitted
- **THEN** it is stored in the `run_events` table with type `plan_output`
- **AND** it can be retrieved when the session is reloaded

### Requirement: Mode indicator displayed in chat panel
The chat/run view SHALL display a mode badge showing the current run's mode (`Plan` or `Apply`). When no run is active, no badge is shown.

#### Scenario: Plan mode badge shown
- **WHEN** a plan-mode run is active or the most recent run was plan mode
- **THEN** a "Plan" badge is visible in the chat panel header area

#### Scenario: No run — no badge
- **WHEN** the session has no runs yet
- **THEN** no mode badge is displayed
