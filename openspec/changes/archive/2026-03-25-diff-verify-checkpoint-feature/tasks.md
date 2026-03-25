## 1. Database & Shared Types

- [x] 1.1 Add `checkpoints` table to SQLite schema (`id`, `run_id`, `session_id`, `tag_name`, `created_at`)
- [x] 1.2 Add checkpoint, diff, and verify IPC channel types to `src/shared/ipc.ts`
- [x] 1.3 Add `file_changed` and `verify_result` to the run event type union in shared types

## 2. Checkpoint Service (Main Process)

- [x] 2.1 Create `src/main/git/checkpoint.ts` — `createCheckpoint(repoPath, runId)` using `git stash create` + `git tag`
- [x] 2.2 Implement `rewindToCheckpoint(repoPath, tagName)` using `git read-tree` + `git checkout-index`
- [x] 2.3 Implement `listCheckpoints(sessionId)` querying SQLite
- [x] 2.4 Implement `cleanupCheckpoints(sessionId)` removing tags and DB records
- [x] 2.5 Register IPC handlers: `checkpoint:list`, `checkpoint:rewind`

## 3. Diff Service (Main Process)

- [x] 3.1 Create `src/main/git/diff.ts` — `getChangedFiles(repoPath, checkpointTag)` using `simple-git` `diffSummary`
- [x] 3.2 Implement `getFileDiff(repoPath, checkpointTag, filePath)` returning unified diff string
- [x] 3.3 Register IPC handlers: `diff:changed-files`, `diff:file-content`

## 4. Verify Service (Main Process)

- [x] 4.1 Create `src/main/verify/index.ts` — read verify commands from `.spec-code/config.json`
- [x] 4.2 Implement command runner: spawn each command, stream output, enforce timeout (120s default)
- [x] 4.3 Register IPC handlers: `verify:run`, `verify:config`; push `verify:result` events via `webContents.send()`

## 5. Run Engine Integration

- [x] 5.1 Hook checkpoint creation into run engine: call `createCheckpoint` before apply-mode run execution begins
- [x] 5.2 Emit `file_changed` events from the run engine when write tools modify files during apply runs
- [x] 5.3 On apply run completion, trigger `diff:files-updated` push event to renderer

## 6. Renderer Stores

- [x] 6.1 Create `src/renderer/stores/diff-store.ts` — `changedFiles`, `selectedFile`, `diffContent`, loading state
- [x] 6.2 Create `src/renderer/stores/checkpoint-store.ts` — `checkpoints` list, loading state
- [x] 6.3 Add verify result handling to `runStore` (or create `verifyStore`)
- [x] 6.4 Wire IPC listeners for `diff:files-updated`, `verify:result`, and checkpoint events

## 7. Changed Files Panel (Right Sidebar)

- [x] 7.1 Create `src/renderer/components/ChangedFilesPanel.tsx` — file list with A/M/D status icons
- [x] 7.2 Implement file selection click handler that sets `diffStore.selectedFile`
- [x] 7.3 Handle empty state ("No files changed")
- [x] 7.4 Replace right sidebar placeholder content with ChangedFilesPanel, CheckpointList, and VerifyButton sections

## 8. Diff Viewer (Center Panel)

- [x] 8.1 Add `react-diff-view` (and diff parser) as project dependencies
- [x] 8.2 Create `src/renderer/components/DiffViewer.tsx` — render unified diff with syntax highlighting
- [x] 8.3 Implement large-diff truncation (10K line limit with "Show full diff" button)
- [x] 8.4 Add back/close button to return to previous center panel view
- [x] 8.5 Wire center panel routing: show DiffViewer when `diffStore.selectedFile` is set

## 9. Checkpoint List & Rewind UI

- [x] 9.1 Create `src/renderer/components/CheckpointList.tsx` — list checkpoints with run prompt + timestamp
- [x] 9.2 Implement Rewind button with confirmation dialog
- [x] 9.3 Disable Rewind button when a run is active
- [x] 9.4 After rewind, refresh changed files panel and diff store

## 10. Verify UI

- [x] 10.1 Create `src/renderer/components/VerifyButton.tsx` — trigger verify, show loading state
- [x] 10.2 Create `src/renderer/components/VerifyResults.tsx` — per-command pass/fail, expandable output, summary
- [x] 10.3 Disable Verify button during active runs
- [x] 10.4 Handle "no commands configured" state with setup prompt

## 11. Cleanup & Integration

- [x] 11.1 Hook checkpoint cleanup into session delete flow
- [x] 11.2 Update right sidebar minimum width to 240px
- [x] 11.3 Update app-layout center panel routing to include diff viewer state
