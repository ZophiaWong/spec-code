## Context

Spec Code currently supports plan/apply mode runs that stream agent events and can modify the repo. However, once changes are applied, users have no visibility into what was modified, no way to verify correctness, and no way to roll back. The right sidebar is still a placeholder. This design adds the diff/verify/checkpoint loop to close the feedback gap.

Existing infrastructure:
- `simple-git` already used in `src/main/git/index.ts` for repo info
- Run engine streams events via IPC (`run:event` channel)
- Zustand stores pattern established (`runStore`, `sessionStore`, `repoStore`, `specStore`)
- Right sidebar component exists but shows placeholder content

## Goals / Non-Goals

**Goals:**
- Users can see which files changed during a run and inspect diffs
- Users can trigger verification (lint/test) and see results inline
- The system auto-checkpoints before each apply run so users can rewind
- All state is session-scoped and persists across app restarts

**Non-Goals:**
- Git history browser or blame UI
- Merge conflict resolution
- Remote operations (push/pull)
- Custom commit messages for checkpoints
- Continuous/watch-mode test running

## Decisions

### 1. Checkpoint mechanism: lightweight git tags

**Decision**: Use `git stash create` to snapshot the working tree + index as a stash-like commit object, then tag it with `spec-code/checkpoint/<runId>`. No branch switching, no visible stash list pollution.

**Alternatives considered**:
- *Git stash*: Pollutes user-visible stash list; harder to manage multiple stashes
- *Git branches*: Creates visible branch clutter; risk of conflicts
- *File-system copy*: Slow for large repos, no atomic restore

**Rationale**: Tags on stash commits are invisible to normal git workflows, atomic, and cheap. Rewind does `git read-tree` + `git checkout-index` from the tagged commit.

### 2. Changed files: diff against checkpoint baseline

**Decision**: After a run completes (or while streaming), compute changed files by diffing `HEAD` working tree against the pre-apply checkpoint tag. Use `simple-git`'s `diffSummary()` for the file list and `diff()` for per-file content.

**Rationale**: This gives an accurate picture of what the agent changed, not what was already dirty before the run.

### 3. Diff rendering: react-diff-view library

**Decision**: Use `react-diff-view` with unified diff format for the center panel diff viewer. Parse raw unified diff output from `simple-git` with `unidiff` or `gitdiff-parser`.

**Alternatives considered**:
- *monaco-editor diff*: Heavier, overkill for read-only viewing
- *Custom renderer*: Too much effort for Phase 5 MVP

### 4. Verify service: configurable shell commands

**Decision**: The verify service reads a `verify` config (from `.spec-code/config.json` or repo-level config) that lists shell commands to run (e.g., `["npm run lint", "npm test"]`). Each command is spawned via `child_process.spawn`, output is streamed as events, and results are pass/fail per command.

**Rationale**: Keeps it generic — works with any language/framework. No need to understand test frameworks.

### 5. UI placement

**Decision**:
- **Right sidebar**: Changed Files panel (file list with A/M/D status icons)
- **Center panel**: Diff viewer (opened by clicking a file in Changed Files)
- **Run panel / right sidebar footer**: Verify button + result summary
- **Right sidebar header**: Checkpoint list dropdown + Rewind button

### 6. State management: new Zustand stores

**Decision**: Add `diffStore` (changed files, selected file, diff content) and `checkpointStore` (checkpoint list, active checkpoint). Verify results go into `runStore` as a new event type.

## Risks / Trade-offs

**[Risk] Checkpoint tags accumulate over time** → Cleanup on session delete; add a `checkpoint:cleanup` IPC that removes tags for a given session. Also auto-prune on repo open if stale tags exist.

**[Risk] Large diffs overwhelm the renderer** → Paginate/truncate diffs beyond a threshold (e.g., 10K lines). Show "file too large" placeholder.

**[Risk] Verify commands may hang** → Enforce a configurable timeout (default 120s). Kill process on timeout and report as failure.

**[Risk] Rewind while agent is running** → Disable rewind button during active runs. Only allow rewind when no run is in `running` state.

**[Trade-off] Checkpoint granularity**: One checkpoint per apply run (not per tool call). Simpler but less granular. Acceptable for MVP — can add per-step checkpoints later.
