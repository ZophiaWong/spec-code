## 1. Project Scaffolding

- [x] 1.1 Initialize npm project with `package.json` (name: spec-code, type: module)
- [x] 1.2 Install core dependencies: electron, electron-vite, react, react-dom, typescript, tailwindcss, better-sqlite3, simple-git
- [x] 1.3 Install dev dependencies: @types/react, @types/react-dom, @electron/rebuild, postcss, autoprefixer
- [x] 1.4 Configure `electron-vite` with main/preload/renderer entry points in `electron.vite.config.ts`
- [x] 1.5 Configure TypeScript (`tsconfig.json` for main, preload, renderer) with strict mode
- [x] 1.6 Configure Tailwind CSS with `tailwind.config.ts` and base styles
- [x] 1.7 Add postinstall script for `@electron/rebuild` (better-sqlite3 native module)
- [x] 1.8 Create source directory structure: `src/main/`, `src/preload/`, `src/renderer/`, `src/shared/`

## 2. Shared Types & IPC Contract

- [x] 2.1 Define IPC channel types in `src/shared/ipc.ts` (repo:open, repo:getInfo, projects:list, projects:clear)
- [x] 2.2 Define shared data types in `src/shared/types.ts` (RepoInfo, RecentProject)

## 3. Electron Main Process

- [x] 3.1 Create `src/main/index.ts`: app ready handler, BrowserWindow creation (900×600 min size), load renderer
- [x] 3.2 Create `src/main/menu.ts`: native menu with File → Open Repo, File → Quit
- [x] 3.3 Create `src/main/db/index.ts`: SQLite init at `app.getPath('userData')`, create `recent_projects` table
- [x] 3.4 Create `src/main/db/recent-projects.ts`: upsert, list (top 20 by recency), clear, remove operations
- [x] 3.5 Create `src/main/git/index.ts`: open-dialog + git validation, getRepoInfo (name, branch, last commit) using simple-git
- [x] 3.6 Create `src/main/ipc/index.ts`: register IPC handlers for repo:open, repo:getInfo, projects:list, projects:clear
- [x] 3.7 Wire menu "Open Repo" to send IPC event to renderer or directly invoke repo:open handler

## 4. Preload Script

- [x] 4.1 Create `src/preload/index.ts`: expose typed API object via `contextBridge.exposeInMainWorld`
- [x] 4.2 Expose methods: `openRepo()`, `getRepoInfo(path)`, `listProjects()`, `clearProjects()`, `onRepoOpened(callback)`

## 5. Renderer: Stores & State

- [x] 5.1 Install and configure shadcn/ui (init with Tailwind, add base components)
- [x] 5.2 Create `src/renderer/stores/repo-store.ts`: Zustand store for current repo (path, name, branch, lastCommit)
- [x] 5.3 Create `src/renderer/stores/projects-store.ts`: Zustand store for recent projects list

## 6. Renderer: UI Components & Layout

- [x] 6.1 Create `src/renderer/App.tsx`: root component, conditional render welcome vs workspace
- [x] 6.2 Create `src/renderer/components/Layout.tsx`: three-panel layout (left 20%, center 60%, right 20%, min-widths)
- [x] 6.3 Create `src/renderer/pages/WelcomePage.tsx`: "Open Repo" button + recent projects list
- [x] 6.4 Create `src/renderer/pages/WorkspacePage.tsx`: repo info display (name, branch, last commit) in center panel
- [x] 6.5 Create left sidebar placeholder component
- [x] 6.6 Create right sidebar placeholder component
- [x] 6.7 Handle stale recent-project clicks: validate path exists, show error and remove if missing

## 7. Integration & Verification

- [x] 7.1 Verify app launches, window appears at correct minimum size
- [ ] 7.2 Verify Open Repo flow: dialog → git validation → repo info displayed
- [ ] 7.3 Verify non-git folder shows error message
- [ ] 7.4 Verify recent projects persist across app restarts
- [ ] 7.5 Verify clicking a recent project opens the repo directly
