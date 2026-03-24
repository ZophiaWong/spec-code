import { promises as fs } from 'fs'
import { execFile } from 'child_process'
import { join } from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export async function createSpec(repoPath: string, name: string): Promise<void> {
  validateName(name)

  const specDir = join(repoPath, 'openspec', 'specs', name)
  try {
    await fs.mkdir(specDir, { recursive: false })
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      throw new Error(`Spec "${name}" already exists`)
    }
    if (isMissingPathError(error)) {
      throw new Error('openspec directory not found in repository')
    }
    throw error
  }

  const specPath = join(specDir, 'spec.md')
  const title = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  await fs.writeFile(specPath, `# ${title}\n\n## Purpose\n\n`, 'utf8')
}

export async function createChange(repoPath: string, name: string): Promise<void> {
  validateName(name)

  try {
    await execFileAsync('openspec', ['new', 'change', name], { cwd: repoPath })
  } catch (error) {
    if (isExecErrorWithCode(error, 'ENOENT')) {
      throw new Error('openspec CLI is not installed or not available on PATH')
    }
    const message = getExecErrorMessage(error)
    throw new Error(message || `Failed to create change "${name}"`)
  }
}

function validateName(name: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error('Name must be kebab-case (lowercase letters, numbers, and hyphens)')
  }
}

function isAlreadyExistsError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST'
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}

function isExecErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code
}

function getExecErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''

  if ('stderr' in error && typeof error.stderr === 'string' && error.stderr.trim()) {
    return error.stderr.trim()
  }

  if ('message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return ''
}
