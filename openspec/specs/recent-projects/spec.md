# Capability: Recent Projects

## Purpose
SQLite-backed persistence of recently opened projects, including database initialization, recording, listing, and welcome screen integration.

## Requirements

### Requirement: SQLite database initialization
The system SHALL create a SQLite database file at a platform-appropriate user data path (Electron `app.getPath('userData')`) on first launch. The database SHALL contain a `recent_projects` table with columns: `id` (INTEGER PRIMARY KEY), `path` (TEXT UNIQUE), `name` (TEXT), `opened_at` (TEXT ISO-8601).

#### Scenario: First launch creates database
- **WHEN** the app launches for the first time
- **THEN** a SQLite database file is created with the `recent_projects` table schema

#### Scenario: Subsequent launches reuse database
- **WHEN** the app launches and the database already exists
- **THEN** the existing database is opened without schema changes

### Requirement: Record opened project
When a repo is successfully opened, the system SHALL upsert a record in `recent_projects` with the repo's path, name, and current timestamp.

#### Scenario: New project recorded
- **WHEN** a repo is opened for the first time
- **THEN** a new row is inserted into `recent_projects`

#### Scenario: Existing project timestamp updated
- **WHEN** a previously-opened repo is opened again
- **THEN** the `opened_at` timestamp is updated (upsert on `path`)

### Requirement: List recent projects ordered by recency
The system SHALL provide an IPC handler `projects:list` that returns recent projects ordered by `opened_at` descending, limited to the 20 most recent.

#### Scenario: Projects returned in order
- **WHEN** the renderer requests the recent projects list
- **THEN** projects are returned sorted by most recently opened first, max 20 items

#### Scenario: No projects yet
- **WHEN** the database has no records
- **THEN** an empty array is returned

### Requirement: Welcome screen shows recent projects
The welcome/start screen SHALL display the list of recent projects. Each item SHALL show the project name and path. Clicking a project item SHALL open that repo directly (without the folder picker).

#### Scenario: Click recent project to open
- **WHEN** the user clicks a recent project entry
- **THEN** the system validates the path still exists and is a git repo, then opens it

#### Scenario: Recent project path no longer exists
- **WHEN** the user clicks a recent project whose path no longer exists on disk
- **THEN** the system displays an error message and removes the entry from the list

### Requirement: Clear recent projects
The system SHALL provide an IPC handler `projects:clear` to delete all records from `recent_projects`.

#### Scenario: Clear all recent projects
- **WHEN** the user or system triggers clear
- **THEN** all records are removed and the welcome screen shows an empty list
