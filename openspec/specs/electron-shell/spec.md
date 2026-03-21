# Capability: Electron Shell

## Purpose
Electron main process setup including window creation, preload script, IPC bridge, and application menu.

## Requirements

### Requirement: App launches with a single main window
The Electron app SHALL create a single `BrowserWindow` on startup, loading the renderer entry point. The window SHALL have a minimum size of 900×600 pixels.

#### Scenario: Cold start
- **WHEN** the user launches the application
- **THEN** a single window appears with the React renderer loaded and the welcome screen visible

#### Scenario: Window minimum size enforced
- **WHEN** the user attempts to resize the window below 900×600
- **THEN** the window SHALL NOT shrink below 900×600 pixels

### Requirement: Preload script exposes typed IPC bridge
The main process SHALL expose a typed API object to the renderer via `contextBridge.exposeInMainWorld`. The renderer SHALL NOT have `nodeIntegration` enabled. All main↔renderer communication SHALL go through defined IPC channels in `src/shared/ipc.ts`.

#### Scenario: Renderer calls main process
- **WHEN** the renderer invokes an exposed IPC method (e.g., `window.api.openRepo()`)
- **THEN** the call is forwarded to the main process via `ipcMain.handle` and the result is returned

#### Scenario: Node APIs not directly accessible
- **WHEN** renderer code attempts to access `require`, `process`, or `fs` directly
- **THEN** those APIs SHALL be undefined (sandbox enforced)

### Requirement: Application menu with basic items
The app SHALL display a native menu bar with at minimum: File → Open Repo, File → Quit.

#### Scenario: Open Repo menu item
- **WHEN** the user clicks File → Open Repo
- **THEN** the native folder picker dialog opens

#### Scenario: Quit menu item
- **WHEN** the user clicks File → Quit
- **THEN** the application closes gracefully

### Requirement: IPC channel type safety
All IPC channels SHALL be defined as TypeScript types in `src/shared/ipc.ts`, with request and response types for each channel.

#### Scenario: Type mismatch caught at compile time
- **WHEN** a developer writes an IPC handler or caller with mismatched types
- **THEN** the TypeScript compiler SHALL report an error
