## Why

After the agent applies changes in a session, users have no way to review what was modified, verify correctness, or roll back bad changes. The app currently ends at "apply" — there's no feedback loop. Phase 5 closes this gap: users can see diffs, run verification, and rewind to safe checkpoints.

## What Changes

- Add a **Changed Files panel** (right sidebar) showing files modified during the current session/run
- Add an inline **Diff Viewer** in the center panel to inspect per-file changes
- Add a **Verify action** that runs lint/test/build checks and displays results
- Add **auto-checkpoint** that snapshots the repo (via git) before each apply
- Add **Rewind** to restore the repo to any prior checkpoint

## Non-goals

- Full git history browser (only session-scoped checkpoints)
- Merge conflict resolution UI
- Remote push/pull operations
- Manual commit message editing — checkpoints are automatic and internal

## Capabilities

### New Capabilities
- `changed-files-panel`: Right sidebar panel listing files changed during a session/run, with file status indicators (added/modified/deleted)
- `diff-viewer`: Center panel view rendering unified diffs for selected changed files
- `verify-action`: Verify button + service that runs configured lint/test commands and displays pass/fail results
- `checkpoint-rewind`: Auto-checkpoint creation before each apply, checkpoint list display, and rewind-to-checkpoint action

### Modified Capabilities
- `app-layout`: Right sidebar changes from placeholder to hosting the Changed Files panel
- `run-engine`: Run engine needs to emit file-change events and trigger auto-checkpoints around apply steps

## Impact

- **UI**: Right sidebar gets real content (changed files); center panel gains diff view; verify results shown in run panel or modal
- **Main process**: New git service functions (diff, stash/tag-based checkpoints, restore); new verify service (spawns lint/test processes)
- **IPC**: New channels for changed-files, diff-content, verify-run, checkpoint-list, rewind
- **Dependencies**: May add a diff rendering library (e.g., react-diff-viewer) for the frontend
- **State**: New Zustand stores or store slices for changed files, checkpoints, and verify results
