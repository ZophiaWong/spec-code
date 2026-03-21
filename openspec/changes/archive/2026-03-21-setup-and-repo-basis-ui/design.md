## Context

Spec Code is a greenfield Electron desktop app. No code exists yet. This change bootstraps the entire project: Electron main process, React renderer, build tooling, SQLite database, and the foundational UI layout. Every future feature (sessions, agents, specs, diffs) depends on this shell being in place.

The README defines the tech stack: Electron + React + TypeScript, Zustand or Redux Toolkit for state, shadcn/ui or Mantine for components, SQLite for persistence, and a `src/main` / `src/renderer` / `src/shared` source layout.

## Goals / Non-Goals

**Goals:**
- A working Electron app that launches and displays a window.
- Open any local folder, validate it's a git repo, and show basic repo info.
- Persist and display recently-opened projects across app restarts.
- Establish the three-panel layout shell that all future UI builds on.
- Set up dev tooling (Vite, hot-reload, TypeScript strict mode).

**Non-Goals:**
- No agent runtime or AI integration.
- No file tree, code editor, or diff viewer.
- No real content in left/right panels — placeholders only.
- No production packaging or auto-update (dev mode is sufficient).

## Decisions

### D1: Vite + electron-vite for build tooling
**Choice**: Use `electron-vite` (wraps Vite for main/preload/renderer).
**Why**: Single config covers all three Electron targets. HMR for renderer, fast rebuilds for main process. The alternative — raw Vite + manual Electron scripts — requires more boilerplate and fragile process coordination.

### D2: Zustand for state management
**Choice**: Zustand over Redux Toolkit.
**Why**: Minimal boilerplate for a small initial surface area. No action creators, reducers, or middleware needed for "current repo" and "recent projects" state. Redux Toolkit can be adopted later if state grows complex (the patterns are compatible). Zustand stores are just hooks — easy to test.

### D3: shadcn/ui + Tailwind CSS for components
**Choice**: shadcn/ui over Mantine.
**Why**: Copy-paste component ownership — no runtime dependency on a component library version. Tailwind gives full styling control. The app will need heavily customized panels; owning the component code avoids fighting library abstractions.

### D4: better-sqlite3 for persistence (synchronous)
**Choice**: `better-sqlite3` directly, no ORM for now.
**Why**: The data model is trivial (one `recent_projects` table). An ORM adds complexity without payoff at this stage. better-sqlite3 is synchronous which simplifies main-process code. Drizzle or similar can be introduced when the schema grows.

### D5: simple-git for git operations
**Choice**: `simple-git` npm package.
**Why**: Wraps git CLI with a promise-based API. Avoids shelling out manually. Handles path escaping and error parsing. The alternative — `isomorphic-git` — doesn't support all git features and adds bundle size.

### D6: IPC via contextBridge + typed channels
**Choice**: Expose a typed API object through Electron's `contextBridge` in a preload script. Define channel names and payloads in `src/shared/ipc.ts`.
**Why**: Keeps renderer sandboxed (no `nodeIntegration`). Shared types give compile-time safety for IPC calls. The alternative — `ipcRenderer.invoke` with string channels — is error-prone and untyped.

### D7: Source layout
```
src/
  main/           # Electron main process
    index.ts      # App entry, window creation
    ipc/          # IPC handlers
    db/           # SQLite setup & queries
    git/          # Git operations (simple-git)
  preload/
    index.ts      # contextBridge exposure
  renderer/       # React app
    App.tsx
    stores/       # Zustand stores
    components/   # UI components
    pages/        # Welcome, Workspace
  shared/         # Types, IPC contracts
    ipc.ts
    types.ts
```

## Risks / Trade-offs

- **[Risk] electron-vite version churn** → Pin version, only upgrade deliberately. electron-vite is well-maintained but moves fast.
- **[Risk] better-sqlite3 native module compilation** → Requires `electron-rebuild` or `@electron/rebuild`. Add a postinstall script. CI must have build tools.
- **[Trade-off] Zustand now, maybe Redux later** → Migration cost is low (Zustand stores can be wrapped). Acceptable for Phase 1 scope.
- **[Trade-off] No ORM** → Raw SQL is fine for one table but won't scale. Plan to introduce Drizzle in Phase 2 when session/spec tables appear.
- **[Risk] Native file dialog on Linux/WSL** → Electron's `dialog.showOpenDialog` works on WSL2 with X server. Test early.

## Open Questions

- Exact Tailwind theme tokens / color palette — defer to first design review.
- Panel resize behavior (drag handles vs. fixed ratios) — start with fixed ratios, add resize in a follow-up.
