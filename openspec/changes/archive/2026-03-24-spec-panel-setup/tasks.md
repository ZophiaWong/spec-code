## 1. Types and IPC Contracts

- [x] 1.1 Add `SpecSummary` and `ChangeSummary` types to `src/shared/types.ts`
- [x] 1.2 Add IPC channel constants (`SPEC_LIST`, `SPEC_READ`, `CHANGE_LIST`, `CHANGE_READ_ARTIFACT`, `SPEC_CREATE`, `CHANGE_CREATE`) to `src/shared/ipc.ts`
- [x] 1.3 Add IPC API methods (`listSpecs`, `readSpec`, `listChanges`, `readChangeArtifact`, `createSpec`, `createChange`) to the `IpcApi` interface in `src/shared/ipc.ts`

## 2. Main Process — Spec/Change Readers

- [x] 2.1 Create `src/main/openspec/specs.ts` with functions: `listSpecs(repoPath)` reads `openspec/specs/` dirs and extracts purpose from each `spec.md`, `readSpec(repoPath, name)` returns markdown content
- [x] 2.2 Create `src/main/openspec/changes.ts` with functions: `listChanges(repoPath)` reads `openspec/changes/` dirs (excluding `archive/`), parses `.openspec.yaml` for status/artifacts, `readChangeArtifact(repoPath, changeName, artifactPath)` returns markdown content
- [x] 2.3 Create `src/main/openspec/actions.ts` with functions: `createSpec(repoPath, name)` scaffolds new spec dir, `createChange(repoPath, name)` runs `openspec new change` via `child_process.execFile`
- [x] 2.4 Register all new IPC handlers in `src/main/ipc/index.ts`

## 3. Preload Bridge

- [x] 3.1 Expose the new IPC methods (`listSpecs`, `readSpec`, `listChanges`, `readChangeArtifact`, `createSpec`, `createChange`) in `src/preload/index.ts`

## 4. Renderer — Spec/Change Store

- [x] 4.1 Create `src/renderer/stores/spec-store.ts` Zustand store with: `specs`, `changes`, `activeView` (union type for center panel routing), loading flags, and actions (`loadSpecs`, `loadChanges`, `selectSpec`, `selectChange`, `clearSelection`)
- [x] 4.2 Wire store to load specs and changes on repo open (integrate with existing repo-store)

## 5. Renderer — Left Sidebar Update

- [x] 5.1 Update `LeftSidebar.tsx` Specs section to render clickable spec items from the store, with "+" button for creating new specs
- [x] 5.2 Update `LeftSidebar.tsx` Changes section to render clickable change items with status indicator, with "+" button for creating new changes
- [x] 5.3 Add collapsible toggle behavior to each section header
- [x] 5.4 Add simple name-input prompt (modal or inline) for "New Spec" and "New Change" actions

## 6. Renderer — Center Panel Views

- [x] 6.1 Install `react-markdown` and `remark-gfm` dependencies
- [x] 6.2 Create `src/renderer/components/SpecDetail.tsx` — renders spec markdown with `react-markdown`
- [x] 6.3 Create `src/renderer/components/ChangeDetail.tsx` — shows change name, artifact list with status badges, expandable rendered markdown for completed artifacts, and "Start Plan" button
- [x] 6.4 Update `WorkspacePage.tsx` (or `Layout.tsx` center panel) to route between repo info, chat/run view, spec detail, and change detail based on `activeView` from the spec store

## 7. Renderer — Launch Run from Change

- [x] 7.1 Implement "Start Plan" button in `ChangeDetail.tsx` that reads the change's tasks content and initiates a plan-mode run with that context as the prompt
- [x] 7.2 Wire the button to create/reuse a session and navigate to the chat/run view after run starts

## 8. Integration and Polish

- [x] 8.1 Ensure selecting a session from sidebar clears spec/change selection and vice versa (mutual exclusion of center panel views)
- [x] 8.2 Add refresh behavior: reload specs/changes on window focus or after create actions
- [x] 8.3 Handle edge cases: missing openspec dir, empty spec files, CLI errors — show appropriate messages in the UI
