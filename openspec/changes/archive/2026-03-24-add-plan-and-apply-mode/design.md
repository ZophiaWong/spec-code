## Context

Spec Code currently has a simple run model: user submits a prompt → stub agent emits events → run completes. There is no concept of mode or gated execution. The `Run` type has `status` but no `mode` field. The agent stub emits a fixed sequence regardless of intent.

Phase 3 introduces a plan/apply split where runs operate in one of two modes, with different tool permissions and output formats. This is the first major architectural addition after the basic session/run infrastructure.

Key constraints:
- Still using the stub agent (real AI comes later) — mode behavior must be demonstrable with stubs.
- Electron IPC is the sole communication channel between main and renderer.
- SQLite is the persistence layer; schema changes must be additive (no migrations yet).
- Zustand stores in renderer manage UI state.

## Goals / Non-Goals

**Goals:**
- Introduce a `mode` concept (`plan` | `apply`) on runs, persisted in SQLite.
- Enforce a tool permission matrix in the run engine based on mode.
- Produce structured plan output (steps with descriptions and affected files) from plan-mode runs.
- Allow one-click approval that transitions a plan into an apply run.
- Intercept high-risk commands in apply mode with a confirmation prompt.
- Display mode indicator, plan cards, and approval UI in the chat panel.

**Non-Goals:**
- Real AI agent integration (stub agent continues).
- Partial apply or cherry-picking plan steps.
- Plan editing before apply.
- Undo/revert of applied changes (Phase 5).
- Right sidebar usage.

## Decisions

### 1. Mode lives on Run, not Session

Mode is a per-run property (`run.mode: 'plan' | 'apply'`), not a session-level state. A session can contain a mix of plan and apply runs. The default mode for new runs is `plan`.

**Rationale**: Keeps the session as a simple container. A plan run and its resulting apply run both live in the same session, making history easy to follow. Avoids complex session-state transitions.

**Alternative considered**: Session-level mode switching. Rejected because it couples unrelated runs and makes history confusing (which runs were plans vs applies?).

### 2. Plan output as a structured RunEvent type

Plan-mode runs emit a new event type `plan_output` containing a JSON array of `PlanStep` objects (`{ title, description, affectedFiles }`) rather than free-text agent messages.

**Rationale**: Structured data enables a rich plan card UI and a clean contract for the approve-and-apply flow. The renderer can render steps, show affected files, and pass the plan to the apply run.

**Alternative considered**: Parsing free-text agent output into steps. Rejected — brittle and unnecessary when we control the stub agent.

### 3. Approve flow creates a new apply Run

Clicking "Approve & Apply" creates a new `Run` with `mode: 'apply'` and a reference to the source plan run (`sourcePlanRunId`). The apply run re-executes the plan steps with write permissions.

**Rationale**: Each execution is a separate run with its own events and status. This keeps the run model clean and the history auditable.

**Alternative considered**: Mutating the plan run's mode to `apply`. Rejected because it loses the plan history and complicates rollback.

### 4. Permission matrix enforced in run engine

The main process enforces tool permissions based on `run.mode` before dispatching tool calls to the agent:
- **Plan mode**: `read_file`, `search`, `list_files` — read-only tools only.
- **Apply mode**: All plan-mode tools plus `write_file`, `bash`, `git`.

**Rationale**: Server-side enforcement (main process) is the only trustworthy boundary. The renderer can reflect permissions in the UI, but the main process is the gatekeeper.

### 5. High-risk interception via `approval_request` event

In apply mode, when the agent attempts a high-risk operation (pattern-matched: `rm -rf`, `git push --force`, `git reset --hard`, etc.), the run engine emits an `approval_request` event and pauses execution until the renderer responds via a new `run:confirm-risky` IPC channel.

**Rationale**: Simple pattern matching is sufficient for the stub phase. The list of dangerous patterns can be expanded later. Pausing the run keeps the flow synchronous from the agent's perspective.

### 6. New IPC channels

- `run:approve` — renderer → main: approve a plan run, triggering a new apply run.
- `run:confirm-risky` — renderer → main: confirm or reject a high-risk operation during an apply run.

## Risks / Trade-offs

- **Stub agent fidelity**: The stub agent's scripted sequences can only simulate mode differences superficially. Real mode enforcement will be tested properly only when the real agent is integrated. → *Mitigation*: Design the permission matrix as a clean, testable module so it plugs into the real agent later.

- **Run-to-run reference**: `sourcePlanRunId` on apply runs creates a loose coupling between runs. If a plan run is somehow deleted, the apply run loses context. → *Mitigation*: Plan runs are never deleted; they're part of session history.

- **High-risk pattern matching**: Simple string patterns can have false positives/negatives. → *Mitigation*: Start with a conservative list; refine when the real agent is integrated. Users can always approve through the confirmation prompt.

- **Schema migration**: Adding a `mode` column to `runs` is additive and safe. Existing rows get `NULL` which the code treats as `'plan'` (default). No migration needed.
