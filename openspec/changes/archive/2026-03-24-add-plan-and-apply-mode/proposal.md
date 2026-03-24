## Why

The app currently runs every prompt directly — the agent reads and writes code immediately with no user oversight. Phase 3 introduces a **plan/apply** mode that gives users control: the agent first produces a structured plan (read-only), and only after explicit user approval does it apply changes to the repo. This is the core differentiating capability of Spec Code — gated execution with human-in-the-loop approval.

## What Changes

- Add a **mode** concept to sessions: `plan` mode (default) restricts the agent to read-only analysis and structured plan output; `apply` mode unlocks file writes, bash execution, and git operations.
- Display a **mode indicator** in the chat panel header showing the current mode.
- Render **structured plan output** — a step list with descriptions and affected files — as a reviewable card in the chat view.
- Add a **one-click "Approve & Apply"** button on plan output that switches the session to `apply` mode and re-runs the plan as an apply run.
- Implement a **permission matrix** on the agent side: plan-mode runs are restricted to read-only tools; apply-mode runs unlock write tools.
- Add **high-risk command interception**: even in apply mode, dangerous operations (e.g., `rm -rf`, `git push --force`) require an extra confirmation prompt before execution.

## Non-goals

- Real AI agent integration — we continue using the stub agent for now.
- Undo/rewind of applied changes (Phase 5).
- Multi-step plan editing or partial apply.
- Right sidebar utilization.

## Capabilities

### New Capabilities
- `plan-mode`: Mode management, permission matrix, plan-mode agent behavior, and structured plan output.
- `apply-mode`: Apply-mode execution flow, approval transition, high-risk command interception.

### Modified Capabilities
- `chat-run-panel`: Add mode indicator, structured plan card rendering, and approve button to the chat view.
- `run-engine`: Add mode field to runs, enforce tool permission matrix based on mode, emit plan-structured events.

## Impact

- **Types**: `Run` gains a `mode` field; new `PlanStep` and `PlanOutput` types; new `RunEventType` values (`plan_output`, `approval_request`).
- **IPC**: New channel `run:approve` to transition plan → apply. Possibly `run:confirm-risky` for high-risk interception.
- **Agent stub**: Must produce different event sequences for plan vs apply mode.
- **UI**: Chat panel gains mode indicator, plan card component, and approve button.
- **Database**: `runs` table gains `mode` column.
