# Capability: Verify Action

## Purpose
Run configurable verification commands after apply runs and present pass/fail output to users.

## Requirements

### Requirement: Verify button triggers configured checks
The UI SHALL display a "Verify" button accessible from the run panel or right sidebar. Clicking it SHALL execute the configured verification commands against the repo and display results.

#### Scenario: Verify runs successfully
- **WHEN** the user clicks "Verify" after an apply run
- **THEN** the system runs all configured verify commands sequentially and displays pass/fail status for each

#### Scenario: No verify commands configured
- **WHEN** the user clicks "Verify" but no commands are configured
- **THEN** the system shows a message prompting the user to configure verify commands

### Requirement: Verify command configuration
The verify service SHALL read verification commands from `.spec-code/config.json` under the `verify.commands` key. Each entry is a shell command string. If no config exists, the commands list is empty.

#### Scenario: Config with multiple commands
- **WHEN** `.spec-code/config.json` contains `{ "verify": { "commands": ["npm run lint", "npm test"] } }`
- **THEN** the verify service runs `npm run lint` then `npm test` in sequence

### Requirement: Verify result display
Each verify command result SHALL show: the command name, pass/fail status, execution duration, and expandable output (stdout/stderr). A summary SHALL show total passed/failed count.

#### Scenario: Mixed results displayed
- **WHEN** verify runs two commands where one passes and one fails
- **THEN** the results show one green (pass) and one red (fail) entry, with summary "1/2 passed"

#### Scenario: Command output expandable
- **WHEN** verify results are displayed
- **THEN** each command entry is collapsed by default and expandable to show full stdout/stderr

### Requirement: Verify command timeout
Each verify command SHALL have a configurable timeout (default 120 seconds). Commands exceeding the timeout SHALL be killed and reported as failed with a timeout message.

#### Scenario: Command times out
- **WHEN** a verify command runs longer than the configured timeout
- **THEN** the process is killed and the result shows "Timed out after 120s"

### Requirement: Verify IPC contract
The main process SHALL expose: `verify:run` (start verification), `verify:config` (get/set verify commands). During verification, results are streamed via `verify:result` push events. Types SHALL be defined in `src/shared/ipc.ts`.

#### Scenario: verify:run starts verification
- **WHEN** the renderer calls `verify:run` with `{ repoPath }`
- **THEN** the main process begins executing verify commands and streams results via `verify:result`

#### Scenario: verify:result event streamed
- **WHEN** a verify command completes
- **THEN** the main process sends a `verify:result` event with `{ command, passed, duration, output }`

### Requirement: Verify disabled during active run
The Verify button SHALL be disabled while a run is in `running` state to prevent interference with the agent.

#### Scenario: Button disabled during run
- **WHEN** a run is active with status `running`
- **THEN** the Verify button is disabled and shows a tooltip "Wait for run to complete"
