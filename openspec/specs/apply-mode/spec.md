# Capability: Apply Mode

## Purpose
Apply-mode execution flow: transitioning from an approved plan to an apply run with write permissions, high-risk command interception, and approval UI.

## Requirements

### Requirement: Approve plan to create apply run
The user SHALL be able to approve a completed plan-mode run, which creates a new `apply` run in the same session. The apply run references the source plan run via `sourcePlanRunId` and carries the plan steps as context.

#### Scenario: User approves a plan
- **WHEN** the user clicks "Approve & Apply" on a completed plan-mode run
- **THEN** a new run is created with `mode = 'apply'` and `sourcePlanRunId` referencing the plan run
- **AND** the apply run begins executing immediately

#### Scenario: Approve button only on completed plan runs
- **WHEN** a plan-mode run is still running or has failed
- **THEN** no "Approve & Apply" button is displayed

### Requirement: Apply mode unlocks write tools
In apply mode, the agent SHALL have access to all read-only tools plus write tools: `write_file`, `bash`, `git`. The permission matrix is enforced by the run engine in the main process.

#### Scenario: Write tool allowed in apply mode
- **WHEN** the agent calls `write_file` during an apply-mode run
- **THEN** the tool call is executed and the result is returned

#### Scenario: All plan-mode tools remain available
- **WHEN** an apply-mode run is active
- **THEN** read-only tools (`read_file`, `search`, `list_files`) remain available

### Requirement: High-risk command interception
In apply mode, when the agent attempts a command matching a high-risk pattern, the run engine SHALL pause execution and emit an `approval_request` event. The run resumes only after the user confirms or rejects via the `run:confirm-risky` IPC channel.

#### Scenario: High-risk command detected
- **WHEN** the agent calls `bash` with a command matching a dangerous pattern (e.g., `rm -rf`, `git push --force`, `git reset --hard`)
- **THEN** the run engine pauses and emits an `approval_request` event with the command details

#### Scenario: User confirms risky command
- **WHEN** an `approval_request` is pending and the user clicks "Confirm"
- **THEN** the run engine resumes and executes the command

#### Scenario: User rejects risky command
- **WHEN** an `approval_request` is pending and the user clicks "Reject"
- **THEN** the run engine skips the command and emits an `error` event noting the rejection
- **AND** the run continues with remaining steps

### Requirement: IPC contracts for approval operations
The main process SHALL expose IPC handlers: `run:approve` (create apply run from plan), `run:confirm-risky` (confirm or reject a high-risk operation). Types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: run:approve creates apply run
- **WHEN** the renderer calls `run:approve` with `{ planRunId }`
- **THEN** the main process creates a new apply run referencing the plan run and returns the new run object

#### Scenario: run:confirm-risky resolves pending approval
- **WHEN** the renderer calls `run:confirm-risky` with `{ runId, approved: true }`
- **THEN** the pending approval request for that run is resolved and execution resumes
