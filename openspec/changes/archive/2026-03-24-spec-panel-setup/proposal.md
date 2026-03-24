## Why

The left sidebar already has placeholder sections for "Specs" and "Changes" (showing "No specs loaded" / "No active changes"), and the right sidebar is a static placeholder. Phase 4 brings the app's namesake to life: users need to browse specs, view spec details, see proposal/design/tasks artifacts, create new specs/changes, and launch plan/apply runs from a spec — making "spec-code" actually spec-driven.

## What Changes

- **Spec list in left sidebar**: Replace the "No specs loaded" placeholder with a live list of specs read from `openspec/specs/` in the repo. Each item shows the capability name and a brief purpose line.
- **Change list in left sidebar**: Replace "No active changes" with a live list from `openspec/changes/` (non-archived). Each shows name, schema, and completion status.
- **Spec detail view in center panel**: Clicking a spec opens a read-only rendered view of its `spec.md` (markdown → HTML) showing purpose, requirements, and scenarios.
- **Change detail view in center panel**: Clicking a change shows its artifacts (proposal, design, specs, tasks) with status indicators and rendered markdown content.
- **New spec/change creation**: Buttons to scaffold a new spec or change via the `openspec` CLI, with the result appearing immediately in the sidebar.
- **Launch run from spec/change**: A "Start Plan" button on a change's task list that initiates a plan-mode run pre-filled with context from the change's tasks.

## Non-goals

- Inline editing of spec files within the app (specs are authored externally or via agent).
- Diff view between delta specs and main specs.
- Automatic sync of delta specs to main specs.

## Capabilities

### New Capabilities
- `spec-browser`: Reading and listing spec files from the repo's `openspec/specs/` directory, displaying them in the left sidebar and rendering detail views in the center panel.
- `change-browser`: Reading and listing change directories from `openspec/changes/`, displaying status in the left sidebar and rendering artifact detail views in the center panel.
- `spec-actions`: Creating new specs/changes via CLI integration and launching plan/apply runs from change context.

### Modified Capabilities
- `app-layout`: Left sidebar now has interactive spec/change tree sections; center panel routes between repo info, chat/run view, spec detail, and change detail based on selection state.

## Impact

- **UI (renderer)**: New components for spec list, change list, spec detail, change detail. Modified `LeftSidebar`, `Layout` center panel routing, new Zustand store for spec/change state.
- **Main process**: New IPC handlers to read `openspec/` directory structure and file contents from the repo. New handler to invoke `openspec` CLI for scaffolding.
- **Dependencies**: Markdown rendering library needed (e.g., `react-markdown` or `marked`).
- **Panels affected**: Left sidebar (spec/change tree), center panel (detail views).
