import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import type { ChangeArtifactSummary, ChangeSummary } from '../../shared/types'

const PRIMARY_ARTIFACTS: Array<{ id: string; path: string }> = [
  { id: 'proposal', path: 'proposal.md' },
  { id: 'design', path: 'design.md' },
  { id: 'tasks', path: 'tasks.md' }
]

export async function listChanges(repoPath: string): Promise<ChangeSummary[]> {
  const changesDir = join(repoPath, 'openspec', 'changes')

  let entries: import('fs').Dirent[]
  try {
    entries = await fs.readdir(changesDir, { withFileTypes: true })
  } catch (error) {
    if (isMissingPathError(error)) return []
    throw error
  }

  const changes = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name !== 'archive')
      .map(async (entry) => {
        const changeDir = join(changesDir, entry.name)
        const schema = await readSchema(changeDir)
        const artifacts = await listArtifacts(changeDir)
        const completed = artifacts.filter((artifact) => artifact.status === 'done').length

        return {
          name: entry.name,
          schema,
          status: `${completed}/${artifacts.length} done`,
          artifacts
        }
      })
  )

  return changes.sort((a, b) => a.name.localeCompare(b.name))
}

export async function readChangeArtifact(
  repoPath: string,
  changeName: string,
  artifactPath: string
): Promise<string> {
  const changeDir = join(repoPath, 'openspec', 'changes', changeName)
  const absoluteTarget = resolve(changeDir, artifactPath)
  const absoluteBase = resolve(changeDir)

  if (!absoluteTarget.startsWith(`${absoluteBase}/`) && absoluteTarget !== absoluteBase) {
    throw new Error('Invalid artifact path')
  }

  try {
    return await fs.readFile(absoluteTarget, 'utf8')
  } catch (error) {
    if (isMissingPathError(error)) {
      throw new Error('Artifact file not found')
    }
    throw error
  }
}

async function readSchema(changeDir: string): Promise<string> {
  const configPath = join(changeDir, '.openspec.yaml')
  try {
    const config = await fs.readFile(configPath, 'utf8')
    const schemaLine = config.split(/\r?\n/).find((line) => line.trim().startsWith('schema:'))
    if (!schemaLine) return 'unknown'
    const value = schemaLine.split(':').slice(1).join(':').trim()
    return value || 'unknown'
  } catch (error) {
    if (isMissingPathError(error)) return 'unknown'
    throw error
  }
}

async function listArtifacts(changeDir: string): Promise<ChangeArtifactSummary[]> {
  const primary = await Promise.all(
    PRIMARY_ARTIFACTS.map(async (artifact) => {
      const status = await getArtifactStatus(join(changeDir, artifact.path))
      return {
        id: artifact.id,
        path: artifact.path,
        status
      }
    })
  )

  const specArtifacts = await collectSpecArtifacts(changeDir)

  if (specArtifacts.length === 0) {
    primary.push({ id: 'specs', path: 'specs', status: 'ready' })
  }

  return [...primary, ...specArtifacts]
}

async function collectSpecArtifacts(changeDir: string): Promise<ChangeArtifactSummary[]> {
  const specsRoot = join(changeDir, 'specs')
  const results: ChangeArtifactSummary[] = []

  async function walk(currentDir: string): Promise<void> {
    let entries: import('fs').Dirent[]
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true })
    } catch (error) {
      if (isMissingPathError(error)) return
      throw error
    }

    for (const entry of entries) {
      const entryPath = join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(entryPath)
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue

      const relativePath = entryPath.slice(changeDir.length + 1)
      const status = await getArtifactStatus(entryPath)
      results.push({
        id: relativePath,
        path: relativePath,
        status
      })
    }
  }

  await walk(specsRoot)
  return results.sort((a, b) => a.path.localeCompare(b.path))
}

async function getArtifactStatus(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return content.trim() ? 'done' : 'ready'
  } catch (error) {
    if (isMissingPathError(error)) return 'blocked'
    throw error
  }
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}
